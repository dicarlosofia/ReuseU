import firebase_admin
import pytest
from firebase_admin import credentials, db

from services.transaction_service import add_transaction, delete_transaction, get_transaction
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

transaction_id = add_transaction({
        'BuyerID': 7,
        'DateTransaction': 'now',
        'ListingID': 9,
        'Price': 0,
        'SellerID': 8
    })

compare = get_transaction(transaction_id)

def test_get():
    assert compare['BuyerID'] == 7
    assert compare['DateTransaction'] == 'now'
    assert compare['ListingID'] == 9
    assert compare['Price'] == 0
    assert compare['SellerID'] == 8

delete_transaction(transaction_id)

def test_deletion():
    with pytest.raises(NotFoundError, match= f"Transaction for listing {transaction_id} not found."):
        get_transaction(transaction_id)
