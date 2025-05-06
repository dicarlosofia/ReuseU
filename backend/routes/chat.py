from flask import Blueprint, jsonify, request, g
from flask_cors import CORS
from firebase_admin import auth
from database import ref
from datetime import datetime
import uuid
import json
import traceback
import logging

from services.jwt_middleware import jwt_required

logger = logging.getLogger(__name__)

chats_bp = Blueprint('chats_bp', __name__)
CORS(chats_bp)

def get_user_info(user_id):
    try:
        user = auth.get_user(user_id)
        return {
            'username': user.display_name or user.email.split('@')[0],
            'avatar': user.photo_url
        }
    except Exception as e:
        logger.warning(f"Failed to get user info for {user_id}: {e}", exc_info=False)
        return {'username': 'Unknown User', 'avatar': None}

def _get_marketplace_chats_ref():
    if not hasattr(g, 'marketplace_id') or not g.marketplace_id:
        logger.error("Marketplace ID not found in request context (g)")
        raise ValueError("Marketplace ID not found in request context (g)")
    return ref.child(g.marketplace_id).child('Chat')

@chats_bp.route('/user', methods=['GET'])
@jwt_required
def get_user_chats():
    if not hasattr(g, 'user_id') or not hasattr(g, 'marketplace_id'):
        logger.error("User ID or Marketplace ID missing from request context (g)")
        return jsonify({"error": "Authentication context incomplete"}), 401

    user_id = g.user_id
    marketplace_id = g.marketplace_id
    logger.info(f"Fetching chats for user {user_id} in marketplace {marketplace_id}")
    try:
        chats_ref = _get_marketplace_chats_ref()
        all_chats = chats_ref.get() or {}
        logger.debug(f"Retrieved {len(all_chats)} total chats from marketplace path {chats_ref.path}")

        user_chats = []
        for chat_id, chat_data in all_chats.items():
            if not isinstance(chat_data, dict):
                logger.warning(f"Skipping invalid chat data (not a dict) for chat_id {chat_id} in marketplace {marketplace_id}")
                continue

            participants = chat_data.get('Participants', [])
            if user_id in participants:
                other_user_id = next((uid for uid in participants if uid != user_id), None)

                messages = chat_data.get('Messages', {})
                last_message = None

                if isinstance(messages, dict) and messages:
                    try:
                        last_msg_key = sorted(messages.keys())[-1]
                        msg_data = messages[last_msg_key]
                        if isinstance(msg_data, dict):
                            last_message = {
                                'text': msg_data.get('Content', ''),
                                'timestamp': msg_data.get('Timestamp', '')
                            }
                        else:
                            logger.warning(f"Last message data (key {last_msg_key}) in chat {chat_id} is not a dictionary.")
                    except IndexError:
                        logger.debug(f"Messages dictionary for chat {chat_id} is empty.")
                    except Exception as e:
                        logger.error(f"Error processing last message for chat {chat_id}: {e}", exc_info=True)

                user_chats.append({
                    'id': chat_id,
                    'listing_id': chat_data.get('ListingID'),
                    'other_user': get_user_info(other_user_id) if other_user_id else {'username': 'Unknown Participant', 'avatar': None},
                    'last_message': last_message
                })

        logger.info(f"Found {len(user_chats)} chats for user {user_id} in marketplace {marketplace_id}")
        return jsonify({"chats": user_chats}), 200
    except ValueError as ve:
        logger.error(f"Value error getting user chats for {user_id}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        marketplace_log_id = g.get('marketplace_id', 'UNKNOWN')
        logger.error(f"Error fetching chats for user {user_id} in marketplace {marketplace_log_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve chats"}), 500

