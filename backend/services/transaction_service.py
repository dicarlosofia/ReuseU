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

#Inputs: dictionary account data of form:
# {BuyerID': buyer_id,
#'DateTransaction': date_transaction,
#'ListingID': listing_id,
#'Price': price,
#'SellerID': seller_id}


def add_transaction(transaction_data):
    # notice we read the number of accounts here and increment by 1
    new_key = transaction_data['ListingID']
    ref.child('Transaction').child(str(new_key)).set(transaction_data)



def delete_transaction(listing_id):
    ref.child('Transaction').child(str(listing_id)).delete()
