from flask import Blueprint, jsonify, request
from ..services import review_service

reviews_bp = Blueprint('reviews_bp', __name__)

# api route to all reviews currently stored in the db
@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    review_data = get_all_reviews()
    #notice review data is of form: (listing of reviews)
    #[{'ListingID': '195', 'Rating': 2, 'Review': 'Condition was okay, but definitely used more than stated.', 'ReviewDate': '2025-04-08T19:02:50.166324Z', 'ReviewerID': 17074, 'SellerID': 61273}, {'ListingID': '199', 'Rating': 4, 'Review': 'There were some scratches not shown in the photos.', 'ReviewDate': '2025-04-08T19:02:47.130622Z', 'ReviewerID': 12615, 'SellerID': 73825}, {'ListingID': '200', 'Rating': 4, 'Review': 'Item works, but smells strongly of perfume for some reason.', 'ReviewDate': '2025-04-08T19:02:59.793813Z', 'ReviewerID': 50329, 'SellerID': 65603}]]
    return jsonify(review_data), 200

@reviews_bp.route('/<string:listing_id>', methods=['GET'])
def get_review(listing_id):
    review_data = review_service.get_review(int(listing_id))
    if review_data:
        return jsonify(review_data), 200
    else:
        return jsonify({"message": f"Review for listing {listing_id} not found"}), 404

# api route to create a review, may reject if the particular listing does not exist
@reviews_bp.route('/', methods=['POST'])
def create_review():
    review_data = request.json
    # Review data should have form:
    # {'ListingID': '121', 'Rating': 4, 'Review': 'Not bad, but buying process took a while.', 
    #  'ReviewDate': '2025-04-08T21:20:27.011530Z', 'ReviewerID': 18949, 'SellerID': 59130}
    try:
        review_service.add_review(review_data)
        return jsonify({"message": "Review created successfully", "listing_id": review_data.get('ListingID')}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred"}), 500

# Update review is not implemented in services yet
@reviews_bp.route('/<string:listing_id>', methods=['PUT'])
def update_review(listing_id):
    review_data = request.json
    # Note: The review service doesn't have an update_review function yet
    # This would need to be implemented in the review_service.py file
    return jsonify({"message": f"Update review endpoint - service function not implemented"}), 501

@reviews_bp.route('/<string:listing_id>', methods=['DELETE'])
def delete_review(listing_id):
    try:
        review_service.del_review(int(listing_id))
        return jsonify({"message": f"Review for listing {listing_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
