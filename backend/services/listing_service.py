import firebase_admin
from firebase_admin import credentials, db


#get the root of the database
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

# gets content of a listing in dictionary format from a listing_id
def get_listing(listing_id):
    listings = ref.child('Listing').get()
    if not listings:
        print("no listings found")
        return
    for listing in listings:
        if listing is not None:
            for field, value in listing.items():
                if field == "ListingID" and int(value) == int(listing_id):
                    print(listing)
                    return listing
    print("listing not found")

# returns a list of all listings (dictionary format)  from a particular account
def get_all_listings_user(account_id):
    listings = ref.child('Listing').get()
    found_listings = []
    if not listings:
        print("no listings found")
        return
    for listing in listings:
        if listing is not None:
            for field, value in listing.items():
                if field == "UserID" and int(value) == int(account_id):
                    found_listings.append(listing)
    if not found_listings:
        print("user had no listings")
        return None
    else:
        print(found_listings)
        return found_listings

# gets ALL listings in the database
def get_all_listings_total():
    listings = ref.child('Listing').get()
    all_listings = []
    if not listings:
        print("no listings found")
        return
    for listing in listings:
        if listing is not None:
                all_listings.append(listing)
    print(all_listings)
    return all_listings

# a duplicate function as get_listing
def get_listing_by_id(listing_id):
    listings = ref.child('Listing').get()
    if not listings:
        print("no listings found")
        return
    for listing in listings:
        if listing is not None:
            for field, value in listing.items():
                if field == "ListingID" and int(value) == int(listing_id):
                    return listing
    print("listing not found")


#get_listing(1)
#get_all_listings_user(802)
#get_all_listings_total()

    
