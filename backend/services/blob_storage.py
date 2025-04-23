'''
Blob Storage:
- This file will handle the blob storage for ReuseU, meaning the storage for
  image files that the website will use to display.

Author(s): Peter Murphy
'''
import json
import re

import boto3
from botocore.client import Config
import cv2
import numpy as np


def connect_to_blob_db_resource():
    with open("pk2.json", "r") as f:
        cfg = json.load(f)

    s3 = boto3.resource(
        "s3",
        endpoint_url=cfg["endpoint_url"],
        aws_access_key_id=cfg["aws_access_key_id"],
        aws_secret_access_key=cfg["aws_secret_access_key"],
        config=Config(
            signature_version="s3v4",
            s3={"addressing_style": "path"}
        )
    )
    return s3



def get_all_files(s3_resource):
    bucket_name = "listing-images"
    all_files = []
    bucket = s3_resource.Bucket(bucket_name)
    for obj_summary in bucket.objects.filter(Prefix=""):
        all_files.append(
            (obj_summary.key,
             obj_summary.get()["Body"].read())
        )
    return all_files


def get_files_listing_id(s3_resource, listing_id):
    bucket = s3_resource.Bucket("listing-images")
    listing_indicator = "x%Tz^Lp&"
    name_indicator    = "*Gh!mN?y"

    # here we use a regex to find all files with a particular listing id
    pattern = re.compile(
        r"^" +
        re.escape(listing_indicator) +
        re.escape(str(listing_id)) +
        re.escape(name_indicator) +
        r"(.+)$"
    )

    matched_files = []
    for obj_summary in bucket.objects.filter(Prefix=""):
        key = obj_summary.key
        m = pattern.match(key)
        if not m:
            continue
        # key matches this listing_id then fetch its bytes
        data = obj_summary.get()["Body"].read()
        matched_files.append((key, data))
    return matched_files


def upload_file_to_bucket(s3_resource, image_name,listing_id, data_bytes):
    bucket = s3_resource.Bucket("listing-images")
    listing_indicator = "x%Tz^Lp&"
    name_indicator = "*Gh!mN?y"
    data_bytes = compress_image(data_bytes,10)
    bucket.put_object(Key=(listing_indicator + str(listing_id) + name_indicator + image_name), Body=data_bytes)

def upload_files_to_bucket(s3_resource, files):
    for image_name,listing_id, data in files:
        upload_file_to_bucket(s3_resource, image_name,listing_id, data)


#downscale an image with default return of 90% pixels
def downscale_image(img, scale=0.9):
    h, w = img.shape[:2]
    new_dim = (int(w * scale), int(h * scale))
    return cv2.resize(img, new_dim)


#return a compressed image until we have the correct size
def compress_image(img, max_kb):

    #check if image type is a series of bytes, if so convert to an img
    if isinstance(img, (bytes, bytearray)):
        arr = np.frombuffer(img, dtype=np.uint8)
        img = cv2.imdecode(arr,cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not convert the given crap to an image")

    max_bytes = max_kb * 1024
    compressed = img.copy()

    #keep downscaling until we hit the correct bytesize
    while True:
        ok, buf = cv2.imencode('.jpg', compressed)
        if not ok:
            break
        size = len(buf)
        if size <= max_bytes:
            return buf.tobytes()
        compressed = downscale_image(compressed)

if __name__ == "__main__":
    s3 = connect_to_blob_db_resource()
    files  = get_all_files(s3)
    #files = get_files_listing_id(s3,1)
    print("Downloaded", len(files), "objects.")
    for key, data in files:
        print(key, len(data), "bytes")

    #with open("/Users/pmurphy01/Desktop/howies_meat.jpg", "rb") as f:
    #    data = f.read()

    #data = compress_image(data,1000)

    #upload_file_to_bucket(s3,"howies_meat_1mb_limit", 1, data)
