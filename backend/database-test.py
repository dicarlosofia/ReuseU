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

#Inputs: dictionary account data of form:
# {BuyerID': buyer_id,
#'DateTransaction': date_transaction,
#'ListingID': listing_id,
#'Price': price,
#'SellerID': seller_id}
def add_transaction(transaction_data):
    # notice we read the number of accounts here and increment by 1
    new_key = transaction_data['ListingID']
    ref.child('Transaction').child(new_key).set(transaction_data)

def delete_transaction(listing_id):
    ref.child('Transaction').child(str(listing_id)).delete()


#Inputs: dictionary account data of form:
# {LastTime': last_time,
#'MessageContent': message_content,
#'UserID': user_id,
#'ListingID': listing_id}
def add_message(message_data):
    # notice we read the number of accounts here and increment by 1
    messages = ref.child('Message').get()
    new_key = str(len(messages)) if messages else "1"
    message_data['MessageID'] = new_key
    listing_id_temp = message_data['ListingID']
    message_data.pop("ListingID")
    ref.child('Message').child(new_key).set(message_data)

    target_chat = None
    chat_exists = False
    chats = ref.child('Chat').get()
    for chat in chats:
        for field, value in chat.items():
            if field == 'ListingID':
                if int(value) == listing_id_temp:
                    target_chat = chat
                    chat_exists = True

    if chat_exists:
        target_chat["Messages"] = target_chat["Messages"].append(message_data)
        ref.child('Chat').child(new_key).set(target_chat)
    else:
        new_key = listing_id_temp
        new_chat = {}
        new_chat["ListingID"] = listing_id_temp
        new_chat["Messages"] = [message_data]
        ref.child('Chat').child(new_key).set(new_chat)


