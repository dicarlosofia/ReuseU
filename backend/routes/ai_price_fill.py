from flask import Blueprint, jsonify, request, g 
from services import openai_price_fill
from services.jwt_middleware import jwt_required
import logging

logger = logging.getLogger(__name__)

ai_price_fill_bp = Blueprint('ai_price_fill', __name__, url_prefix='/api/ai_price_fill')

# ensure authentication
@ai_price_fill_bp.route(methods=['GET'])
@jwt_required
def get_price_range(): 
    #get data from frontend
    price_fill_data = request.json
    category = price_fill_data['category']
    name = price_fill_data['name']
    description = price_fill_data['description']
    

    #this is the form of the call
    logger.info(f"GET /pricefill/{category}{name}{description}")
    try:
        #call the service
        range_data = openai_price_fill.get_price_prediction(category,name,description)
        if range_data:
            return jsonify(range_data), 200
        else:
            #check error conditions
            logger.warning(f"Item {name} did not successfully find a price range")
            return jsonify({"message": f"Item {name} did not successfully find a price range"}), 404
    except Exception as e:
         logger.error(f"Error to get price range: {e}", exc_info=True)
         return jsonify({"error": "Failed to get price range"}), 500