from flask import request, jsonify, Blueprint, current_app
from flask_bcrypt import check_password_hash
import jwt
from datetime import datetime, timedelta

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    mongo = current_app.config["pymongo"]

    user = mongo.db.Users.find_one({'username': username})

    if user and check_password_hash(user['password'], password):

        SECRET_KEY = current_app.config['SECRET_KEY']

        expiration_time = datetime.utcnow() + timedelta(hours=2)

        access_token = jwt.encode(
            {
                "username": username,
                "exp": expiration_time
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful",
            "token": access_token
        })

    return jsonify({"message": "Invalid username or password"}), 400