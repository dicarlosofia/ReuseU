from flask import Blueprint, request, jsonify
from services.account_service import add_account, delete_acc, delete_acc_range

accounts_bp = Blueprint('accounts', __name__)

# api route to create an account
@accounts_bp.route('', methods=['POST'])
def create_account():
    try:
        account_data = request.get_json()
        add_account(account_data)
        return jsonify({"message": "Account created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# api route to delete an account
@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        delete_acc(account_id)
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# api route to delete accounts in a range
@accounts_bp.route('/range', methods=['DELETE'])
def delete_accounts_range():
    try:
        data = request.get_json()
        min_id = data.get('min')
        max_id = data.get('max')
        if not min_id or not max_id:
            return jsonify({"error": "min and max IDs are required"}), 400
        delete_acc_range(min_id, max_id)
        return jsonify({"message": "Accounts deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 