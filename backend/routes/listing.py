from flask import Blueprint, jsonify, request
#from ..services import account_service
#from ..services import listing_service
from services.listing_service import add_listing, del_listing, get_all_listings_total, get_listing_by_id, get_all_listings_user
#from ..services import message_service
#from ..services import review_service
#from ..services import transaction_service

listings_bp = Blueprint('listing_bp', __name__)



#takes in listing_id integer
@listings_bp.route('/<string:listing_id>', methods=['GET'])
def get_listing(listing_id):
    listing_data = get_listing_by_id(int(listing_id))
    #returns dictionary of form:
    #{'Category': [None, 'Storage', '$50 - $100'], 'CreateTime': '2025-04-08T18:58:02.585544Z', 'Description': 'Some wear and tear, but works perfectly.', 'Images': [None, 'image1.png', 'image2.png', None, 'nike_air_forces.jpeg'], 'ListingID': '1', 'Price': '561.57', 'SellStatus': 1, 'Title': 'Cookware Set', 'UserID': 802}
    return jsonify(listing_data), 200

#takes in listing_id integer
@listings_bp.route('/', methods=['GET'])
def get_listings():
     #notice we have a list of listing dictionaries:
    try:
        listings = get_all_listings_total()
        return jsonify({'listings': listings}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


#takes in listing_id integer
@listings_bp.route('/<string:account_id>', methods=['GET'])
def get_account_listing(account_id):
    listing_data = get_all_listings_user(int(account_id))
    #notice we have a list of listing dictionaries
    #[{'Category': [None, 'Storage', '$50 - $100'], 'CreateTime': '2025-04-08T18:58:02.585544Z', 'Description': 'Some wear and tear, but works perfectly.', 'Images': [None, 'image1.png', 'image2.png', None, 'nike_air_forces.jpeg'], 'ListingID': '1', 'Price': '561.57', 'SellStatus': 1, 'Title': 'Cookware Set', 'UserID': 802}, {'Category': [None, 'Cookware'], 'CreateTime': '2025-04-08T18:58:04.914682Z', 'Description': 'Rarely used, kept in storage most of the time.', 'Images': [None, 'image1.png', None, None, 'nike_air_forces.jpeg', 'image1.png'], 'ListingID': '15', 'Price': '960.44', 'SellStatus': 1, 'Title': 'Sony Headphones', 'UserID': 802}, {'Category': [None, '$100 - $500', 'Other'], 'CreateTime': '2025-04-08T18:58:05.066502Z', 'Description': 'Rarely used, kept in storage most of the time.', 'Images': {'5': 'image1.png'}, 'ListingID': '16', 'Price': '758.69', 'SellStatus': 0, 'Title': 'Cookware Set', 'UserID': 802}, {'Category': [None, 'Crafts', 'Tables', 'Appliances'], 'CreateTime': '2025-04-08T18:58:05.226950Z', 'Description': 'Some wear and tear, but works perfectly.', 'Images': {'4': 'nike_air_forces.jpeg', '5': 'image1.png', '6': 'myOldSweater.heic'}, 'ListingID': '17', 'Price': '14.48', 'SellStatus': 0, 'Title': 'Sony Headphones', 'UserID': 802}, {'Category': [None, '$50 - $100', 'Accessories', 'Audio'], 'CreateTime': '2025-04-08T18:58:05.965361Z', 'Description': 'Used frequently, but no major damage.', 'Images': {'6': 'myOldSweater.heic'}, 'ListingID': '22', 'Price': '172.15', 'SellStatus': 1, 'Title': 'iPhone 12', 'UserID': 802}, {'Category': [None, 'Storage', '$50 - $100', 'Tops'], 'CreateTime': '2025-04-08T18:58:08.875285Z', 'Description': 'Moderate use, but all functions are intact.', 'Images': {'7': 'image3.png'}, 'ListingID': '39', 'Price': '889.11', 'SellStatus': 0, 'Title': 'Dell Laptop', 'UserID': 802}, {'Category': [None, 'Crafts', 'Phones', 'Storage'], 'CreateTime': '2025-04-08T18:58:16.360158Z', 'Description': 'Brand new, never opened.', 'Images': {'2': 'image2.png'}, 'ListingID': '79', 'Price': '203.31', 'SellStatus': 0, 'Title': 'Gaming Chair', 'UserID': 802}, {'Category': [None, 'Tablets', 'Toys', '$100 - $500'], 'CreateTime': '2025-04-08T18:58:17.699792Z', 'Description': 'Well-maintained, only minor scratches.', 'Images': {'5': 'image1.png'}, 'ListingID': '87', 'Price': '447.63', 'SellStatus': 1, 'Title': 'Dell Laptop', 'UserID': 802}, {'Category': [None, 'Crafts', 'Beds', 'Shirts'], 'CreateTime': '2025-04-08T18:58:19.690727Z', 'Description': 'Some wear and tear, but works perfectly.', 'Images': {'7': 'image3.png'}, 'ListingID': '98', 'Price': '966.64', 'SellStatus': 1, 'Title': 'Wooden Dining Table', 'UserID': 802}, {'Category': [None, 'Shirts', 'TVs'], 'CreateTime': '2025-04-08T18:59:26.930578Z', 'Description': 'Like new, only used a couple of times.', 'Images': {'2': 'image2.png', '5': 'image1.png', '7': 'image3.png'}, 'ListingID': '102', 'Price': '125.50', 'SellStatus': 0, 'Title': 'Canon DSLR Camera', 'UserID': 802}, {'Category': [None, 'Above $500'], 'CreateTime': '2025-04-08T18:59:28.004464Z', 'Description': 'Has a few dents, but still works as expected.', 'Images': {'3': 'myDellLaptop.jpg'}, 'ListingID': '107', 'Price': '881.87', 'SellStatus': 0, 'Title': 'iPhone 12', 'UserID': 802}, {'Category': [None, 'Chairs'], 'CreateTime': '2025-04-08T18:59:28.344424Z', 'Description': 'Rarely used, kept in storage most of the time.', 'Images': [None, 'image1.png', 'image2.png'], 'ListingID': '109', 'Price': '214.83', 'SellStatus': 0, 'Title': 'Vintage Leather Jacket', 'UserID': 802}, {'Category': [None, 'Utensils', 'Laptops'], 'CreateTime': '2025-04-08T18:59:30.139668Z', 'Description': 'Brand new, never opened.', 'Images': {'5': 'image1.png', '6': 'myOldSweater.heic'}, 'ListingID': '118', 'Price': '108.36', 'SellStatus': 0, 'Title': 'Gaming Chair', 'UserID': 802}, {'Category': [None, 'Storage', 'Accessories'], 'CreateTime': '2025-04-08T18:59:32.280670Z', 'Description': 'Brand new, never opened.', 'Images': [None, 'image1.png'], 'ListingID': '128', 'Price': '137.53', 'SellStatus': 0, 'Title': 'Sony Headphones', 'UserID': 802}, {'Category': [None, 'Tablets'], 'CreateTime': '2025-04-08T18:59:33.314237Z', 'Description': 'Pristine condition, includes original packaging.', 'Images': {'4': 'nike_air_forces.jpeg', '7': 'image3.png'}, 'ListingID': '134', 'Price': '794.72', 'SellStatus': 0, 'Title': 'Electric Guitar', 'UserID': 802}, {'Category': [None, 'Dresses', 'Utensils', 'Crafts'], 'CreateTime': '2025-04-08T18:59:33.940382Z', 'Description': 'Still in good condition, barely used.', 'Images': [None, None, 'image2.png', 'myDellLaptop.jpg'], 'ListingID': '137', 'Price': '76.20', 'SellStatus': 1, 'Title': 'Canon DSLR Camera', 'UserID': 802}, {'Category': [None, 'Beds'], 'CreateTime': '2025-04-08T18:59:36.567225Z', 'Description': 'Brand new, never opened.', 'Images': {'1': 'image1.png', '2': 'image2.png', '7': 'image3.png'}, 'ListingID': '149', 'Price': '935.80', 'SellStatus': 1, 'Title': 'Wooden Dining Table', 'UserID': 802}, {'Category': [None, 'Tables', 'Art', '$50 - $100'], 'CreateTime': '2025-04-08T18:59:37.064213Z', 'Description': 'Has a few dents, but still works as expected.', 'Images': {'7': 'image3.png'}, 'ListingID': '152', 'Price': '292.78', 'SellStatus': 1, 'Title': 'Mountain Bike', 'UserID': 802}, {'Category': [None, 'Tables'], 'CreateTime': '2025-04-08T18:59:45.282040Z', 'Description': 'Has a few dents, but still works as expected.', 'Images': {'1': 'image1.png', '5': 'image1.png', '6': 'myOldSweater.heic'}, 'ListingID': '197', 'Price': '643.86', 'SellStatus': 1, 'Title': 'Dell Laptop', 'UserID': 802}]
    return jsonify(listing_data), 200


#request.json should return object of form:
#{'Category': {1: 'Dinnerware', 2: 'Storage', 3: 'Above $500'}, 'CreateTime': '2025-04-08T21:11:00.569312Z', 'Description': 'Still in good condition, barely used.', 'Images': {7: 'image3.png'}, 'Price': '279.72', 'SellStatus': 1, 'Title': 'Vintage Leather Jacket', 'UserID': 412}
@listings_bp.route('/', methods=['POST'])
def create_listing():
    data = request.get_json()
    
    # Check for required fields
    required_fields = ['Title', 'Description', 'Price', 'Category', 'UserID']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        listing = add_listing(data)
        return jsonify(listing), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#not implemented in services
@listings_bp.route('/<string:listing_id>', methods=['PUT'])
def update_listing(listing_id):
    data = request.get_json()
    
    try:
        # First check if listing exists
        existing_listing = get_listing_by_id(int(listing_id))
        if not existing_listing:
            return jsonify({'error': 'Listing not found'}), 404
            
        # Delete old listing
        del_listing(int(listing_id))
        
        # Create new listing with updated data
        updated_listing = add_listing({**data, 'ListingID': int(listing_id)})
        return jsonify(updated_listing), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#takes in listing_id integer
@listings_bp.route('/<string:listing_id>', methods=['DELETE'])
def remove_listing(listing_id):
    del_listing(int(listing_id))
    return jsonify({"message": f"Listing {listing_id} deleted successfully"}), 200