import firebase_admin
from firebase_admin import credentials, db
from typing import Dict, Any, List
from .exceptions import ServiceError, NotFoundError, ValidationError, DatabaseError
from .account_service import get_acc
from .listing_service import get_listing

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

class TransactionService:
    def __init__(self, db_ref=None):
        """Initialize TransactionService with optional database reference for testability."""
        self.ref = db_ref or get_db_root()

    #Add a transaction when a listing gets resolved
    def add_transaction(self, transaction_data: Dict[str, Any]) -> str:
        """Add a transaction. Returns the ListingID."""
        required = ['BuyerID', 'DateTransaction', 'ListingID', 'Price', 'SellerID']
        for field in required:
            if field not in transaction_data:
                raise ValidationError(f"Missing field '{field}' in transaction_data.")
        listing_id = str(transaction_data['ListingID'])
        # validate referenced resources
        try:
            get_acc(str(transaction_data['BuyerID']))
            get_acc(str(transaction_data['SellerID']))
            get_listing(listing_id)
        except NotFoundError as e:
            raise e
        except ServiceError as e:
            raise DatabaseError(f"Failed to verify resources: {e}")
        try:
            self.ref.child('Transaction').child(listing_id).set(transaction_data)
            return listing_id
        except Exception as e:
            raise DatabaseError(f"Failed to add transaction: {e}")

    #Delete a transaction too free space in db
    def delete_transaction(self, listing_id: str) -> None:
        """Delete a transaction by its ListingID."""
        try:
            tx_ref = self.ref.child('Transaction').child(str(listing_id))
            if not tx_ref.get():
                raise NotFoundError(f"Transaction for listing {listing_id} not found.")
            tx_ref.delete()
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to delete transaction: {e}")

    #From a listing id, get the particular transaction
    def get_transaction(self, listing_id: str) -> Dict[str, Any]:
        """Get the transaction for a specific listing."""
        try:
            tx = self.ref.child('Transaction').child(str(listing_id)).get()
            if not tx:
                raise NotFoundError(f"Transaction for listing {listing_id} not found.")
            return tx
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get transaction: {e}")

    #Get all transaction in db regardless of listingid
    def get_all_transactions(self) -> List[Dict[str, Any]]:
        """Get all transactions in the database."""
        try:
            txs = self.ref.child('Transaction').get()
            if not txs:
                raise NotFoundError("No transactions found.")
            return [t for t in txs.values() if t is not None]
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get all transactions: {e}")

# Default instance
transaction_service = TransactionService()
add_transaction = transaction_service.add_transaction
delete_transaction = transaction_service.delete_transaction
get_transaction = transaction_service.get_transaction
get_all_transactions = transaction_service.get_all_transactions
