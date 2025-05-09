import eventlet
eventlet.monkey_patch()

# Main entry point for the backend API
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from routes.listing import listings_bp
from routes.review import reviews_bp
from routes.chat import chats_bp
from routes.transaction import transactions_bp
from routes.account import accounts_bp
from routes.message import messages_bp
from routes.listing_report import report_bp
from routes.admin_report import admin_report_bp
from routes.ai_price_fill import ai_price_fill_bp

def create_app():
    app = Flask(__name__)

    # Properly configure CORS (added authorization)
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints
    
    # Disable strict slashes to prevent redirects without CORS headers
    app.url_map.strict_slashes = False
    
    # Enable CORS for all routes
    CORS(app)
    
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(listings_bp, url_prefix='/api/listings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(chats_bp, url_prefix='/api/chats')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(messages_bp, url_prefix='/api/messages')
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_report_bp)
    app.register_blueprint(ai_price_fill_bp,      url_prefix='/api/ai_price_fill')

    @app.route("/")
    def home():
        return "Welcome to ReuseU API"

    return app

app = create_app()
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000"], async_mode="eventlet")

# Example: handle chat messages
@socketio.on('send_message', namespace='/chat')
def handle_send_message(data):
    # data should contain: {room, message, sender}
    room = data.get('room')
    message = data.get('message')
    sender = data.get('sender')
    emit('receive_message', {'message': message, 'sender': sender}, room=room)

@socketio.on('join', namespace='/chat')
def handle_join(data):
    room = data.get('room')
    join_room(room)
    emit('user_joined', {'room': room}, room=room)

@socketio.on('leave', namespace='/chat')
def handle_leave(data):
    room = data.get('room')
    leave_room(room)
    emit('user_left', {'room': room}, room=room)

if __name__ == "__main__":
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
