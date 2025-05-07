'''
Blob Storage:
- This file will handle the blob storage for ReuseU, meaning the storage for
  image files that the website will use to display.

Author(s): Peter Murphy
'''
import io
import json
import re
import os
import base64
import random
from PIL import Image

import boto3
from botocore.client import Config
import numpy as np

#test

def connect_to_blob_db_resource():
    # Get the absolute path to the credentials file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    cred_path = os.path.join(backend_dir, "pk2.json")
    
    with open(cred_path, "r") as f:
        cfg = json.load(f)

    s3 = boto3.resource(
        "s3",
        endpoint_url=cfg["endpoint_url"],
        aws_access_key_id=cfg["aws_access_key_id"],
        aws_secret_access_key=cfg["aws_secret_access_key"],
        region_name=cfg.get("region_name", "auto"),
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


# this should not be used...could cause duplicatation errors, use upload_files instead
def upload_file_to_bucket(s3_resource, listing_id, data_bytes):
    bucket = s3_resource.Bucket("listing-images")
    listing_indicator = "x%Tz^Lp&"
    name_indicator = "*Gh!mN?y"
    
    # Convert base64 string to bytes if needed
    if isinstance(data_bytes, str):
        # Remove data URL prefix if present
        if data_bytes.startswith('data:image'):
            data_bytes = data_bytes.split(',')[1]
        data_bytes = base64.b64decode(data_bytes)
    
    data_bytes = compress_image(data_bytes, 10)
    image_name = str(random.randint(10000, 99999))
    bucket.put_object(Key=(listing_indicator + str(listing_id) + name_indicator + image_name), Body=data_bytes)


def upload_files_to_bucket(s3_resource, listing_id, data_bytes_list):
    bucket = s3_resource.Bucket("listing-images")
    listing_indicator = "x%Tz^Lp&"
    name_indicator = "*Gh!mN?y"

    def pad_base64(b64_string):
        """Pad base64 string to correct length for decoding."""
        return b64_string + '=' * (-len(b64_string) % 4)

    uploaded_keys = []
    name_counter = 1
    for data_bytes in data_bytes_list:
        if isinstance(data_bytes, str):
            # Remove data URL prefix if present
            if data_bytes.startswith('data:image'):
                data_bytes = data_bytes.split(',')[1]
            # Ensure correct base64 padding before decoding
            data_bytes = base64.b64decode(pad_base64(data_bytes))
        key = listing_indicator + str(listing_id) + name_indicator + str(name_counter)
        bucket.put_object(Key=key, Body=data_bytes)
        uploaded_keys.append(key)
        name_counter += 1
    return uploaded_keys


def get_images_from_bucket(s3_resource, listing_id):
    listing_indicator = "x%Tz^Lp&"
    bucket = s3_resource.Bucket("listing-images")
    prefix = listing_indicator + str(listing_id)
    images = []
    for obj_summary in bucket.objects.filter(Prefix=prefix):
        data = obj_summary.get()["Body"].read()
        images.append((obj_summary.key, data))
    return images


# Generate a signed URL to access a private image file
def get_image_url_from_key(key: str, s3_resource=None) -> str:
    bucket_name = "listing-images"
    s3_resource = s3_resource or connect_to_blob_db_resource()
    return s3_resource.meta.client.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket_name, 'Key': key},
        ExpiresIn=3600  # 1 hour
    )


# the actual downscale function that resizes
def downscale_image(img: Image.Image, scale: float = 0.9) -> Image.Image:
    w, h = img.size
    return img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

def compress_image(
    img_input,
    max_kb: int,
    scale: float = 0.5,
    initial_quality: int = 85,
    min_quality: int = 20
) -> bytes:
    # check if its an image using pillow lib
    if isinstance(img_input, Image.Image):
        img = img_input
    else:
        if isinstance(img_input, str) and img_input.startswith("data:image"):
            img_input = base64.b64decode(img_input.split(",",1)[1])
        if isinstance(img_input, (bytes, bytearray)):
            img = Image.open(io.BytesIO(img_input))
        else:
            raise ValueError("Unsupported input type")
        img = img.convert("RGB")  #ensure color

    max_bytes = max_kb * 1024
    quality = initial_quality
    while True:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
        data = buf.getvalue()
        if len(data) <= max_bytes:
            return data

        # if check if need to downscale quality
        if quality > min_quality:
            quality = max(min_quality, quality - 5)
        else:
            # downscale if need be
            img = downscale_image(img, scale=scale)
            quality = initial_quality



if __name__ == "__main__":
    pass

    #s3 = connect_to_blob_db_resource()
    #files = get_all_files(s3)
    #print("Downloaded", len(files), "objects.")
    #for key, data in files:
        #print(key, len(data), "bytes")

    #with open("/Users/pmurphy01/Desktop/test123.jpg", "rb") as f:
         #data = f.read()
    #print("HERE")
    #data = compress_image(data,1)
    #print("THERE")
    #upload_file_to_bucket(s3,"JOE12",  data)  #-> start here
    #print("uploaded")
#test