import firebase_admin
from firebase_admin import credentials, db
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_db_root():
    """Get the root of the Firebase database."""
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

# Get the global reference
ref = get_db_root()