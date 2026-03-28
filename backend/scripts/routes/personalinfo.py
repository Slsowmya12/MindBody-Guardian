from flask import request, jsonify, Blueprint, current_app
import jwt

personalinfo_bp = Blueprint('personalinfo', __name__)

def get_user_from_token(token: str):
    SECRET_KEY = current_app.config['SECRET_KEY']
    try:
        return jwt.decode(token, SECRET_KEY, algorithms='HS256')
    except Exception:
        return None

@personalinfo_bp.route('/personalinfo', methods=['POST'])
def personalinfo():
    data = request.json or {}
    token = data.get('token')
    if not token:
        return jsonify(message='Token is required'), 401

    user_details = get_user_from_token(token)
    if not user_details:
        return jsonify(message='Invalid token'), 401

    allowed_fields = {'fullName', 'email', 'dob', 'gender', 'fitnessGoals'}
    info = data.get('info', {})
    filtered_info = {k: v for k, v in info.items() if k in allowed_fields}

    mongo = current_app.config['pymongo']
    user = mongo.db.Users.find_one({'username': user_details['username']})
    if user:
        mongo.db.Users.update_one(
            {'username': user_details['username']},
            {'$set': filtered_info}
        )
    else:
        return jsonify({"message": "unable to find user"}), 500

    return jsonify({"message": "successful"})

@personalinfo_bp.route('/personalinfo', methods=['GET'])
def get_personalinfo():
    token = None
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1]
    else:
        token = request.args.get('token')

    if not token:
        return jsonify(message='Token is required'), 401

    user_details = get_user_from_token(token)
    if not user_details:
        return jsonify(message='Invalid token'), 401

    mongo = current_app.config['pymongo']
    user = mongo.db.Users.find_one({'username': user_details['username']}, {'_id': 0, 'password': 0, 'reset_token': 0, 'reset_token_expiry': 0})
    if not user:
        return jsonify(message='User not found'), 404

    return jsonify({"message": "success", "data": user})