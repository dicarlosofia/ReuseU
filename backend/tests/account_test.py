import firebase_admin
from firebase_admin import credentials, db

from services.account_service import add_account, delete_acc, get_acc



try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate("pk.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
    })
# get root ref
ref = db.reference('/')

account_id = add_account({
        'First_name': 'Krishna',
        'Last_name': 'Nayar',
        'PhoneNumber': '713-775-9080',
        'School': 'grinnell',
        'Username': 'kanayar21',
        'dateTime_creation': '2025-04-08T18:56:02.560105Z'
    })

# accounts = ref.child('Account').get()
# for idx, account in enumerate(accounts, start=0):
#     if account is not None:
#         acc_total +=1

assert get_acc(account_id)['First_name'] == 'Krishna'
assert get_acc(account_id)['Last_name'] == 'Nayar'
assert get_acc(account_id)['PhoneNumber'] == '713-775-9080'
assert get_acc(account_id)['School'] == 'grinnell'
assert get_acc(account_id)['Username'] == 'kanayar21'
assert get_acc(account_id)['dateTime_creation'] == '2025-04-08T18:56:02.560105Z'

delete_acc(account_id)

