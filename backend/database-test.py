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
# Macro message that identifies absent listing
listing_absent_msg = '''
Specified listing does not exist.
'''

def add_listing(listing_data):
    # notice we read the number of listings here and increment by 1
    listings = ref.child('Listing').get()
    new_key = str(len(listings)) if listings else "1"
    listing_data['ListingID'] = new_key
    ref.child('Listing').child(new_key).set(listing_data)

'''
A function that deletes a listing from the listings table.

credit: users Peter Haddad and Kevin on Stack Overflow,
https://stackoverflow.com/questions/59016092/how-to-delete-from-firebase-
realtime-database-use-python
'''
def del_listing(listing_id):
    # Connect to the database
    listings = ref.child('Listing').get()

    # Make sure that listing exists, if so, delete it.
    for key,val in listings.items():
        if (listing_id == val['listing']):
            delete_listing_ref = ref.child(key)
            delete_listing_ref.set(None)
            delete_listing_ref.delete()
    # If not, reflect that.
        else:
            print(listing_absent_msg)

    
# generates listings for testing purposes
def generate_random_listing():
    # sample data lists
    categories = {
        "Price": ["Under $10", 
                  "$10 - $50", 
                  "$50 - $100", 
                  "$100 - $500", 
                  "Above $500"],
        "Kitchen": ["Cookware", 
                    "Appliances", 
                    "Utensils", 
                    "Storage", 
                    "Dinnerware"],
        "Furniture": ["Chairs", 
                      "Tables", 
                      "Beds", 
                      "Desks", 
                      "Storage"],
        "Electronics": ["Laptops", 
                        "Phones", 
                        "Tablets", 
                        "TVs", 
                        "Audio"],
        "Clothing": ["Shirts", 
                     "Tops", 
                     "Bottoms", 
                     "Dresses", 
                     "Accessories"],
        "Miscellaneous": ["Books", 
                          "Toys", 
                          "Art",
                          "Crafts", 
                          "Other"]
    }
    # Strings in format: "Still in good condition, barely used."
    descriptions = [
        "Still in good condition, barely used.",
        "Like new, only used a couple of times.",
        "Some wear and tear, but works perfectly.",
        "Brand new, never opened.",
        "Moderate use, but all functions are intact.",
        "Well-maintained, only minor scratches.",
        "Used frequently, but no major damage.",
        "Rarely used, kept in storage most of the time.",
        "Has a few dents, but still works as expected.",
        "Pristine condition, includes original packaging."
    ]
    # Dictionary of strings with integer keys
    images = {
        1: "image1.png",
        2: "image2.png",
        3: "myDellLaptop.jpg",
        4: "nike_air_forces.jpeg",
        5: "image1.png",
        6: "myOldSweater.heic",
        7: "image3.png"
    }
    # Strings; ex: "Dell Laptop"
    titles = [
        "Dell Laptop",
        "iPhone 12",
        "Sony Headphones",
        "Gaming Chair",
        "Canon DSLR Camera",
        "Vintage Leather Jacket",
        "Wooden Dining Table",
        "Mountain Bike",
        "Electric Guitar",
        "Cookware Set"
    ]
    # Ints
    UserIDs = [123, 245, 387, 412, 569, 678, 734, 802, 915, 999]
    
    category = random.choice(list(categories.values))
    creation_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    description = random.choice(descriptions)
    image = random.choice(images.values)
    # random price: xxx.xx
    price = f"{random.randint(0,999)}.{random.randint(10,99)}"
    sell_status = random.randint(0,1)
    title = random.choice(titles)
    user_ID = random.choice(UserIDs)

    return {
        'Category': category,
        'CreateTime': creation_time,
        'Description': description,
        'Images': image,
        'Price': price,
        'SellStatus': sell_status,
        'Title': title,
        'UserID': user_ID
    }

def print_all_listings():
    listings = ref.child('Listing').get()
    if not listings:
        print("no listings found")
        return
    for idx, listing in enumerate(listings, start=0):
        if listing is not None:
            print("listing key: " + str(idx))
            for field, value in listing.items():
                print("  " + field + ": " + str(value))
            print("-" * 20)


def load_dummy_listings(num):
    for i in range(num):
        acc = generate_random_listing()
        add_listing(acc)

load_dummy_listings(20)
'''
*********************************Listings**************************************
Inputs: dictionary listing data of form:
{ListingID}
{Rating}
{Review}
{ReviewDate}
{ReviewerID}
{SellerID}
'''
# Macro message that identifies absent listing
review_absent_msg = '''
Specified review does not exist.
'''

def add_review(listing_id):
    # notice we read the number of reviews here and increment by 1
    reviews = ref.child('Review').get()
    new_key = str(len(reviews)) if reviews else "1"
    review_data['ReviewID'] = new_key
    ref.child('Review').child(new_key).set(review_data)
    


'''*************************************************************************'''


load_dummy_accounts(200)
#delete_acc_range(1,12)
print_all_content()
print_all_accounts()




