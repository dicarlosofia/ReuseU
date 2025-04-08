from flask import Flask, jsonify, request
from firebase_admin import credentials, db, auth, initialize_app


app = Flask(__name__)

cred = credentials.Certificate("pk.json")
initialize_app(cred, {
    'database': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'})

@app.route("/")
def home():
    return "ReuseU - Christna the goat"

@app.route("/krishna")
def krishna():
    import random
    import string
    the_goat = "krishna"
    new_goat = []
    index_choice = random.randint(0, len(the_goat))
    for index, character in enumerate(the_goat):
        if index == index_choice:
            new_goat.append(random.choice(string.ascii_letters))
        else:
            new_goat.append(character)
            
    return "".join(new_goat) + " the goat"
        
    
    

if __name__ == "__main__":
    app.run(debug=True)
    





