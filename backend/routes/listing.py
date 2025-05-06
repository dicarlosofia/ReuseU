from flask import Blueprint, jsonify, request, g 
from services import listing_service
from services.jwt_middleware import jwt_required
import logging

listings_bp = Blueprint('listings_bp', __name__, url_prefix='/api/listings') 
logger = logging.getLogger(__name__)

# Retrieve a listing by its listing_id.
@listings_bp.route('/<string:listing_id>', methods=['GET'])
@jwt_required
def get_listing(listing_id): 
    marketplace_id = g.marketplace_id
    logger.info(f"GET /listings/{listing_id} for marketplace {marketplace_id}")
    try:
        listing_data = listing_service.get_listing(marketplace_id, listing_id)
        if listing_data:
            return jsonify(listing_data), 200
        else:
            logger.warning(f"Listing {listing_id} not found in marketplace {marketplace_id}")
            return jsonify({"message": f"Listing {listing_id} not found"}), 404
    except Exception as e:
         logger.error(f"Error fetching listing {listing_id} in marketplace {marketplace_id}: {e}", exc_info=True)
         return jsonify({"error": "Failed to retrieve listing"}), 500


# Retrieve all listings for the user's marketplace.
@listings_bp.route('/', methods=['GET'])
@jwt_required
def get_listings(): 
    marketplace_id = g.marketplace_id
    logger.info(f"GET /listings for marketplace {marketplace_id}")
    try:
        listing_data = listing_service.get_all_listings_total(marketplace_id)
        return jsonify(listing_data or []), 200 
    except Exception as e:
        logger.error(f"Error fetching all listings for marketplace {marketplace_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve listings"}), 500


# Retrieve all listings for a specific user within their marketplace.
@listings_bp.route('/user/<string:account_id>', methods=['GET'])
@jwt_required
def get_account_listing(account_id): 
    marketplace_id = g.marketplace_id
    logger.info(f"GET /listings/user/{account_id} for marketplace {marketplace_id}")
    try:
        listing_data = listing_service.get_all_listings_user(marketplace_id, account_id)
        return jsonify(listing_data or []), 200 
    except Exception as e:
         logger.error(f"Error fetching listings for user {account_id} in marketplace {marketplace_id}: {e}", exc_info=True)
         return jsonify({"error": "Failed to retrieve user listings"}), 500


# Create a new listing within the user's marketplace.
@listings_bp.route('/', methods=['POST'])
@jwt_required
def create_listing(): 
    marketplace_id = g.marketplace_id
    user_id = g.user_id 
    listing_data = request.json
    logger.info(f"POST /listings for user {user_id} in marketplace {marketplace_id}")

    if not listing_data:
        return jsonify({"error": "Request body cannot be empty."}), 400

    payload_user_id = listing_data.get('UserID')
    if payload_user_id and payload_user_id != user_id:
         logger.warning(f"Payload UserID '{payload_user_id}' differs from authenticated user '{user_id}'. Using authenticated user.")
         listing_data['UserID'] = user_id
    elif not payload_user_id:
        listing_data['UserID'] = user_id 

    try:
        new_listing_id = listing_service.add_listing(marketplace_id, listing_data)
        if new_listing_id:
             logger.info(f"Listing created with ID {new_listing_id} in marketplace {marketplace_id}")
             return jsonify({"message": "Listing created successfully", "listing_id": new_listing_id}), 201
        else:
             logger.error("add_listing service call did not return a new listing ID.")
             return jsonify({"error": "Failed to create listing - ID not returned."}), 500
    except ValueError as ve: 
         logger.error(f"Validation error creating listing: {ve}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Error creating listing for user {user_id} in marketplace {marketplace_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to create listing"}), 500


# Update a listing (requires service implementation).
@listings_bp.route('/<string:listing_id>', methods=['PUT'])
@jwt_required
def update_listing(listing_id): 
    marketplace_id = g.marketplace_id
    user_id = g.user_id
    listing_data = request.json
    logger.info(f"PUT /listings/{listing_id} for user {user_id} in marketplace {marketplace_id}")

    if not listing_data:
        return jsonify({"error": "Request body cannot be empty."}), 400

    try:
        updated_listing = listing_service.update_listing(marketplace_id, listing_id, user_id, listing_data)
        if updated_listing:
             logger.info(f"Listing {listing_id} updated in marketplace {marketplace_id}")
             return jsonify(updated_listing), 200
        else:
             logger.warning(f"Update failed or listing {listing_id} not found in marketplace {marketplace_id}")
             return jsonify({"message": f"Listing {listing_id} not found or update failed"}), 404 
    except PermissionError as pe: 
         logger.warning(f"Permission denied for user {user_id} updating listing {listing_id}: {pe}")
         return jsonify({"error": str(pe)}), 403
    except ValueError as ve:
         logger.error(f"Validation error updating listing {listing_id}: {ve}")
         return jsonify({"error": str(ve)}), 400
    except Exception as e:
        logger.error(f"Error updating listing {listing_id} for user {user_id} in marketplace {marketplace_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to update listing"}), 500


# Delete a listing (requires user ownership check).
@listings_bp.route('/<string:listing_id>', methods=['DELETE'])
@jwt_required
def remove_listing(listing_id): 
    marketplace_id = g.marketplace_id
    user_id = g.user_id
    logger.info(f"DELETE /listings/{listing_id} attempt by user {user_id} in marketplace {marketplace_id}")

    try:
        deleted = listing_service.del_listing(marketplace_id, listing_id, user_id)
        if deleted:
            logger.info(f"Listing {listing_id} deleted successfully by user {user_id} in marketplace {marketplace_id}")
            return jsonify({"message": f"Listing {listing_id} deleted successfully"}), 200
        else:
            logger.warning(f"Listing {listing_id} not found or delete failed for user {user_id} in marketplace {marketplace_id}")
            return jsonify({"message": f"Listing {listing_id} not found or could not be deleted"}), 404 
    except PermissionError as pe: 
         logger.warning(f"Permission denied for user {user_id} deleting listing {listing_id}: {pe}")
         return jsonify({"error": str(pe)}), 403
    except Exception as e:
        logger.error(f"Error deleting listing {listing_id} by user {user_id} in marketplace {marketplace_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete listing"}), 500
