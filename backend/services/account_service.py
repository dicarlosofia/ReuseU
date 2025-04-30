# services/account_service.py

import firebase_admin
from firebase_admin import credentials, db
from typing import Dict, Any
from .exceptions import NotFoundError, DatabaseError

def get_db_root():
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
        self.ref = db_ref or get_db_root()

    def add_account(self, account_data: Dict[str, Any]) -> str:
        """
        Use the provided UserID (firebase uid) as the key.
        """
        try:
            uid = account_data.get('UserID')
            if not uid:
                raise ValueError("AccountData must include UserID")
            self.ref.child('Account').child(uid).set(account_data)
            return uid
        except Exception as e:
            raise DatabaseError(f"Failed to add account: {e}")

    def get_acc(self, account_id: str) -> Dict[str, Any]:
        """Read directly by the Firebase uid key."""
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
        """
        try:
            acc_ref = self.ref.child('Account').child(account_id)
            existing = acc_ref.get()
            if not existing:
                raise NotFoundError(f"Account {account_id} not found.")
            
            # Merge existing data with update data
            updated_data = {**existing, **update_data}
            acc_ref.update(update_data)
            return updated_data
        except NotFoundError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to update account: {e}")

# singletons
account_service = AccountService()
add_account      = account_service.add_account
get_acc          = account_service.get_acc
delete_acc       = account_service.delete_acc
