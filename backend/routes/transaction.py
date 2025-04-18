from flask import Blueprint, jsonify, request
from ..services import transaction_service

transactions_bp = Blueprint('transactions_bp', __name__)

# api route to get all transactions
@transactions_bp.route('/', methods=['GET'])
def get_transactions():
    # Mock implementation
    return jsonify({"transactions": [
        {"id": "trans1", "listing_id": "listing123", "buyer_id": "user456", "seller_id": "user123", "status": "pending", "created_at": "2025-04-07T10:00:00Z"},
        {"id": "trans2", "listing_id": "listing456", "buyer_id": "user789", "seller_id": "user123", "status": "completed", "created_at": "2025-04-06T15:30:00Z"}
    ]}), 200

@transactions_bp.route('/<string:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    transaction_data = transaction_service.get_transaction(int(transaction_id))
    if transaction_data:
        return jsonify(transaction_data), 200
    else:
        return jsonify({"message": f"Transaction {transaction_id} not found"}), 404

# api route that creates a transaction
@transactions_bp.route('/', methods=['POST'])
def create_transaction():
    transaction_data = request.json
    # Mock implementation
    # In a real implementation, would call: create_transaction(transaction_data)
    return jsonify({"message": "Transaction created successfully", "transaction_id": "new_transaction_id"}), 201

@transactions_bp.route('/<string:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    transaction_data = request.json
    # Mock implementation
    # In a real implementation, would call: update_transaction(transaction_id, transaction_data)
    return jsonify({"message": f"Transaction {transaction_id} updated successfully"}), 200

@transactions_bp.route('/<string:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    try:
        transaction_service.delete_transaction(int(transaction_id))
        return jsonify({"message": f"Transaction {transaction_id} deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
