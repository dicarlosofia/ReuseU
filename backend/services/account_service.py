import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, Dict, Any
from .exceptions import ServiceError, NotFoundError, ValidationError, DatabaseError


# get the root of the database
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

class AccountService:
    def __init__(self, db_ref=None):
        """Initialize AccountService with optional database reference for testability."""
        self.ref = db_ref or get_db_root()

    def add_account(self, account_data: Dict[str, Any]) -> str:
        """Add a new account. Returns the new UserID."""
        try:
            accounts = self.ref.child('Account').get()
            new_key = str(len(accounts)) if accounts else "1"
            account_data['UserID'] = new_key
            self.ref.child('Account').child(new_key).set(account_data)
            return new_key
        except Exception as e:
            raise DatabaseError(f"Failed to add account: {e}")

    def delete_acc(self, account_id: str) -> None:
        """Delete an account by account_id."""
        try:
            acc_ref = self.ref.child('Account').child(str(account_id))
            if not acc_ref.get():
                raise NotFoundError(f"Account {account_id} not found.")
            acc_ref.delete()
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to delete account: {e}")

    def delete_acc_range(self, min_id: int, max_id: int) -> None:
        """Delete accounts in a range of IDs."""
        for i in range(min_id, max_id):
            try:
                self.delete_acc(str(i))
            except NotFoundError:
                continue  # skip missing accounts

    def get_acc(self, account_id: str) -> Optional[Dict[str, Any]]:
        """Get account dictionary by account_id."""
        try:
            accounts = self.ref.child('Account').get()
            if not accounts:
                raise NotFoundError("No accounts found.")
            for account in accounts:
                if account is not None:
                    for field, value in account.items():
                        if field == "UserID" and int(value) == int(account_id):
                            return account
            raise NotFoundError(f"Account {account_id} not found.")
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get account: {e}")

# For backward compatibility, instantiate a default service
account_service = AccountService()
add_account = account_service.add_account
delete_acc = account_service.delete_acc
delete_acc_range = account_service.delete_acc_range
get_acc = account_service.get_acc