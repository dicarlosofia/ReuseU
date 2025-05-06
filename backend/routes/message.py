from flask import Blueprint, request, jsonify
from services.message_service import add_message, delete_message
from services.jwt_middleware import jwt_required

messages_bp = Blueprint('messages', __name__)

# api route to create a message
@messages_bp.route('', methods=['POST'])
@jwt_required
def create_message(current_user):
    try:
        message_data = request.get_json()
        add_message(message_data)
        return jsonify({"message": "Message sent successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# api route to delete a message
@messages_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required
def delete_message_route(current_user, message_id):
    try:
        delete_message(message_id)
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400