import firebase_admin
from firebase_admin import credentials, db

# get the database reference
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
**********************************Reviews**************************************
Inputs: dictionary listing data of form:
{ListingID} A **STRING**
{Rating} An integer
{Review} A String
{ReviewDate} A String
{ReviewerID} Integer
{SellerID} Integer

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

    if ref.child('Review').get() is not None:
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
    ref.child('Review').child(str(listing_id)).delete()

# returns the content of a review from a list id integer as the parameter
def get_review(listing_id):
    reviews = ref.child('Review').get()
    if not reviews:
        print("no reviews found")
        return
    review_vals = ref.child('Review').get().values()
    for review in review_vals:
        if review is not None:
            for field, value in review.items():
                if field == "ListingID" and int(value) == int(listing_id):
                    print(review)
                    return review
    print("review not found")

# returns a list of ALL reviews in the database
def get_all_reviews():
    reviews = ref.child('Review').get()
    if not reviews:
        print("no reviews found")
        return
    review_vals = ref.child('Review').get().values()
    all_reviews = []
    for review in review_vals:
        if review is not None:
            all_reviews.append(review)
    print(all_reviews)
    return all_reviews

#get_review(17)
#get_all_reviews()
