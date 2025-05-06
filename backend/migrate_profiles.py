import firebase_admin
from firebase_admin import credentials, db
import re

# Helper to extract marketplace_id from .edu email
def get_marketplace_id_from_email(email):
    if not email or '@' not in email:
        return None
    domain = email.split('@')[1].lower()
    if domain.endswith('.edu'):
        parts = domain.split('.')
        if len(parts) >= 2:
            marketplace_id = parts[-2]
            if re.match(r"^[a-zA-Z0-9]+$", marketplace_id):
                return marketplace_id
    return None

# Initialize Firebase
cred = credentials.Certificate("pk.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
})

ref = db.reference('/')

# Source and destination are both /Account, but migrate any account missing 'marketplace_id' or other new fields
accounts = ref.child('Account').get() or {}

migrated = 0
skipped = 0

for user_id, profile in accounts.items():
    # Only migrate if marketplace_id is missing or empty
    marketplace_id = profile.get('marketplace_id')
    email = profile.get('email') or profile.get('Email')
    if marketplace_id:
        print(f"User {user_id} already has marketplace_id. Skipping.")
        skipped += 1
        continue
    if not email:
        print(f"User {user_id} has no email. Skipping.")
        skipped += 1
        continue
    new_marketplace_id = get_marketplace_id_from_email(email)
    if not new_marketplace_id:
        print(f"Could not determine marketplace_id for {user_id} ({email}). Skipping.")
        skipped += 1
        continue
    ref.child('Account').child(user_id).update({'marketplace_id': new_marketplace_id})
    print(f"Migrated {user_id}: set marketplace_id to {new_marketplace_id}.")
    migrated += 1

print(f"Migration complete. Migrated: {migrated}, Skipped: {skipped}")
