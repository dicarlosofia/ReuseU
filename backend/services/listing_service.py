import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, Dict, Any, List
import logging
import base64
import uuid

from . import blob_storage
from .exceptions import ServiceError, NotFoundError, ValidationError, DatabaseError, PermissionDeniedError
from services import listing_report_service

logger = logging.getLogger(__name__)

def get_db_root():
    """
    Get the root reference of the Firebase database.
    """
    try:
        logger.debug("Attempting to get existing Firebase app")
        firebase_admin.get_app()
    except ValueError:
        logger.debug("No existing Firebase app found, initializing new app")
        cred = credentials.Certificate("pk.json")
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
        })
    logger.debug("Returning database root reference")
    return db.reference('/')

class ListingService:
    def __init__(self, db_ref=None):
        """
        Initialize ListingService with an optional database reference for testing.
        """
        logger.debug("Initializing ListingService")
        self.ref = db_ref or get_db_root()
        logger.debug("Database reference obtained")

    def update_listing_sell_status(self, marketplace_id: str, listing_id: str, user_id: str, sell_status: int) -> bool:
        """
        Update only the SellStatus field of a listing. Only the owner can update.
        Returns True if updated, False if not found or not permitted.
        """
        try:
            listings_ref = self._get_marketplace_listings_ref(marketplace_id)
            listing_ref = listings_ref.child(listing_id)
            listing = listing_ref.get()
            if not listing:
                logger.warning(f"Listing {listing_id} not found for SellStatus update.")
                return False
            if str(listing.get('UserID')) != str(user_id):
                logger.warning(f"User {user_id} not permitted to update SellStatus for listing {listing_id}.")
                raise PermissionError("Not authorized to update SellStatus for this listing.")
            listing_ref.update({'SellStatus': sell_status})
            logger.info(f"Listing {listing_id} SellStatus updated to {sell_status}.")
            return True
        except PermissionError:
            raise
        except Exception as e:
            logger.error(f"Error updating SellStatus for listing {listing_id}: {e}", exc_info=True)
            return False

        """
        Initialize ListingService with an optional database reference for testing.
        """
        logger.debug("Initializing ListingService")
        self.ref = db_ref or get_db_root()
        logger.debug("Database reference obtained")

    def _get_marketplace_listings_ref(self, marketplace_id: str):
        """
        Get the database reference for listings within a specific marketplace.
        """
        if not marketplace_id:
             raise ValueError("marketplace_id cannot be empty")
        return self.ref.child(marketplace_id).child('Listing')

    def add_listing(self, marketplace_id: str, listing_data: Dict[str, Any]) -> str:
        """
        Add a new listing to a specific marketplace. Returns the new unique ListingID.
        """
        try:
            logger.debug(f"Starting add_listing in marketplace '{marketplace_id}' with data: {listing_data}")
            listings_ref = self._get_marketplace_listings_ref(marketplace_id)

            required_fields = ['UserID', 'Title', 'Price', 'Description', 'Images']
            for field in required_fields:
                if field not in listing_data or not listing_data[field]:
                    raise ValidationError(f"Missing or empty required field: {field}")

            images = listing_data.pop('Images')
            if not isinstance(images, dict) or not images:
                raise ValidationError("'Images' must be a non-empty dictionary.")

            new_listing_ref = listings_ref.push()
            new_key = new_listing_ref.key
            listing_data['ListingID'] = new_key
            logger.debug(f"Generated new unique listing ID: {new_key} in marketplace {marketplace_id}")

            image_blob_prefix = new_key
            logger.debug(f"Connecting to blob storage for image upload (prefix: {image_blob_prefix})")
            s3 = blob_storage.connect_to_blob_db_resource()
            # Convert images dict to list of base64 strings for upload
            uploaded_keys = blob_storage.upload_files_to_bucket(s3, image_blob_prefix, list(images.values()))
            if not uploaded_keys:
                 raise DatabaseError("Failed to upload any images to blob storage.")

            listing_data["CoverImageKey"] = uploaded_keys[0]
            listing_data["ImageKeys"] = uploaded_keys

            logger.debug(f"Saving listing to database at path: {new_listing_ref.path}")
            new_listing_ref.set(listing_data)
            logger.info(f"Successfully added new listing with ID: {new_key} in marketplace: {marketplace_id}")
            return new_key

        except ValidationError as ve:
             logger.error(f"Validation error adding listing in {marketplace_id}: {ve}")
             raise
        except Exception as e:
            logger.error(f"Error in add_listing for marketplace {marketplace_id}: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to add listing in {marketplace_id}: {e}")

    def del_listing(self, marketplace_id: str, listing_id: str, user_id: str) -> bool:
        """
        Delete a listing by listing_id within a specific marketplace, checking ownership.
        """
        try:
            logger.info(f"Attempting delete for listing {listing_id} in marketplace {marketplace_id} by user {user_id}")
            listing_ref = self._get_marketplace_listings_ref(marketplace_id).child(listing_id)
            listing_data = listing_ref.get()

            if not listing_data:
                logger.warning(f"Listing {listing_id} not found in marketplace {marketplace_id} for delete.")
                raise NotFoundError(f"Listing {listing_id} not found in marketplace {marketplace_id}.")

            # Ownership check
            owner_id = listing_data.get('UserID')
            # Ensure consistent type comparison (e.g., both strings or both ints)
            if str(owner_id) != str(user_id):
                logger.warning(f"Permission denied: User {user_id} attempted to delete listing {listing_id} owned by {owner_id} in marketplace {marketplace_id}")
                raise PermissionDeniedError(f"User {user_id} does not have permission to delete listing {listing_id}.")

            # Delete images from blob storage using the stored 'ImageKeys' list.
            image_keys_to_delete = listing_data.get("ImageKeys")
            if not image_keys_to_delete and listing_data.get("CoverImageKey"): # Fallback if only CoverImageKey exists
                 image_keys_to_delete = [listing_data.get("CoverImageKey")]

            if image_keys_to_delete:
                 try:
                      logger.debug(f"Connecting to blob storage to delete images for listing {listing_id} (keys: {image_keys_to_delete})")
                      s3 = blob_storage.connect_to_blob_db_resource()
                      blob_storage.delete_files_from_bucket(s3, image_keys_to_delete)
                      logger.info(f"Successfully deleted images from blob storage for listing {listing_id}")
                 except Exception as blob_e:
                      # Log error but proceed with deleting DB record as it's more critical
                      logger.error(f"Failed to delete images from blob storage for listing {listing_id}: {blob_e}", exc_info=True)
                      # Potentially add a flag/log indicating orphaned blobs
            else:
                 logger.warning(f"No image keys found (ImageKeys or CoverImageKey) for listing {listing_id} to delete from blob storage.")

            # --- Delete Listing from DB ---
            logger.debug(f"Deleting listing record from DB: {listing_ref.path}")
            listing_ref.delete()
            logger.info(f"Successfully deleted listing {listing_id} from marketplace {marketplace_id}")
            return True

        except (NotFoundError, PermissionDeniedError) as specific_error:
            logger.warning(f"{type(specific_error).__name__} during delete of listing {listing_id} in {marketplace_id}: {specific_error}")
            raise specific_error # Re-raise specific handled errors
        except Exception as e:
            logger.error(f"Failed to delete listing {listing_id} in marketplace {marketplace_id}: {e}", exc_info=True)
            raise DatabaseError(f"Failed to delete listing {listing_id} in marketplace {marketplace_id}: {e}")

    def get_listing(self, marketplace_id: str, listing_id: str) -> Optional[Dict[str, Any]]:
        """Get listing dictionary by listing_id from a specific marketplace."""
        try:
            logger.debug(f"Attempting to get listing {listing_id} from marketplace {marketplace_id}")
            listing_ref = self._get_marketplace_listings_ref(marketplace_id).child(listing_id)
            listing_data = listing_ref.get()

            if not listing_data:
                 logger.warning(f"Listing {listing_id} not found in marketplace {marketplace_id}")
                 # Return None as the route likely expects this for a 404
                 return None

            # --- Add Image URLs using stored keys ---
            image_urls = []
            image_keys = listing_data.get("ImageKeys") # Preferentially use list of all keys
            if not image_keys and listing_data.get("CoverImageKey"): # Fallback to CoverImageKey
                 image_keys = [listing_data.get("CoverImageKey")]

            if image_keys:
                 try:
                      logger.debug(f"Getting image URLs for listing {listing_id} (keys: {image_keys})")
                      s3 = blob_storage.connect_to_blob_db_resource()
                      # Generate signed URLs for all keys found
                      image_urls = [blob_storage.get_image_url_from_key(key, s3_resource=s3) for key in image_keys]
                      logger.debug(f"Generated {len(image_urls)} image URLs for listing {listing_id}")
                 except Exception as blob_e:
                      logger.error(f"Failed to generate signed URLs for listing {listing_id}: {blob_e}", exc_info=True)
                      listing_data["ImageError"] = "Could not load images" # Add error info
            else:
                 logger.warning(f"No image keys found (ImageKeys or CoverImageKey) for listing {listing_id}")

            listing_data["ImageUrls"] = image_urls # Add the list of URLs (even if empty)

            logger.info(f"Successfully retrieved listing {listing_id} from marketplace {marketplace_id}")
            return listing_data

        except Exception as e:
            logger.error(f"Error in get_listing for {listing_id} in marketplace {marketplace_id}: {str(e)}", exc_info=True)
            # Raise a more specific error if possible, otherwise DatabaseError
            raise DatabaseError(f"Failed to get listing {listing_id} in marketplace {marketplace_id}: {e}")

    def get_all_listings_user(self, marketplace_id: str, account_id: str) -> List[Dict[str, Any]]:
        """Get all listings for a particular user within a specific marketplace."""
        try:
            logger.debug(f"Getting all listings for user {account_id} in marketplace {marketplace_id}")
            listings_ref = self._get_marketplace_listings_ref(marketplace_id)

            # Query Firebase for listings where UserID matches account_id within the marketplace
            # Ensure the UserID type matches how it's stored (string vs int)
            query = listings_ref.order_by_child('UserID').equal_to(str(account_id)) # Assuming UserID is stored as string

            all_user_listings_dict = query.get()
            found_listings = []

            if all_user_listings_dict: # Firebase returns a dict {listing_id: data} when querying
                 logger.debug(f"Found raw listings for user {account_id} in {marketplace_id}: {len(all_user_listings_dict)}")
                 try:
                     s3 = blob_storage.connect_to_blob_db_resource() # Connect once for all listings
                 except Exception as s3_e:
                     logger.error(f"Failed to connect to S3 for user listings {account_id} in {marketplace_id}: {s3_e}")
                     s3 = None # Proceed without URLs if S3 fails

                 for listing_id, listing_data in all_user_listings_dict.items():
                      if listing_data and isinstance(listing_data, dict): # Basic validation
                            # Add CoverImageUrl using CoverImageKey
                            cover_key = listing_data.get("CoverImageKey")
                            if cover_key and s3:
                                try:
                                    listing_data["CoverImageUrl"] = blob_storage.get_image_url_from_key(
                                        cover_key, s3_resource=s3
                                    )
                                except Exception as url_e:
                                     logger.warning(f"Failed to get cover image URL for key {cover_key} (listing {listing_id}): {url_e}")
                                     listing_data["CoverImageUrl"] = None # Assign None on error
                            else:
                                 listing_data["CoverImageUrl"] = None # No key or no S3 connection

                            # Ensure ListingID is present (it's the key, but good practice)
                            if 'ListingID' not in listing_data:
                                listing_data['ListingID'] = listing_id

                            found_listings.append(listing_data)
                      else:
                          logger.warning(f"Skipping invalid data found for user {account_id} at listing ID {listing_id} in marketplace {marketplace_id}")


            if not found_listings:
                logger.info(f"User {account_id} has no listings in marketplace {marketplace_id}.")
                # Return empty list, not an error
                return []

            logger.info(f"Successfully retrieved {len(found_listings)} listings for user {account_id} in marketplace {marketplace_id}")
            return found_listings

        except Exception as e:
            logger.error(f"Failed to get user's listings for {account_id} in {marketplace_id}: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get listings for user {account_id} in marketplace {marketplace_id}: {e}")

    def get_all_listings_total(self, marketplace_id: str) -> List[Dict[str, Any]]:
        """Get all listings within a specific marketplace."""
        try:
            logger.debug(f"Getting all listings for marketplace {marketplace_id}")
            listings_ref = self._get_marketplace_listings_ref(marketplace_id)
            all_listings_dict = listings_ref.get() # Get all listings under the marketplace path
            found_listings = []

            if all_listings_dict and isinstance(all_listings_dict, dict): # Check if marketplace has any listings (returns dict)
                 logger.debug(f"Found raw listings for marketplace {marketplace_id}: {len(all_listings_dict)}")
                 try:
                     s3 = blob_storage.connect_to_blob_db_resource() # Connect once
                 except Exception as s3_e:
                      logger.error(f"Failed to connect to S3 for all listings in {marketplace_id}: {s3_e}")
                      s3 = None

                 for listing_id, listing_data in all_listings_dict.items():
                      if listing_data and isinstance(listing_data, dict): # Basic validation
                            # Add CoverImageUrl
                            cover_key = listing_data.get("CoverImageKey")
                            if cover_key and s3:
                                try:
                                    listing_data["CoverImageUrl"] = blob_storage.get_image_url_from_key(
                                        cover_key, s3_resource=s3
                                    )
                                except Exception as url_e:
                                     logger.warning(f"Failed to get cover image URL for key {cover_key} (listing {listing_id}): {url_e}")
                                     listing_data["CoverImageUrl"] = None
                            else:
                                 listing_data["CoverImageUrl"] = None # No key or no S3

                            if 'ListingID' not in listing_data:
                                listing_data['ListingID'] = listing_id

                            found_listings.append(listing_data)
                      else:
                            logger.warning(f"Skipping invalid data found at listing ID {listing_id} in marketplace {marketplace_id}")

            if not found_listings:
                 logger.info(f"Marketplace {marketplace_id} has no listings.")
                 return [] # Return empty list if none found or marketplace path doesn't exist

            logger.info(f"Successfully retrieved {len(found_listings)} listings for marketplace {marketplace_id}")
            return found_listings

        except Exception as e:
            logger.error(f"Failed to get all listings for marketplace {marketplace_id}: {e}", exc_info=True)
            raise DatabaseError(f"Failed to get all listings in marketplace {marketplace_id}: {e}")

    def update_listing(self, marketplace_id: str, listing_id: str, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
         """Update a listing within a specific marketplace, checking ownership. (Currently does not support image updates)."""
         try:
            logger.info(f"Attempting update for listing {listing_id} in marketplace {marketplace_id} by user {user_id}")
            listing_ref = self._get_marketplace_listings_ref(marketplace_id).child(listing_id)
            listing_data = listing_ref.get()

            if not listing_data:
                logger.warning(f"Listing {listing_id} not found in marketplace {marketplace_id} for update.")
                raise NotFoundError(f"Listing {listing_id} not found in marketplace {marketplace_id}.")

            # --- Ownership Check ---
            owner_id = listing_data.get('UserID')
            if str(owner_id) != str(user_id): # Ensure consistent type comparison
                logger.warning(f"Permission denied: User {user_id} attempted to update listing {listing_id} owned by {owner_id} in {marketplace_id}")
                raise PermissionDeniedError(f"User {user_id} does not have permission to update listing {listing_id}.")

            # --- Prepare Update Payload ---
            # Prevent critical fields like ListingID, UserID, ImageKeys, CoverImageKey from being changed via this endpoint
            # Image updates would require a more complex flow (delete old blobs, upload new, update keys)
            protected_keys = ['ListingID', 'UserID', 'ImageKeys', 'CoverImageKey']
            payload = {k: v for k, v in update_data.items() if k not in protected_keys}

            if not payload:
                 # Changed to warning as maybe the request only contained protected keys, which isn't an error per se, just no-op.
                 # Or raise ValidationError if any update data MUST be provided. Let's warn for now.
                 logger.warning(f"No valid fields provided for update on listing {listing_id} after filtering protected keys.")
                 # Return the original data or None? Returning original seems reasonable for a no-op update.
                 # Add ImageUrls to original data before returning
                 self._add_image_urls_to_listing(listing_data) # Use a helper for clarity
                 return listing_data
                 # raise ValidationError("No valid fields provided for update.")

            logger.debug(f"Updating listing {listing_id} at {listing_ref.path} with payload: {payload}")
            listing_ref.update(payload) # Update only the allowed fields

            # Fetch the updated data to return it
            updated_listing_data = listing_ref.get()
            if not updated_listing_data:
                 # This shouldn't normally happen if update was successful, but check defensively
                 logger.error(f"Failed to retrieve listing {listing_id} immediately after update in {marketplace_id}.")
                 raise DatabaseError(f"Failed to retrieve updated listing data for {listing_id}.")

            # Add Image URLs to the updated returned data
            self._add_image_urls_to_listing(updated_listing_data) # Use helper

            logger.info(f"Successfully updated listing {listing_id} in marketplace {marketplace_id}")
            return updated_listing_data

         except (NotFoundError, PermissionDeniedError, ValidationError) as specific_error:
              logger.warning(f"{type(specific_error).__name__} during update of listing {listing_id} in {marketplace_id}: {specific_error}")
              raise specific_error
         except Exception as e:
            logger.error(f"Failed to update listing {listing_id} in marketplace {marketplace_id}: {e}", exc_info=True)
            raise DatabaseError(f"Failed to update listing {listing_id} in marketplace {marketplace_id}: {e}")

    def _add_image_urls_to_listing(self, listing_data: Dict[str, Any]):
        """Adds 'ImageUrls' list to listing data dict based on stored keys. Mutates the dict."""
        if not listing_data or not isinstance(listing_data, dict):
            return # Nothing to add URLs to

        listing_id_for_log = listing_data.get('ListingID', 'UNKNOWN') # For logging
        image_urls = []
        image_keys = listing_data.get("ImageKeys")
        if not image_keys and listing_data.get("CoverImageKey"):
             image_keys = [listing_data.get("CoverImageKey")]

        if image_keys:
             try:
                  # Consider caching S3 resource if called frequently
                  s3 = blob_storage.connect_to_blob_db_resource()
                  image_urls = [blob_storage.get_image_url_from_key(key, s3_resource=s3) for key in image_keys]
             except Exception as blob_e:
                  logger.error(f"Failed to generate signed URLs for listing {listing_id_for_log} during URL addition: {blob_e}", exc_info=True)
                  listing_data["ImageError"] = "Could not load images"
        # Always add the key, even if empty
        listing_data["ImageUrls"] = image_urls


# For backward compatibility and direct use from routes
listing_service = ListingService()
add_listing = listing_service.add_listing
del_listing = listing_service.del_listing
get_listing = listing_service.get_listing
get_all_listings_user = listing_service.get_all_listings_user
get_all_listings_total = listing_service.get_all_listings_total
update_listing = listing_service.update_listing
update_listing_sell_status = listing_service.update_listing_sell_status
