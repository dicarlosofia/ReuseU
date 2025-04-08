import datetime
import random

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

def print_all_content():
    # print db content
    db_content = ref.get()
    print("database content:", db_content)

def add_account(account_data):
    # notice we read the number of accounts here and increment by 1
    accounts = ref.child('Account').get()
    new_key = str(len(accounts)) if accounts else "1"
    account_data['UserID'] = new_key
    ref.child('Account').child(new_key).set(account_data)


# generates accs for testing purposes
def generate_random_account():
    # sample data lists
    first_names = ["trung", "bob", "krishna", "diana", "ethan", "fiona", "george", "hannah", "ivan", "julia"]
    last_names = ["smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "davis"]
    colleges = ["grinnell college", "harvard university", "boston college", "ripon college", "yale university", "princeton university"]

    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    college = random.choice(colleges)
    # random phone: xxx-xxx-xxxx
    phone = f"{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
    username = first_name + str(random.randint(10,99))
    creation_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

    return {
        'First_name': first_name,
        'Last_name': last_name,
        'PhoneNumber': phone,
        'School': college,
        'Username': username,
        'dateTime_creation': creation_time
    }

def print_all_accounts():
    accounts = ref.child('Account').get()
    if not accounts:
        print("no accounts found")
        return
    for idx, account in enumerate(accounts, start=0):
        if account is not None:
            print("account key: " + str(idx))
            for field, value in account.items():
                print("  " + field + ": " + str(value))
            print("-" * 20)


def load_dummy_accounts(num):
    for i in range(num):
        acc = generate_random_account()
        add_account(acc)



def delete_acc(account_id):
    ref.child('Account').child(str(account_id)).delete()

def delete_acc_range(min,max):
    for i in range(min,max):
        delete_acc(i)

load_dummy_accounts(200)
#delete_acc_range(1,12)
print_all_content()
print_all_accounts()




