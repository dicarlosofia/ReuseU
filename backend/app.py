from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.listing import listings_bp
from routes.review import reviews_bp
from routes.chat import chats_bp
from routes.transaction import transactions_bp
from routes.account import accounts_bp
from routes.message import messages_bp
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
    app.register_blueprint(ai_price_fill_bp,      url_prefix='/api/ai_price_fill')

    @app.route("/")
    def home():
        return "Welcome to ReuseU API"

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
