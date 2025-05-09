from flask import Blueprint, jsonify, request, Response, current_app
import traceback
from services.account_service import account_service
from services.exceptions import NotFoundError, DatabaseError
from services.jwt_middleware import jwt_required
import logging

accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@accounts_bp.route('/<string:account_id>', methods=['GET'])
@jwt_required
def get_account(account_id):
    # User context is available via flask.g
    try:
        try:
            data = account_service.get_acc(account_id)
        except NotFoundError:
            data = account_service.get_acc_by_username(account_id)
        return jsonify(data), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/', methods=['POST'])
@jwt_required
def create_account():
    # User context is available via flask.g
    payload = request.get_json() or {}
    try:
        new_id = account_service.add_account(payload)
        return jsonify({
            "message": "Account created successfully",
            "account_id": new_id
        }), 201
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 400

@accounts_bp.route('/<string:account_id>', methods=['DELETE'])
@jwt_required
def delete_account(account_id):
    # User context is available via flask.g
    try:
        account_service.delete_acc(account_id)
        return jsonify({"message": f"Account {account_id} deleted"}), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/<string:account_id>', methods=['PUT'])
@jwt_required
def update_account(account_id):
    # User context is available via flask.g
    payload = request.get_json() or {}
    try:
        updated_account = account_service.update_acc(account_id, payload)
        return jsonify(updated_account), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

# --- FAVORITES ENDPOINTS ---
@accounts_bp.route('/<string:account_id>/favorites', methods=['GET'])
@jwt_required
def get_favorites(account_id):
    try:
        favorites = account_service.get_favorites(account_id)
        return jsonify({"Favorites": favorites}), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/<string:account_id>/favorites', methods=['PUT'])
@jwt_required
def update_favorites(account_id):
    payload = request.get_json() or {}
    favorites = payload.get('Favorites', [])
    try:
        updated = account_service.update_favorites(account_id, favorites)
        return jsonify({"Favorites": updated}), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500    
@accounts_bp.route('/<string:account_id>/pfp', methods=['OPTIONS', 'PUT'])
def update_pfp(account_id):
    # 1) CORS preflight
    if request.method == 'OPTIONS':
        return '', 200

    # 2) Actual PUT is protected
    def _protected():
        payload    = request.get_json() or {}
        data_bytes = payload.get('data_bytes')

        try:
            blob_key = account_service.add_pfp(account_id, data_bytes)
            return jsonify(pfp_key=blob_key), 200

        except LookupError as ve:
            return jsonify(message=str(ve)), 400

        except DatabaseError as de:
            return jsonify(error=str(de)), 500

    return _protected()


import logging

# Create a module‐level logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)   # you can adjust the level
@accounts_bp.route('/<string:account_id>/pfp', methods=['OPTIONS','GET'])
def get_pfp(account_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        logger.debug(f"GET /pfp for user_id={account_id}")
        img_bytes = account_service.get_pfp(account_id)
        logger.debug(f"Fetched {len(img_bytes)} bytes")
        return Response(img_bytes, mimetype='application/octet-stream'), 200

    except NotFoundError as nf:
        logger.info(f"No PFP for {account_id}: {nf}")
        return jsonify(message=str(nf)), 404

    except Exception as e:
        # full stacktrace to the console
        logger.error("Error in get_pfp:", exc_info=True)
        # echo the exception message in JSON (temporary)
        return jsonify(error=f"{type(e).__name__}: {e}"), 500