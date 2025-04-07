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

'''
*********************************Listings**************************************
Inputs: dictionary listing data of form:
{Categories} (a dictionary of strings via the frontend)
{CreateTime} (string in format: 2025-03-25T13:00:00Z)
{Description} (string)
{Images} (a nested dictionary of strings, with a key associated to each image. 
That way, if the image is the default name, each image will still be unique)

**listing ID created dynamically**

{Price} (Integer)
{SellStatus} (The Integer 0 or 1)
{Title} (String)
{UserID} (Integer)
'''

def add_listing(listing_data):
    # notice we read the number of listings here and increment by 1
    listings = ref.child('Listing').get()
    new_key = str(len(listings)) if listings else "1"
    listing_data['ListingID'] = new_key
    ref.child('Listing').child(new_key).set(listing_data)

'''
A function that deletes a listing from the Listing table.

credit: users Peter Haddad and Kevin on Stack Overflow,
https://stackoverflow.com/questions/59016092/how-to-delete-from-firebase-
realtime-database-use-python
'''
def del_listing(listing_id):
    # Connect to the database
    ref.child('Listing').child(str(listing_id)).delete()


    