@chats_bp.route('/<string:chat_id>', methods=['GET'])
@jwt_required
def get_chat_messages(chat_id):
    if not hasattr(g, 'user_id') or not hasattr(g, 'marketplace_id'):
         logger.error("User ID or Marketplace ID missing from request context (g) in get_chat_messages")
         return jsonify({"error": "Authentication context incomplete"}), 401

    user_id = g.user_id
    marketplace_id = g.marketplace_id
    logger.info(f"Fetching messages for chat {chat_id} in marketplace {marketplace_id} for user {user_id}")
    try:
        chats_ref = _get_marketplace_chats_ref()
        chat_ref = chats_ref.child(chat_id)
        chat = chat_ref.get()

        if not chat or not isinstance(chat, dict):
            logger.warning(f"Chat {chat_id} not found in marketplace {marketplace_id}")
            return jsonify({"error": "Chat not found"}), 404

        participants = chat.get('Participants', [])
        if user_id not in participants:
            logger.warning(f"Permission denied: User {user_id} tried to access chat {chat_id} (marketplace {marketplace_id}) they are not part of.")
            return jsonify({"error": "Access forbidden"}), 403

        messages_data = chat.get('Messages', {}) or {}
        message_list = []

        for msg_id, msg in sorted(messages_data.items()):
             if isinstance(msg, dict): 
                message_list.append({
                    'id': msg.get('MessageID', msg_id), 
                    'sender_id': msg.get('SenderID', ''),
                    'message': msg.get('Content', ''), 
                    'timestamp': msg.get('Timestamp', ''),
                    'read': msg.get('Read', False) 
                })
             else:
                 logger.warning(f"Skipping invalid message data (not a dict) for msg_id {msg_id} in chat {chat_id}")

        logger.info(f"Successfully retrieved {len(message_list)} messages for chat {chat_id}")
        return jsonify({
            'chat_id': chat_id,
            'listing_id': chat.get('ListingID', ''), 
            'participants': participants, 
            'messages': message_list
        }), 200

    except ValueError as ve:
        logger.error(f"Value error getting chat messages for {chat_id}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        marketplace_log_id = g.get('marketplace_id', 'UNKNOWN')
        logger.error(f"Error fetching messages for chat {chat_id} in marketplace {marketplace_log_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to retrieve messages"}), 500


@chats_bp.route('', methods=['POST'])
@jwt_required
def start_or_get_chat(): 
    if not hasattr(g, 'user_id') or not hasattr(g, 'marketplace_id'):
         logger.error("User ID or Marketplace ID missing from request context (g) in start_or_get_chat")
         return jsonify({"error": "Authentication context incomplete"}), 401

    user_id = g.user_id 
    marketplace_id = g.marketplace_id
    logger.info(f"Start/Get chat request by user {user_id} in marketplace {marketplace_id}")

    data = request.json
    if not data:
        logger.warning(f"Missing JSON body in start_or_get_chat request by {user_id}")
        return jsonify({"error": "Request body must be JSON"}), 400

    listing_id = data.get('listing_id')
    seller_id = data.get('seller_id') 
    buyer_id = user_id # We use g.user_id as the buyer

    if not listing_id or not seller_id:
        logger.warning(f"Missing listing_id or seller_id in start_or_get_chat request by {user_id}")
        return jsonify({"error": "Missing listing_id or seller_id"}), 400
    if user_id == seller_id:
         logger.warning(f"User {user_id} attempted to start chat with themselves for listing {listing_id}")
         return jsonify({"error": "Cannot start chat with yourself"}), 400

    logger.debug(f"Request details: listing={listing_id}, seller={seller_id}, buyer={user_id}, marketplace={marketplace_id}")

    try:
        chats_ref = _get_marketplace_chats_ref()
        existing_chats = chats_ref.get() or {}

        existing_chat_id = None
        existing_chat_data = None
        participants_set = {user_id, seller_id}

        for chat_id_key, chat_data_val in existing_chats.items():
            if isinstance(chat_data_val, dict):
                 if str(chat_data_val.get('ListingID')) == str(listing_id) and \
                    set(chat_data_val.get('Participants', [])) == participants_set:
                    existing_chat_id = chat_id_key
                    existing_chat_data = chat_data_val
                    logger.info(f"Found existing chat {existing_chat_id} for listing {listing_id} between {user_id} and {seller_id} in marketplace {marketplace_id}")
                    break
            else:
                logger.warning(f"Skipping invalid chat data (not a dict) for chat_id {chat_id_key} during lookup.")

        if existing_chat_id and existing_chat_data:
            chat_id = existing_chat_id
            created_at = existing_chat_data.get('CreatedAt', datetime.utcnow().isoformat()) 
            status_code = 200 
        else:
            logger.info(f"Creating new chat for listing {listing_id} between {user_id} and {seller_id} in marketplace {marketplace_id}")
            timestamp = datetime.utcnow().isoformat()
            new_chat_payload = {
                'ListingID': listing_id,
                'Participants': [user_id, seller_id], 
                'CreatedAt': timestamp,
                'Messages': {} 
            }
            new_chat_ref = chats_ref.push(new_chat_payload)
            chat_id = new_chat_ref.key
            created_at = timestamp
            status_code = 201 
            logger.info(f"Created new chat with ID: {chat_id} in marketplace {marketplace_id}")

        seller_info = get_user_info(seller_id)

        return jsonify({
            'id': chat_id,
            'listing_id': listing_id,
            'buyer_id': user_id, 
            'seller_id': seller_id, 
            'other_user': seller_info, 
            'created_at': created_at 
        }), status_code 

    except ValueError as ve:
        logger.error(f"Value error starting/getting chat: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        marketplace_log_id = g.get('marketplace_id', 'UNKNOWN')
        logger.error(f"Error starting/getting chat for listing {listing_id}, buyer {user_id}, seller {seller_id}, marketplace {marketplace_log_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to start or retrieve chat"}), 500

