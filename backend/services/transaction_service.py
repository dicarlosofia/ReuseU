import firebase_admin
from firebase_admin import credentials, db

# get the database root
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

# adds a transaction to the database using the dictionary above
def add_transaction(transaction_data):
    # notice we read the number of accounts here and increment by 1
    new_key = transaction_data['ListingID']
    ref.child('Transaction').child(str(new_key)).set(transaction_data)


# delete a transaction in the database using listing id as the key
def delete_transaction(listing_id):
    ref.child('Transaction').child(str(listing_id)).delete()

# get the content of a transaction using the listing id as the parameter
def get_transaction(listing_id):
    transactions = ref.child('Transaction').get()
    if not transactions:
        print("no transactions found")
        return
    for transaction in transactions:
        if transaction is not None:
            for field, value in transaction.items():
                if field == "ListingID" and int(value) == int(listing_id):
                    print(transaction)
                    return transaction
    print("transaction not found")

#get_transaction(3)
