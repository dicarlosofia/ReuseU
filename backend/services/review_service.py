import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, Dict, Any, List
from .exceptions import ServiceError, NotFoundError, ValidationError, DatabaseError
from .listing_service import get_listing

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

class ReviewService:
    def __init__(self, db_ref=None):
        """Initialize ReviewService with optional database reference for testability."""
        self.ref = db_ref or get_db_root()

    def add_review(self, review_data: Dict[str, Any]) -> str:
        """Add a review for a listing. Returns the ListingID."""
        required = ['ListingID', 'Rating', 'Review', 'ReviewDate', 'ReviewerID', 'SellerID']
        for field in required:
            if field not in review_data:
                raise ValidationError(f"Missing field '{field}' in review_data.")
        listing_id = str(review_data['ListingID'])
        try:
            get_listing(listing_id)
        except NotFoundError:
            raise NotFoundError(f"Listing {listing_id} not found.")
        except ServiceError as e:
            raise DatabaseError(f"Failed to verify listing: {e}")
        try:
            self.ref.child('Review').child(listing_id).set(review_data)
            return listing_id
        except Exception as e:
            raise DatabaseError(f"Failed to add review: {e}")

    def del_review(self, listing_id: str) -> None:
        """Delete a review by its ListingID."""
        try:
            review_ref = self.ref.child('Review').child(str(listing_id))
            if not review_ref.get():
                raise NotFoundError(f"Review for listing {listing_id} not found.")
            review_ref.delete()
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to delete review: {e}")

    def get_review(self, listing_id: str) -> Dict[str, Any]:
        """Get the review for a specific listing."""
        try:
            review = self.ref.child('Review').child(str(listing_id)).get()
            if not review:
                raise NotFoundError(f"Review for listing {listing_id} not found.")
            return review
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get review: {e}")

    def get_all_reviews(self) -> List[Dict[str, Any]]:
        """Get all reviews in the database."""
        try:
            reviews = self.ref.child('Review').get()
            if not reviews:
                raise NotFoundError("No reviews found.")
            return [r for r in reviews.values() if r is not None]
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get all reviews: {e}")
        
    
    def get_sellers_reviews(self, seller_id: int) -> Dict[str, Any]:
        '''Get all reviews associated with the seller.'''
        try:
            reviews = self.ref.child('Review').get()
            if not reviews:
                raise NotFoundError("No reviews found.")
            return [r for r in reviews.values() if r is not None and r["SellerID"] == seller_id]
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get all reviews: {e}")
        
    def get_sellers_stars(self, seller_id: int) -> Dict[str, Any]:
        '''Get start rating of the seller.'''
        try:
            reviews_filtered = get_sellers_reviews(seller_id)
            if not reviews_filtered:
                return None
            number_revs = len(reviews_filtered)
            sum_revs = 0
            for data_dict in reviews_filtered:
                sum_revs += data_dict['Rating']
            stars = float(sum_revs)/ float(number_revs)
            return stars
        except ServiceError:
            raise
        except Exception as e:
            raise DatabaseError(f"Failed to get all reviews: {e}")

# Default instance
review_service = ReviewService()
add_review = review_service.add_review
del_review = review_service.del_review
get_review = review_service.get_review
get_all_reviews = review_service.get_all_reviews
get_sellers_reviews = review_service.get_sellers_reviews
get_sellers_stars = review_service.get_sellers_stars


print(get_sellers_reviews())
print(get_sellers_stars())





