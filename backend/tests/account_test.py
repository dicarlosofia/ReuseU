import firebase_admin
from firebase_admin import credentials, db

import sys
sys.path.insert(0, '/Users/kanayar21/ReuseU/backend/services')
from account_service import add_account, delete_acc, get_acc

try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate("pk.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
    })
# get root ref
ref = db.reference('/')

acc_total = 0

add_account({
        'First_name': 'Krishna',
        'Last_name': 'Nayar',
        'PhoneNumber': '713-775-9080',
        'School': 'grinnell',
        'Username': 'kanayar21',
        'dateTime_creation': '2025-04-08T18:56:02.560105Z'
    })

accounts = ref.child('Account').get()
for idx, account in enumerate(accounts, start=0):
    if account is not None:
        acc_total +=1

delete_acc(acc_total)


