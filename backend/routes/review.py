from flask import Blueprint, jsonify, request
# Import services once they're implemented
# from services.review_service import create_review, get_review, update_review, delete_review
from services.review_service import get_all_reviews, get_review, add_review, del_review

reviews_bp = Blueprint('reviews_bp', __name__)

# api route to all reviews currently stored in the db
@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    review_data = get_all_reviews()
    #notice review data is of form: (listing of reviews)
    #[{'ListingID': '195', 'Rating': 2, 'Review': 'Condition was okay, but definitely used more than stated.', 'ReviewDate': '2025-04-08T19:02:50.166324Z', 'ReviewerID': 17074, 'SellerID': 61273}, {'ListingID': '199', 'Rating': 4, 'Review': 'There were some scratches not shown in the photos.', 'ReviewDate': '2025-04-08T19:02:47.130622Z', 'ReviewerID': 12615, 'SellerID': 73825}, {'ListingID': '200', 'Rating': 4, 'Review': 'Item works, but smells strongly of perfume for some reason.', 'ReviewDate': '2025-04-08T19:02:59.793813Z', 'ReviewerID': 50329, 'SellerID': 65603}]]
    return jsonify(review_data), 200

# api route to get a review
@reviews_bp.route('/<string:review_id>', methods=['GET'])
def get_review(listing_id):
    review_data = get_review(int(listing_id))
    #review is of form:
    #{'ListingID': '17', 'Rating': 4, 'Review': 'Had more dents than I was expecting.', 'ReviewDate': '2025-04-08T19:02:24.036344Z', 'ReviewerID': 29280, 'SellerID': 62416}
    return jsonify(review_data), 200

# api route to create a review, may reject if the particular listing does not exist
@reviews_bp.route('/', methods=['POST'])
def create_review():
    review_data = request.json
    #review data should have form:
    #{'ListingID': '121', 'Rating': 4, 'Review': 'Not bad, but buying process took a while.', 'ReviewDate': '2025-04-08T21:20:27.011530Z', 'ReviewerID': 18949, 'SellerID': 59130}
    add_review(review_data)
    return jsonify({"message": "Review created successfully", "review_id": "new_review_id"}), 201

#not implemented in services
@reviews_bp.route('/<string:review_id>', methods=['PUT'])
def update_review(listing_id):
    review_data = request.json
    # Mock implementation
    # In a real implementation, would call: update_review(review_id, review_data)
    return jsonify({"message": f"Review {listing_id} updated successfully"}), 200

# api route that expects listing id and deletes a review
@reviews_bp.route('/<string:review_id>', methods=['DELETE'])
def delete_review(listing_id):
    del_review(int(listing_id))
    return jsonify({"message": f"Review {listing_id} deleted successfully"}), 200
