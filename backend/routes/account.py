# routes/accounts.py
# Account-related API endpoints.
from flask import Blueprint, jsonify, request
from services.account_service import account_service
from services.exceptions import NotFoundError, DatabaseError
from services.jwt_middleware import jwt_required

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