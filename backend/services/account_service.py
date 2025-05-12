# services/account_service.py
# Service layer for account management and marketplace ID extraction.

import firebase_admin
from firebase_admin import credentials, db
from typing import Dict, Any
from .exceptions import NotFoundError, DatabaseError
import re  # Import regex for domain extraction
import logging # Import logging

# Configure logging (if not already done elsewhere)
# logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_db_root():
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("pk.json")
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
        })
    return db.reference('/')


def get_marketplace_id_from_email(email: str) -> str | None:
    """
    Extract the core domain name (e.g., 'grinnell') from an email address ending in '.edu'.
    Returns None if the email is invalid or not a .edu address.
    """
    if not email or '@' not in email:
        logger.warning(f"Invalid email format: {email}")
        return None
    domain = email.split('@')[1].lower() # Use lower case for consistency

    # Ensure it ends with .edu and extract the part before it
    if domain.endswith('.edu'):
        parts = domain.split('.')
        # The domain should have at least two parts: the main domain and 'edu'.
        if len(parts) >= 2:
            marketplace_id = parts[-2]
            # Validate that the marketplace ID is alphanumeric.
            if re.match(r"^[a-zA-Z0-9]+$", marketplace_id):
                logger.info(f"Derived marketplace ID '{marketplace_id}' from email {email}")
                return marketplace_id
            else:
                logger.warning(f"Extracted non-alphanumeric marketplace ID '{marketplace_id}' from {email}")
                return None
    logger.warning(f"Email domain '{domain}' from {email} is not a valid .edu domain for marketplace.")
    return None


class AccountService:
    def __init__(self, db_ref=None):
        self.ref = db_ref or get_db_root()

    def get_favorites(self, account_id: str) -> list:
        """
        Retrieve the list of favorite listing IDs for a user.
        """
        acc = self.ref.child('Account').child(account_id).get()
        if not acc:
            raise NotFoundError(f"Account {account_id} not found.")
        return acc.get('Favorites', [])

    def update_favorites(self, account_id: str, favorites: list) -> list:
        """
        Update the list of favorite listing IDs for a user. If the account does not have a Favorites field, add it.
        """
        acc_ref = self.ref.child('Account').child(account_id)
        existing = acc_ref.get()
        if not existing:
            raise NotFoundError(f"Account {account_id} not found.")
        # Add Favorites field if missing, else update as normal
        if 'Favorites' not in existing:
            acc_ref.update({'Favorites': favorites})
        else:
            acc_ref.update({'Favorites': favorites})
        return favorites

    def get_acc_by_username(self, username: str) -> dict:
        """
        Retrieve account data by Username (case-insensitive).
        """
        accounts = self.ref.child('Account').get() or {}
        for acc in accounts.values():
            if acc.get('Username', '').lower() == username.lower():
                return acc
        raise NotFoundError(f"Account with username {username} not found.")

    def add_account(self, account_data: Dict[str, Any]) -> str:
        """
        Use the provided UserID (Firebase UID) as the key. Derive and store marketplace_id from email.
        """
        try:
            uid = account_data.get('UserID')
            if not uid:
                raise ValueError("AccountData must include UserID")

            email = account_data.get('email') # Expect email in the payload
            if not email:
                 raise ValueError("AccountData must include email for marketplace assignment.")

            marketplace_id = get_marketplace_id_from_email(email)

            if not marketplace_id:
                # Raise an error if a valid .edu marketplace ID couldn't be determined
                raise ValueError(f"Could not determine a valid .edu marketplace ID from email: {email}")

            # Add marketplace_id to the data being saved
            account_data_to_save = account_data.copy() # Copy to avoid mutating the input dictionary.
            account_data_to_save['marketplace_id'] = marketplace_id

            logger.info(f"Adding account for user {uid} with marketplace {marketplace_id}")
            self.ref.child('Account').child(uid).set(account_data_to_save)
            return uid
        except ValueError as ve: # Handle validation errors.
             logger.error(f"Validation error adding account: {ve}")
             raise # Re-raise ValueError to be potentially caught by route handler
        except Exception as e:
            logger.error(f"Database error adding account: {e}", exc_info=True)
            raise DatabaseError(f"Failed to add account: {e}")

    def get_acc(self, account_id: str) -> Dict[str, Any]:
        """
        Retrieve account data directly by Firebase UID key.
        """
        try:
            acc = self.ref.child('Account').child(account_id).get()
            if not acc:
                raise NotFoundError(f"Account {account_id} not found.")
            return acc
        except NotFoundError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get account: {e}")

    def delete_acc(self, account_id: str) -> None:
        try:
            acc_ref = self.ref.child('Account').child(account_id)
            if not acc_ref.get():
                raise NotFoundError(f"Account {account_id} not found.")
            acc_ref.delete()
        except NotFoundError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to delete account: {e}")

    def update_acc(self, account_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an account's fields (merge new data into existing account).
        Ensure marketplace_id is not accidentally overwritten if present,
        and attempt to add it if missing and email is being updated.
        """
        try:
            acc_ref = self.ref.child('Account').child(account_id)
            existing = acc_ref.get()
            if not existing:
                raise NotFoundError(f"Account {account_id} not found.")

            data_to_update = update_data.copy()

            # Prevent accidental overwrite of existing marketplace_id unless explicitly provided
            if 'marketplace_id' in existing and 'marketplace_id' not in data_to_update:
                 pass # Keep existing one
            elif 'marketplace_id' not in existing:
                # If marketplace_id is missing, try to derive it if email is in the update data
                new_email = data_to_update.get('email')
                if new_email:
                    derived_marketplace_id = get_marketplace_id_from_email(new_email)
                    if derived_marketplace_id:
                        logger.info(f"Adding missing marketplace_id '{derived_marketplace_id}' during update for account {account_id}")
                        data_to_update['marketplace_id'] = derived_marketplace_id
                    else:
                        logger.warning(f"Could not derive marketplace_id during update for account {account_id} from new email {new_email}")
                        # Decide if this should be an error or just proceed without it

            logger.info(f"Updating account {account_id}")
            acc_ref.update(data_to_update)

            # Return the merged data
            # Fetch again to ensure we return the actual state after update
            updated_account_data = acc_ref.get()
            if not updated_account_data: # Should not happen if update succeeded, but safety check
                 raise DatabaseError(f"Failed to retrieve account {account_id} immediately after update.")
            return updated_account_data # Return the full updated account data
        except NotFoundError:
            logger.warning(f"Account {account_id} not found during update attempt.")
            raise
        except ValueError as ve: # Catch potential errors from get_marketplace_id_from_email via update logic
             logger.error(f"Validation error updating account {account_id}: {ve}")
             raise # Re-raise ValueError
        except Exception as e:
            logger.error(f"Database error updating account {account_id}: {e}", exc_info=True)
            raise DatabaseError(f"Failed to update account: {e}")

# singletons
account_service = AccountService()
add_account      = account_service.add_account
get_acc          = account_service.get_acc
delete_acc       = account_service.delete_acc
update_acc       = account_service.update_acc # Expose the updated method
