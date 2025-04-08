from flask import Blueprint, jsonify, request
# Import services once they're implemented
# from services.listing_service import create_listing, get_listing, update_listing, delete_listing

listings_bp = Blueprint('listing_bp', __name__)

@listings_bp.route('/', methods=['GET'])
def get_listings():
    # Mock implementation
    return jsonify({"listings": [
        {"id": "listing1", "title": "Textbook for CS101", "description": "Barely used textbook for CS101", "price": 50.00, "seller_id": "user123", "category": ["Books"], "condition": "Like New", "created_at": "2025-04-07T10:00:00Z"},
        {"id": "listing2", "title": "Desk Lamp", "description": "LED desk lamp, adjustable brightness", "price": 15.00, "seller_id": "user456", "category": ["Furniture"], "condition": "Good", "created_at": "2025-04-06T15:30:00Z"}
    ]}), 200

@listings_bp.route('/<string:listing_id>', methods=['GET'])
def get_listing(listing_id):
    # Mock implementation
    return jsonify({
        "id": listing_id,
        "title": "Textbook for CS101",
        "description": "Barely used textbook for CS101",
        "price": 50.00,
        "seller_id": "user123",
        "category": ["Books"],
        "condition": "Like New",
        "created_at": "2025-04-07T10:00:00Z",
        "images": ["image1.jpg", "image2.jpg"]
    }), 200
    
@listings_bp.route('/', methods=['POST'])
def create_listing():
    listing_data = request.json
    # Mock implementation
    # In a real implementation, would call: create_listing(listing_data)
    return jsonify({"message": "Listing created successfully", "listing_id": "new_listing_id"}), 201

@listings_bp.route('/<string:listing_id>', methods=['PUT'])
def update_listing(listing_id):
    listing_data = request.json
    # Mock implementation
    # In a real implementation, would call: update_listing(listing_id, listing_data)
    return jsonify({"message": f"Listing {listing_id} updated successfully"}), 200

@listings_bp.route('/<string:listing_id>', methods=['DELETE'])
def remove_listing(listing_id):
    # Mock implementation
    # In a real implementation, would call: delete_listing(listing_id)
    return jsonify({"message": f"Listing {listing_id} deleted successfully"}), 200