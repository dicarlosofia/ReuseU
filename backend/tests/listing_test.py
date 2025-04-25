import firebase_admin
import pytest
from firebase_admin import credentials, db

from services.listing_service import add_listing, del_listing, get_listing
from services.exceptions import NotFoundError


try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate("pk.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
    })
# get root ref
ref = db.reference('/')

listing_id = add_listing({
        'Category': 'mine',
        'CreateTime': 'now',
        'Description': 'thing',
        'Images': {
            1: 'mine',
            2: 'now'
        },
        'Price': 800,
        'SellStatus': 1,
        'Title': 'this',
        'UserID': 8
    })

compare = get_listing(listing_id)

def test_get():
    assert compare['Category'] == 'mine'
    assert compare['CreateTime'] == 'now'
    assert compare['Description'] == 'thing'
    assert compare['Price'] == 800
    assert compare['SellStatus'] == 1
    assert compare['Title'] == 'this'
    assert compare['UserID'] == 8

del_listing(listing_id)

def test_deletion():
    if not ref.child('Listing').get():
        with pytest.raises(NotFoundError, match= "No listings found."):
            get_listing(1)
    else:
        with pytest.raises(NotFoundError, match= f"Listing {listing_id} not found."):
            get_listing(listing_id)
