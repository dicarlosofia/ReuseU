from flask import Flask, jsonify, request
from routes.listing import listings_bp
from routes.review import reviews_bp
from routes.chat import chats_bp
from routes.transaction import transactions_bp
from routes.account import accounts_bp

def create_app():
    app = Flask(__name__)
    
    app.register_blueprint(listings_bp, url_prefix='/api/listings')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(chats_bp, url_prefix='/api/chats')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    
    @app.route("/")
    def home():
        return "Welcome to ReuseU API"
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
