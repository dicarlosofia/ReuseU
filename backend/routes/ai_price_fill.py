from flask import Blueprint, jsonify, request, g
from services import openai_price_fill
from services.jwt_middleware import jwt_required
import logging
import traceback

logger = logging.getLogger(__name__)


# matches the format in pages
ai_price_fill_bp = Blueprint('ai_price_fill', __name__, url_prefix='/api/ai_price_fill')

@ai_price_fill_bp.route('/', methods=['POST', 'OPTIONS'])
def get_price_range():
    # allow CORS preflight through without auth
    if request.method == 'OPTIONS':
        return '', 200

    # ensure authentication
    @jwt_required
    def _protected():
        # get data from frontend JSON body
        price_fill_data = request.json or {}
        category    = price_fill_data.get('category')
        name        = price_fill_data.get('name')
        description = price_fill_data.get('description')

        logger.info(
            f"POST /api/ai_price_fill/ payload: "
            f"category={category}, name={name}, description={description}"
        )
        try:
            # call the service
            range_data = openai_price_fill.get_price_prediction(
                category, name, description
            )
            if range_data:
                return jsonify(range_data), 200
            else:
                # error handling
                logger.warning(
                    f"Item {name} did not successfully find a price range"
                )
                return jsonify({
                    "message": f"Item {name} did not successfully find a price range"
                }), 404

        except Exception as e:
            tb = traceback.format_exc()
            logger.error(f"Error getting price range: {e}", exc_info=True)
            return jsonify({
                "message": "Failed to get price range",
                "error": str(e),
                "trace": tb 
            }), 500

    # call our protected POST handler
    return _protected()