from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.listing import listings_bp
from routes.review import reviews_bp
from routes.chat import chats_bp
from routes.transaction import transactions_bp

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    
    app.register_blueprint(listings_bp, url_prefix='/api/listings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(chats_bp, url_prefix='/api/chats')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    
    @app.route("/")
    def home():
        return "Welcome to ReuseU API"
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
