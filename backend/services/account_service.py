import firebase_admin
from firebase_admin import credentials, db


def get_db_root():
    # check if app exists, init if not
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("pk.json")
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
        })
    # get root ref
    ref = db.reference('/')
    return ref

ref = get_db_root()

def add_account(account_data):
    # notice we read the number of accounts here and increment by 1
    accounts = ref.child('Account').get()
    new_key = str(len(accounts)) if accounts else "1"
    account_data['UserID'] = new_key
    ref.child('Account').child(new_key).set(account_data)

def delete_acc(account_id):
    ref.child('Account').child(str(account_id)).delete()


def delete_acc_range(min,max):
    for i in range(min,max):
        delete_acc(i)

def get_acc(account_id):
    accounts = ref.child('Account').get()
    if not accounts:
        print("no accounts found")
        return
    for account in accounts:
        if account is not None:
            for field, value in account.items():
                if field == "UserID" and int(value) == int(account_id):
                    print(account)
                    return account
    print("account not found")
    return None

#get_acc(1)