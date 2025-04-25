import firebase_admin
import pytest
from firebase_admin import credentials, db

from services.review_service import add_review, del_review, get_review
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

review_id = add_review({
        'ListingID': 7,
        'Rating': 5,
        'Review': "top of the line",
        'ReviewDate': "now",
        'ReviewerID': 0,
        'SellerID': 6
    })

compare = get_review(review_id)

def test_get():
    assert compare['ListingID'] == 7
    assert compare['Rating'] == 5
    assert compare['Review'] == "top of the line"
    assert compare['ReviewDate'] ==  "now"
    assert compare['ReviewerID'] == 0
    assert compare['SellerID'] == 6

del_review(review_id)

def test_deletion():
    with pytest.raises(NotFoundError, match= f"Review for listing {review_id} not found."):
        get_review(review_id)