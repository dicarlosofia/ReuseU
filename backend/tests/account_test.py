import firebase_admin
import pytest
from firebase_admin import credentials, db

from services.account_service import add_account, delete_acc, get_acc
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

#for i in range(20):

account_id = add_account({
         'First_name': 'Krishna',
        'Last_name': 'Nayar',
        'PhoneNumber': '713-775-9080',
        'School': 'grinnell',
        'Username': 'kanayar21',
        'dateTime_creation': '2025-04-08T18:56:02.560105Z'
    })



compare = get_acc(account_id)

def test_get():
    assert compare['First_name'] == 'Krishna'
    assert compare['Last_name'] == 'Nayar'
    assert compare['PhoneNumber'] == '713-775-9080'
    assert compare['School'] == 'grinnell'
    assert compare['Username'] == 'kanayar21'
    assert compare['dateTime_creation'] == '2025-04-08T18:56:02.560105Z'

delete_acc(account_id)

def test_deletion():
    if not ref.child('Account').get():
        with pytest.raises(NotFoundError, match= "No accounts found."):
            get_acc(1)
    else:
        with pytest.raises(NotFoundError, match= f"Account {account_id} not found."):
            get_acc(account_id)
    