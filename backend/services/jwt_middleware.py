from firebase_admin import auth, db
from functools import wraps
from flask import request, jsonify, g
import logging

logger = logging.getLogger(__name__)

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')

        # Extract the token from the Authorization header.
        if auth_header and auth_header.startswith('Bearer '):
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                logger.warning("Malformed Bearer token in Authorization header.")
                return jsonify({'message': 'Invalid token format'}), 401
        elif 'Authorization' in request.headers:
             logger.warning("Authorization header present but doesn't start with 'Bearer '. Attempting to use it.")
             token = request.headers['Authorization']

        if not token:
            logger.warning("Authorization token is missing from headers.")
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Verify the token's validity.
            logger.debug("Verifying Firebase ID token...")
            decoded_token = auth.verify_id_token(token)
            user_id = decoded_token['uid']
            logger.info(f"Token verified for user_id: {user_id}")

            # Retrieve the user's account data from the database to determine their marketplace.
            logger.debug(f"Fetching account data for user_id: {user_id}")
            account_ref = db.reference(f'/Account/{user_id}')
            account_data = account_ref.get()

            if not account_data:
                # If the token is valid but there is no account record, return an error.
                logger.error(f"No account data found in DB for verified user_id: {user_id}")
                return jsonify({'message': 'User account record not found.'}), 404

            marketplace_id = account_data.get('marketplace_id')
            if not marketplace_id:
                # Fallback for legacy users: try to extract marketplace_id from email and update the account record.
                email = account_data.get('Email') or account_data.get('email')
                marketplace_id = None
                if email and '@' in email:
                    domain = email.split('@')[1].lower()
                    if domain.endswith('.edu'):
                        parts = domain.split('.')
                        if len(parts) >= 2:
                            candidate = parts[-2]
                            import re
                            if re.match(r"^[a-zA-Z0-9]+$", candidate):
                                marketplace_id = candidate
                                # Update the account record in the database
                                account_ref.update({'marketplace_id': marketplace_id})
                                logger.info(f"Auto-populated missing marketplace_id for user {user_id}: {marketplace_id}")
                if not marketplace_id:
                    logger.error(f"marketplace_id missing from account data for user_id: {user_id} and could not be auto-populated.")
                    return jsonify({'message': 'User marketplace information is missing. Please contact support or try re-logging.'}), 403

            # Store user and marketplace information in Flask's g context for use in downstream logic.
            logger.info(f"User {user_id} belongs to marketplace (from DB): {marketplace_id}")
            g.user_id = user_id
            g.marketplace_id = marketplace_id

        except auth.ExpiredIdTokenError:
            # The token has expired.
            logger.warning(f"Expired token received.")
            return jsonify({'message': 'Token has expired'}), 401
        except auth.InvalidIdTokenError as e:
            # Invalid token received.
            logger.error(f"Invalid token received: {e}", exc_info=False)
            return jsonify({'message': 'Token is invalid'}), 401
        except Exception as e:
            # Handle any unexpected errors during verification or database access.
            logger.error(f"Unexpected error during JWT verification or account fetch: {e}", exc_info=True)
            return jsonify({'message': 'Authentication error'}), 500

        return f(*args, **kwargs)
    return decorated
