from flask import Blueprint, request, jsonify
from services.message_service import add_message, delete_message

messages_bp = Blueprint('messages', __name__)

@messages_bp.route('', methods=['POST'])
def create_message():
    try:
        message_data = request.get_json()
        add_message(message_data)
        return jsonify({"message": "Message sent successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@messages_bp.route('/<int:message_id>', methods=['DELETE'])
def delete_message_route(message_id):
    try:
        delete_message(message_id)
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400 