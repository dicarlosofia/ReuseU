from flask import Blueprint, jsonify, request
from services import listing_service

listings_bp = Blueprint('listing_bp', __name__)

#takes in listing_id integer
@listings_bp.route('/<string:listing_id>', methods=['GET'])
def get_listing(listing_id):
    listing_data = listing_service.get_listing(int(listing_id))
    if listing_data:
        return jsonify(listing_data), 200
    else:
        return jsonify({"message": f"Listing {listing_id} not found"}), 404

#takes in listing_id integer
@listings_bp.route('/', methods=['GET'])
def get_listings():
    listing_data = listing_service.get_all_listings_total()
    if listing_data:
        return jsonify(listing_data), 200
    else:
        return jsonify([]), 200

#takes in listing_id integer
@listings_bp.route('/user/<string:account_id>', methods=['GET'])
def get_account_listing(account_id):
    listing_data = listing_service.get_all_listings_user(int(account_id))
    if listing_data:
        return jsonify(listing_data), 200
    else:
        return jsonify([]), 200

#request.json should return object of form:
#{'Category': {1: 'Dinnerware', 2: 'Storage', 3: 'Above $500'}, 'CreateTime': '2025-04-08T21:11:00.569312Z', 'Description': 'Still in good condition, barely used.', 'Images': {7: 'image3.png'}, 'Price': '279.72', 'SellStatus': 1, 'Title': 'Vintage Leather Jacket', 'UserID': 412}
@listings_bp.route('/', methods=['POST'])
def create_listing():
    listing_data = request.json
    try:
        listing_service.add_listing(listing_data)
        return jsonify({"message": "Listing created successfully", "listing_id": listing_data.get('ListingID')}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Update listing is not implemented in services yet
@listings_bp.route('/<string:listing_id>', methods=['PUT'])
def update_listing(listing_id):
    listing_data = request.json
    # Note: The listing service doesn't have an update_listing function yet
    # This would need to be implemented in the listing_service.py file
    return jsonify({"message": f"Update listing endpoint - service function not implemented"}), 501

@listings_bp.route('/<string:listing_id>', methods=['DELETE'])
def remove_listing(listing_id):
    try:
        listing_service.del_listing(int(listing_id))
        return jsonify({"message": f"Listing {listing_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400