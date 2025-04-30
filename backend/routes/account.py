# routes/accounts.py
from flask import Blueprint, jsonify, request
from services.account_service import account_service
from services.exceptions import NotFoundError, DatabaseError

accounts_bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@accounts_bp.route('/<string:account_id>', methods=['GET'])
def get_account(account_id):
    try:
        data = account_service.get_acc(account_id)
        return jsonify(data), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/', methods=['POST'])
def create_account():
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
def delete_account(account_id):
    try:
        account_service.delete_acc(account_id)
        return jsonify({"message": f"Account {account_id} deleted"}), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500

@accounts_bp.route('/<string:account_id>', methods=['PUT'])
def update_account(account_id):
    payload = request.get_json() or {}
    try:
        updated_account = account_service.update_acc(account_id, payload)
        return jsonify(updated_account), 200
    except NotFoundError as e:
        return jsonify({"message": str(e)}), 404
    except DatabaseError as e:
        return jsonify({"error": str(e)}), 500