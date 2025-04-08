import datetime
import random

import firebase_admin
from firebase_admin import credentials, db
from account_service import add_account, delete_acc
from listing_service import add_listing, del_listing
from review_service import add_review, del_review
from transaction_service import add_transaction, delete_transaction
from message_service import add_message

INTRO_MSG = '''
Welcome to the ReuseU Backend Testing Suite!

Please select a component to test:
(1): Make Test Accounts
(2): See All Accounts
(3): Delete Accounts
(4): Make Test Transactions
(5): See All Transactions
(6): Delete Transactions
(7): Make Test Listings
(8): See All Listings
(9): Delete Listings
(10): Make Test Reviews
(11): See All Reviews
(12): Delete Reviews
(13): Make Test Messages
(14): See All Messages
(15): Delete Messages
(16): Exit
Entry: '''

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
    
# **********ACCOUNTS**********

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

def delete_acc_range(min,max):
    for i in range(min,max):
        delete_acc(i)
        
        
# **********TRANSACTIONS**********

def generate_random_transaction(listing_id):
    buyerid = random.randint(1,1000)
    sellerid = random.randint(1,1000)
    price = float(random.randint(100,100000))/100
    date_transaction = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        'BuyerID': buyerid,
        'DateTransaction': date_transaction,
        'ListingID': listing_id,
        'Price': price,
        'SellerID': sellerid
    }

def load_dummy_transactions(listing_id_min,listing_id_max):
    for i in range(listing_id_min,listing_id_max):
        transac = generate_random_transaction(i)
        add_transaction(transac)

def print_all_transactions():
    transactions = ref.child('Transaction').get()
    if not transactions:
        print("no transactions found")
        return
    for idx, transaction in enumerate(transactions, start=0):
        if transaction is not None:
            print("transaction key: " + str(idx))
            for field, value in transaction.items():
                print("  " + field + ": " + str(value))
            print("-" * 20)

def delete_transaction_range(min,max):
    for i in range(min,max):
        delete_transaction(i)

# **********MESSAGES**********
'''
This function generates a random message

---SAMPLE MESSAGE---
{LastTime': last_time,
'MessageContent': message_content,
'UserID': user_id,
'ListingID': listing_id}
'''
def generate_random_message():
    last_msg_date = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    content = [
        "Hey, can we meet in the Grill at 7:30pm??",
        "Sorry, I can't meet until 10 am tomorrow :(",
        "What's a good payment method for you",
        "idk where younker is",
        "pu to west campus and i'll give you the dell laptop out front",
        "Haha yeah I told this one freshman that we had a West Campus LOL",
        "Can you package up the Air Forces in bubble wrap?",
        "I think that would be best, tysm",
        "Hi where are we meeting again?",
        "You too!!",
        "Hiii is your table still up for sale?",
        "Yes my listing is still up for sale!",
        "No I already sold it :("
    ]
    msg_content = random.choice(content)
    user_id = random.randint(00000,99999)
    
    # Since reviews are tied to listings, we must choose a pre-existing listing
    # If no listings exist, no need to generate any reviews
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
    
    return {
        'LastTime': last_msg_date,
        'MessageContent': msg_content,
        'UserID': user_id, 
        'ListingID': rand_listing_id
    }
    
def print_all_messages():
    messages = ref.child('Chat').get()
    if not messages:
        print("no chats found")
        return
    for idx, message in enumerate(messages, start=0):
        if message is not None:
            print("Chat key: " + str(idx))
            for field, value in message.items():
                print("  " + field + ": " + str(value))
            print("-" * 20)

def load_dummy_messages(num):
    for i in range(num):
        msg = generate_random_message()
        if msg:  # Only try to add if it returned valid data
            try:
                add_message(msg)
                print("Added message.")
            except ValueError as e:
                print(f"Skipping message: {e}")
        else:
            print("Skipping: No valid listing found.")
    


# **********LISTINGS**********

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

def delete_listings_range(min,max):
    for i in range(min,max):
        del_listing(i)

# **********REVIEWS**********

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

def delete_reviews_range(min,max):
    for i in range(min,max):
        del_review(i)
            
'''
This prints the intro menu for a tester to refer to when testing the ReuseU
database.
'''          
def intro_menu():
    while (user_input := input(INTRO_MSG)) != "16":
        if user_input == "1":
            num_accts = int(input("Enter amt. of test accounts to make: "))
            load_dummy_accounts(num_accts)
            print(f"{num_accts} accounts loaded. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "2":
            print_all_accounts()
            exit_testing_program()
        elif user_input == "3":
            min_id = int(input("Enter min account id delete range: "))
            max_id = int(input("Enter max account id delete range: "))
            delete_acc_range(min_id,max_id)
            print(f"Account ids {min_id} though {max_id} were deleted. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "4":
            num_accts = int(input("Enter amt. of transactions to make: "))
            load_dummy_transactions(1,num_accts)
            print(f"{num_accts} transaction loaded. Navigate to database to see additions.")
            exit_testing_program()
            pass
        elif user_input == "5":
            print_all_transactions()
            exit_testing_program()
            pass
        elif user_input == "6":
            min_id = int(input("Enter min account id delete range for transactions: "))
            max_id = int(input("Enter max account id delete range for transactions: "))
            delete_transaction_range(min_id, max_id)
            print(f"Listings ids {min_id} though {max_id} were deleted in the transaction table. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "7":
            num_listings = int(input("Enter amt. of test listings to make: "))
            load_dummy_listings(num_listings)
            print(f"{num_listings} listings loaded. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "8":
            print_all_listings()
            exit_testing_program()
        elif user_input == "9":
            min_id = int(input("Enter min listing id delete range for listings: "))
            max_id = int(input("Enter max listing id delete range for listings: "))
            delete_listings_range(min_id, max_id)
            print(f"Listing ids {min_id} though {max_id} were deleted in the listings table. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "10":
            num_reviews = int(input("Enter amt. of test reviews to make: "))
            load_dummy_reviews(num_reviews)
            print(f"{num_reviews} reviews loaded. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "11":
            print_all_reviews()
            exit_testing_program()
        elif user_input == "12":
            min_id = int(input("Enter min listing id delete range for reviews: "))
            max_id = int(input("Enter max listing id delete range for reviews: "))
            delete_reviews_range(min_id, max_id)
            print(
                f"Listing ids {min_id} though {max_id} were deleted in the reviews table. Navigate to database to see additions.")
        elif user_input == "13":
            num_chats = int(input("Enter amt. of messages to make: "))
            load_dummy_messages(num_chats)
            print(f"{num_chats} message(s) loaded. Navigate to database to see additions.")
            exit_testing_program()
        elif user_input == "14":
            # TODO: add messages suite testing functions
            pass
        elif user_input == "15":
            # TODO: add messages suite testing functions
            pass
        else:
            print("Invalid input. Please try again.\n")
            exit_testing_program()
            
'''
A small function to help with exiting the program.
'''
def exit_testing_program():
    yes_or_no = input("\nWould you like to continue testing the database?\nEnter 'Y' for yes or 'N' to exit: ")
    if yes_or_no == "Y":
        print("Continuing on!\n")
    elif yes_or_no == "N":
        curr_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print("\n\nTesting session ended at", curr_time)
        exit()
    else: 
        print("Invalid input. Continuing...\n")
        
intro_menu()