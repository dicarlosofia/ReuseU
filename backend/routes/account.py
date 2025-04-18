from flask import Blueprint, jsonify, request
from ..services import account_service

accounts_bp = Blueprint('accounts_bp', __name__)

@accounts_bp.route('/<string:account_id>', methods=['GET'])
def get_account(account_id):
    account_data = account_service.get_acc(int(account_id))
    if account_data:
        return jsonify(account_data), 200
    else:
        return jsonify({"message": f"Account {account_id} not found"}), 404

@accounts_bp.route('/', methods=['POST'])
def create_account():
    account_data = request.json
    try:
        account_service.add_account(account_data)
        return jsonify({
            "message": "Account created successfully", 
            "account_id": account_data.get('UserID')
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@accounts_bp.route('/<string:account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        account_service.delete_acc(int(account_id))
        return jsonify({"message": f"Account {account_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