@chats_bp.route('/<string:chat_id>/messages', methods=['POST'])
@jwt_required
def send_chat_message(chat_id): 
    if not hasattr(g, 'user_id') or not hasattr(g, 'marketplace_id'):
         logger.error("User ID or Marketplace ID missing from request context (g) in send_chat_message")
         return jsonify({"error": "Authentication context incomplete"}), 401

    user_id = g.user_id 
    marketplace_id = g.marketplace_id
    logger.info(f"Sending message to chat {chat_id} in marketplace {marketplace_id} by user {user_id}")

    data = request.json
    if not data:
        logger.warning(f"Missing JSON body in send_chat_message request by {user_id} for chat {chat_id}")
        return jsonify({"error": "Request body must be JSON"}), 400

    message_content = data.get('content')
    if not message_content or not isinstance(message_content, str) or not message_content.strip():
        logger.warning(f"Empty or invalid message content sent by user {user_id} to chat {chat_id}")
        return jsonify({"error": "Message content cannot be empty"}), 400

    try:
        chats_ref = _get_marketplace_chats_ref()
        chat_ref = chats_ref.child(chat_id)

        chat_data = chat_ref.get()
        if not chat_data or not isinstance(chat_data, dict):
            logger.warning(f"Chat {chat_id} not found in marketplace {marketplace_id} for sending message by user {user_id}")
            return jsonify({"error": "Chat not found"}), 404

        participants = chat_data.get('Participants', [])
        if user_id not in participants:
            logger.warning(f"Permission denied: User {user_id} tried to send message to chat {chat_id} (marketplace {marketplace_id}) they are not part of.")
            return jsonify({"error": "Access forbidden"}), 403

        messages_ref = chat_ref.child('Messages')
        timestamp = datetime.utcnow().isoformat()
        message_data = {
            'SenderID': user_id,
            'Content': message_content.strip(), 
            'Timestamp': timestamp,
            'Read': False 
        }

        new_message_ref = messages_ref.push(message_data)
        message_id = new_message_ref.key

        logger.info(f"Successfully sent message {message_id} from user {user_id} to chat {chat_id} in marketplace {marketplace_id}")

        return jsonify({
            'message_id': message_id,
            'chat_id': chat_id,
            'sender_id': user_id,
            'content': message_content.strip(),
            'timestamp': timestamp
        }), 201 

    except ValueError as ve:
        logger.error(f"Value error sending message to chat {chat_id}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        marketplace_log_id = g.get('marketplace_id', 'UNKNOWN')
        logger.error(f"Error sending message from user {user_id} to chat {chat_id} in marketplace {marketplace_log_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to send message"}), 500

@chats_bp.route('/<string:chat_id>', methods=['DELETE'])
@jwt_required
def delete_chat(chat_id): 
    if not hasattr(g, 'user_id') or not hasattr(g, 'marketplace_id'):
         logger.error("User ID or Marketplace ID missing from request context (g) in delete_chat")
         return jsonify({"error": "Authentication context incomplete"}), 401

    user_id = g.user_id
    marketplace_id = g.marketplace_id
    logger.info(f"Request to delete chat {chat_id} in marketplace {marketplace_id} by user {user_id}")

    try:
        chats_ref = _get_marketplace_chats_ref()
        chat_ref = chats_ref.child(chat_id)

        # Check that the chat exists and the user is a participant before deleting.
        chat_data = chat_ref.get()
        if not chat_data or not isinstance(chat_data, dict):
            # If the chat doesn't exist, treat as already deleted (idempotent delete).
            logger.warning(f"Chat {chat_id} not found in marketplace {marketplace_id} during delete request by user {user_id}. Returning success.")
            return jsonify({"message": "Chat not found or already deleted"}), 200 # Or 204 No Content

        participants = chat_data.get('Participants', [])
        if user_id not in participants:
            # Only participants can delete chats they are part of.
            logger.warning(f"Permission denied: User {user_id} tried to delete chat {chat_id} (marketplace {marketplace_id}) they are not part of.")
            return jsonify({"error": "Access forbidden"}), 403

        # Proceed to delete the chat.
        chat_ref.delete()
        logger.info(f"Successfully deleted chat {chat_id} in marketplace {marketplace_id} by user {user_id}")
        # Return 204 No Content to indicate successful deletion.
        return '', 204

    except ValueError as ve:
        logger.error(f"Value error deleting chat {chat_id}: {ve}")
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        marketplace_log_id = g.get('marketplace_id', 'UNKNOWN')
        logger.error(f"Error deleting chat {chat_id} in marketplace {marketplace_log_id} by user {user_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete chat"}), 500
