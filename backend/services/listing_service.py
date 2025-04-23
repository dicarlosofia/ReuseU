import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, Dict, Any, List

from . import blob_storage
from .exceptions import ServiceError, NotFoundError, ValidationError, DatabaseError


#get the root of the database
def get_db_root():
    """Get the root of the Firebase database."""
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("pk.json")
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
        })
    return db.reference('/')


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

class ListingService:
    def __init__(self, db_ref=None):
        """Initialize ListingService with optional database reference for testability."""
        self.ref = db_ref or get_db_root()

    def add_listing(self, listing_data: Dict[str, Any]) -> str:
        """Add a new listing. Returns the new ListingID."""
        try:
            image = listing_data.pop('base64images')[0]
            s3 = blob_storage.connect_to_blob_db_resource()
            blob_storage.upload_file_to_bucket(s3, "test_image", listing_data['ListingID'], image)
            listings = self.ref.child('Listing').get()
            new_key = str(len(listings)) if listings else "1"
            listing_data['ListingID'] = new_key
            self.ref.child('Listing').child(new_key).set(listing_data)
            return new_key
        except Exception as e:
            raise DatabaseError(f"Failed to add listing: {e}")

    '''
    A function that deletes a listing from the Listing table.

    credit: users Peter Haddad and Kevin on Stack Overflow,
    https://stackoverflow.com/questions/59016092/how-to-delete-from-firebase-
    realtime-database-use-python
    '''
    def del_listing(self, listing_id: str) -> None:
        """Delete a listing by listing_id."""
        try:
            listing_ref = self.ref.child('Listing').child(str(listing_id))
            if not listing_ref.get():
                raise NotFoundError(f"Listing {listing_id} not found.")
            listing_ref.delete()
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to delete listing: {e}")

# gets content of a listing in dictionary format from a listing_id
    def get_listing(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """Get listing dictionary by listing_id."""
        try:
            listings = self.ref.child('Listing').get()
            if not listings:
                raise NotFoundError("No listings found.")
            for listing in listings:
                if listing is not None:
                    for field, value in listing.items():
                        if field == "ListingID" and int(value) == int(listing_id):
                            return listing
            raise NotFoundError(f"Listing {listing_id} not found.")
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get listing: {e}")

# returns a list of all listings (dictionary format)  from a particular account
    def get_all_listings_user(self, account_id: str) -> List[Dict[str, Any]]:
        """Get all listings for a particular user."""
        try:
            listings = self.ref.child('Listing').get()
            found_listings = []
            if not listings:
                raise NotFoundError("No listings found.")
            for listing in listings:
                if listing is not None:
                    for field, value in listing.items():
                        if field == "UserID" and int(value) == int(account_id):
                            found_listings.append(listing)
            if not found_listings:
                raise NotFoundError(f"User {account_id} has no listings.")
            return found_listings
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get user's listings: {e}")

# gets ALL listings in the database
    def get_all_listings_total(self) -> List[Dict[str, Any]]:
        """Get all listings in the database."""
        try:
            listings = self.ref.child('Listing').get()
            all_listings = []
            if not listings:
                raise NotFoundError("No listings found.")
            for listing in listings:
                if listing is not None:
                    all_listings.append(listing)
            return all_listings
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get all listings: {e}")

# a duplicate function as get_listing
    def get_listing_by_id(self, listing_id: str) -> Optional[Dict[str, Any]]:
        """Duplicate function for get_listing (for compatibility)."""
        return self.get_listing(listing_id)

# For backward compatibility, instantiate a default service
listing_service = ListingService()
add_listing = listing_service.add_listing
del_listing = listing_service.del_listing
get_listing = listing_service.get_listing
get_all_listings_user = listing_service.get_all_listings_user
get_all_listings_total = listing_service.get_all_listings_total
get_listing_by_id = listing_service.get_listing_by_id


#get_listing(1)
#get_all_listings_user(802)
#get_all_listings_total()
