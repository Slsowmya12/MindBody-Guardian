from flask import request, jsonify, Blueprint, current_app
import bcrypt
import jwt
from datetime import datetime, timedelta

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    identifier = data.get('username') or data.get('email') or ''
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({"message": "Email/Username and password are required."}), 400

    mongo = current_app.config["pymongo"]
    normalized_identifier = identifier.strip().lower()
    query = {
        '$or': [
            {'username': normalized_identifier},
            {'email': normalized_identifier},
            {'name': {'$regex': f'^{identifier.strip()}$', '$options': 'i'}}
        ]
    }
    user = mongo.db.Users.find_one(query)

    if user and user.get('password') and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        SECRET_KEY = current_app.config['SECRET_KEY']
        expiration_time = datetime.utcnow() + timedelta(hours=7)
        mongo.db.Users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': datetime.utcnow(), 'updated_at': datetime.utcnow()}, '$unset': {'reset_token': '', 'reset_token_expiry': ''}}
        )

        access_token = jwt.encode(
            {
                "username": user.get('username') or user.get('email'),
                "exp": expiration_time
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        needs_personal_info = not all(
            user.get(field) for field in [
                'fullName',
                'dob',
                'gender',
                'fitnessGoals'
            ]
        )

        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "needsPersonalInfo": needs_personal_info
        })

    return jsonify({"message": "Invalid email/username or password"}), 400