def delete_message(message_id):
    pass
    #todo


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
    listings = ref.child('Listing').get()

    # Make sure that listing exists, if so, delete it.
    for key,val in listings.items():
        if (listing_id == val['ListingID']):
            delete_listing_ref = ref.child(key)
            delete_listing_ref.set(None)
            delete_listing_ref.delete()
    # If not, reflect that.
        else:
            raise ValueError(f"Post with ID {listing_id} does not exist.")

    
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
    
    # Pick random category(s) first, then a subcategory within.
    # Select a random number of categories (1-3) and get their subcategories
    selected_categories = random.sample(list(categories.keys()), 
                                        k=random.randint(1, 3))
    # Properly retrieve a subcategory using each selected category
    category_dict = {i+1: random.choice(categories[selected_categories[i]]) 
                     for i in range(len(selected_categories))}
    
    creation_time = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    description = random.choice(descriptions)
    
    # Select a random number of images (1-3)
    selected_images = random.sample(list(images.keys()), 
                                    k=random.randint(1, 3))
    image_dict = {key: images[key] for key in selected_images}
    
    # random price: xxx.xx
    price = f"{random.randint(0,999)}.{random.randint(10,99)}"
    sell_status = random.randint(0,1)
    title = random.choice(titles)
    user_ID = random.choice(UserIDs)

    return {
        'Category': category_dict,
        'CreateTime': creation_time,
        'Description': description,
        'Images': image_dict,
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

load_dummy_listings(10)
'''
**********************************Reviews**************************************
Inputs: dictionary listing data of form:
{ListingID} 
{Rating}
{Review}
{ReviewDate}
{ReviewerID}
{SellerID}
'''

'''
A function that passes in a dictionary in the block comment formatted above.

This function is slightly different than the rest because reviews do not have
their own unique ID's, they actually are referenced to listings.
'''
def add_review(review_data):
    listing_id_temp = str(review_data['ListingID'])
    # listing_id = review_data.get('ListingID')

    # if not listing_id:
    #     raise ValueError("review_data must include a 'ListingID' field.")

    # Fetch listings
    listings = ref.child('Listing').get()
    contains_listing = False
    
    # Check if listing ID exists
    for listing in listings:
        if listing is not None:
            for field, value in listing.items():
                if field == 'ListingID':
                    # print(f"Checking value lIDt: {listing_id_temp}, and val: {value}")
                    if str(value) == listing_id_temp:
                        contains_listing = True
                        break
            if contains_listing == True:
                break
                        
        
    # for idx, review in enumerate(reviews, start=0):
    # if review is not None:
    #     print("Review key: " + str(idx))
    #     for field, value in review.items():
    #         print("  " + field + ": " + str(value))
    #     print("-" * 20)
    
    
    # Make sure we're comparing strings
    if not listings:
        raise ValueError(f"No listings exist yet!")
    elif contains_listing == False:
        raise ValueError(f"Listing with ID {listing_id_temp} does not exist.")

    # Check if a review already exists for this post
    review_vals = ref.child('Review').get().values()

    # Check if listing ID exists
    for review in review_vals:
        if review is not None:
            listing_val = list(review.values())[0]
            # print(f"listing value: {listing_val}")
            if str(listing_val) == listing_id_temp:
                print(f"OOOOOOOOOOOOOOOOOReview for listing {listing_id_temp} already exists.OOOOOOOOOOOOOOOO")
                return

    # Save the review under the reviews node using ListingID as key
    ref.child('Review').child(str(listing_id_temp)).set(review_data)
    print(f"Review successfully added for Listing {listing_id_temp}.")
    

'''
A function that deletes a review from the Review table.
PARAM: listing_id | This parameter is the ListingID associated with specified
review.

credit: users Peter Haddad and Kevin on Stack Overflow,
https://stackoverflow.com/questions/59016092/how-to-delete-from-firebase-
realtime-database-use-python
'''
def del_review(listing_id):
    # Connect to the database
    reviews = ref.child('Review').get()

    # Make sure that listing exists, if so, delete the review.
    for key,val in reviews.items():
        if (listing_id == val['ListingID']):
            delete_review_ref = ref.child(key)
            delete_review_ref.set(None)
            delete_review_ref.delete()
    # If not, reflect that.
        else:
            raise ValueError(f"Post with ID {listing_id} does not exist.")
        
# generates listings for testing purposes
def generate_random_review():
    # sample data lists
    # Strings in format ex: "Worked as respected." or "Had more dents than I
    # was expecting"
    reviews = [
        "Worked as expected.",
        "Had more dents than I was expecting.",
        "Fantastic condition, better than described!",
        "Not bad, but buying process took a while.",
        "Missing a piece when I opened the box. Seller unresponsive.",
        "Exactly what I needed—thanks!",
        "Super helpful seller, great experience.",
        "There were some scratches not shown in the photos.",
        "Condition was okay, but definitely used more than stated.",
        "Wouldn't buy from this user again.",
        "Perfect item, fast delivery, no complaints.",
        "Box was damaged but item inside was fine.",
        "The description said 'barely used'—it was definitely *well* used.",
        "Item works, but smells strongly of perfume for some reason.",
        "Top-notch experience from start to finish. Highly recommend.",
        "Looked like it survived a tornado, but hey, it works.",
        "Smelled like someone microwaved regret. Still usable.",
        "Seller ghosted me for a week, then delivered it wrapped in a sock.",
        "Five stars for the audacity. Minus three for accuracy.",
        "Honestly? Better than my ex. And he had warranty issues too."
    ]

    # Since reviews are tied to listings, we must choose a pre-existing listing
    # If no listings exist, no need to generate any reviews
    # if listings:
    #     if isinstance(listings, list):
    #                 existing_ids = [str(i) for i, 
    #                                 item in enumerate(listings) if item is not None]
    # rand_listing_id = random.choice(existing_ids) if existing_ids else None
    listings = ref.child('Listing').get()
    existing_ids = []

    if isinstance(listings, dict):
        existing_ids = list(listings.keys())
    elif isinstance(listings, list):
        # keys are just indices in the list that are not None
        existing_ids = [str(i) for i, item in enumerate(listings)
                        if item is not None]
    else:
        return None  # Unexpected format

    if not existing_ids:
        print("Skipping: No valid listing found.")
        return None

    rand_listing_id = str(random.choice(list(existing_ids)))
    
    rating = random.randint(0,5)
    rand_review = random.choice(reviews)
    review_time_date = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    reviewer_id = random.randint(10000,99999)
    seller_id = random.randint(10000,99999)
    
    # Special case when the generated seller & reviewer IDs are the same.
    if (seller_id != reviewer_id):
        pass
    else:
        seller_id += 1

    return {
        'ListingID': rand_listing_id,
        'Rating': rating,
        'Review': rand_review,
        'ReviewDate': review_time_date,
        'ReviewerID': reviewer_id,
        'SellerID': seller_id,
    }

def print_all_reviews():
    reviews = ref.child('Review').get()
    if not reviews:
        print("no reviews found")
        return
    for idx, review in enumerate(reviews, start=0):
        if review is not None:
            print("Review key: " + str(idx))
            for field, value in review.items():
                print("  " + field + ": " + str(value))
            print("-" * 20)


def load_dummy_reviews(num):
    for i in range(num):
        rev = generate_random_review()
        if rev:  # Only try to add if it returned valid data
            try:
                add_review(rev)
                print("Added review.")
            except ValueError as e:
                print(f"Skipping review: {e}")
        else:
            print("Skipping: No valid listing found.")

load_dummy_reviews(10)

'''*************************************************************************'''


load_dummy_accounts(10)
#delete_acc_range(1,12)
#print_all_content()
#print_all_accounts()




