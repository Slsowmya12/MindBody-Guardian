from flask import request, jsonify, Blueprint,current_app
import bcrypt

# Create a Blueprint for signup
signup_bp = Blueprint('signup', __name__)

@signup_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() # Get JSON data from the request
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify(message="Username and password are required")
    mongo = current_app.config['pymongo']

   # Retrieve user from database
    user = mongo.db.Users.find_one({'username': username})

    if user:
        # User already exists, check password or handle accordingly
        return jsonify(message="Username already exists")
    else:
        # User does not exist, add the user
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = {
            "username": username,
            "password": hashed_password
        }
        # Insert the new user into the MongoDB collection named 'Users'
        result = mongo.db.Users.insert_one(new_user)
        print(result)
        return jsonify(message="User registered successfully", user_id=str(result.inserted_id))
