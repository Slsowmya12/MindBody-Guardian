from flask import Blueprint, request, jsonify, current_app
import json
import os
import sys
import importlib
import jwt
import uuid
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

tests_bp = Blueprint('tests', __name__)

def get_user_from_token(token: str):
    SECRET_KEY = 'your-secret-key-here'  # Should match app config
    try:
        return jwt.decode(token, SECRET_KEY, algorithms='HS256')
    except Exception:
        return None

def get_token_from_request(req):
    auth_header = req.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1]
    return req.json.get('token') if req.json else req.args.get('token')

def get_user_from_request(req):
    token = get_token_from_request(req)
    if not token:
        return None, jsonify(message='Token is required'), 401
    user_details = get_user_from_token(token)
    if not user_details:
        return None, jsonify(message='Invalid token'), 401
    mongo = current_app.config['pymongo']
    user = mongo.db.Users.find_one({'username': user_details['username']})
    if not user:
        return None, jsonify(message='User not found'), 404
    return user, None, None

@tests_bp.route('/getQuestions', methods=['GET'])
def get_questions():
    category = request.args.get('category')
    if not category:
        return jsonify({"success": False, "message": "Category is required"}), 400

    file_path = os.path.join('C:\\Users\\DELL\\Downloads\\fitness\\fitnessguru\\backend\\scripts\\mlModel', category, f'{category}_test.json')
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return jsonify({"success": True, "data": data})
    except FileNotFoundError:
        return jsonify({"success": False, "message": "Test not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@tests_bp.route('/getPredictions', methods=['POST'])
def get_predictions():
    data = request.json
    user_inputs = [x for x in data.get('userInputs', []) if x is not None]
    if not user_inputs:
        return jsonify({"percentage": 50, "severity_level": "Moderate"}), 400
    
    # Adjust max score based on category
    if data.get('category') == 'general_test':
        max_score_per_question = 1  # Yes/No
    else:
        max_score_per_question = 3  # 4 options: 0-3
    
    total_possible = len(user_inputs) * max_score_per_question
    total_score = sum(user_inputs)
    percentage = (total_score / total_possible) * 100 if total_possible > 0 else 50
    
    if percentage < 33:
        severity_level = "Low"
    elif percentage < 66:
        severity_level = "Moderate"
    else:
        severity_level = "High"
    
    return jsonify({"percentage": round(percentage, 2), "severity_level": severity_level})


@tests_bp.route('/getTestHistory', methods=['GET'])
def get_test_history():
    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        print(f"Get test history auth failed: {error_resp}")
        return error_resp, status

    history = user.get('test_history', [])
    print(f"Retrieved test history for user {user['username']}: {len(history)} items")
    return jsonify(success=True, history=history), 200


@tests_bp.route('/saveTestHistory', methods=['POST'])
def save_test_history():
    data = request.json or {}
    category = data.get('category')
    name = data.get('name')
    result = data.get('result')
    percentage = data.get('percentage')
    severity_level = data.get('severity_level')
    answers = data.get('answers')

    print(f"Save test history called with data: {data}")

    if not category or not name or result is None or percentage is None or severity_level is None:
        print("Missing required fields")
        return jsonify(message='Test history requires category, name, result, percentage, and severity_level'), 400

    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        print(f"Authentication failed: {error_resp}")
        return error_resp, status

    entry_id = data.get('entry_id') or str(uuid.uuid4())

    entry = {
        'entry_id': entry_id,
        'category': category,
        'name': name,
        'result': result,
        'percentage': percentage,
        'severity_level': severity_level,
        'answers': answers,
        'ai_recommendation': data.get('ai_recommendation'),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }

    print(f"Saving/updating entry: {entry}")

    # If entry_id exists, update existing record to allow reanalysis update.
    if entry_id:
        updated = current_app.config['pymongo'].db.Users.update_one(
            {'username': user['username'], 'test_history.entry_id': entry_id},
            {'$set': {
                'test_history.$.result': result,
                'test_history.$.percentage': percentage,
                'test_history.$.severity_level': severity_level,
                'test_history.$.answers': answers,
                'test_history.$.ai_recommendation': data.get('ai_recommendation'),
                'test_history.$.updated_at': datetime.utcnow()
            }}
        )

        if updated and hasattr(updated, 'matched_count') and updated.matched_count > 0:
            print('Existing history entry updated successfully')
            return jsonify(message='Test history updated successfully', entry_id=entry_id), 200

    # Otherwise, insert new entry and keep one entry per test occurrence.
    current_app.config['pymongo'].db.Users.update_one(
        {'username': user['username']},
        {'$push': {'test_history': entry}, '$set': {'updated_at': datetime.utcnow()}}
    )
    print('Test history saved as new entry')
    return jsonify(message='Test saved successfully', entry_id=entry_id), 200


@tests_bp.route('/clearTestHistory', methods=['POST'])
def clear_test_history():
    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        print(f"Clear history auth failed: {error_resp}")
        return error_resp, status

    current_app.config['pymongo'].db.Users.update_one(
        {'username': user['username']},
        {'$set': {'test_history': [], 'updated_at': datetime.utcnow()}}
    )

    print(f"Cleared test history for user {user['username']}")
    return jsonify(success=True, message='Test history cleared'), 200


@tests_bp.route('/testHistoryCount', methods=['GET'])
def test_history_count():
    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    history = user.get('test_history', [])
    return jsonify(count=len(history), history=history), 200


@tests_bp.route('/testSaveHistory', methods=['POST'])
def test_save_history():
    data = request.json or {}
    print(f"Test save history called with data: {data}")
    
    # Simple test - just save to a test collection without auth
    entry = {
        'test_data': data,
        'timestamp': datetime.utcnow()
    }
    
    try:
        current_app.config['pymongo'].db.test_history.insert_one(entry)
        print("Test history saved successfully")
        return jsonify(message='Test saved successfully', id=str(entry['_id'])), 200
    except Exception as e:
        print(f"Error saving test history: {e}")
        return jsonify(message='Error saving test history', error=str(e)), 500


@tests_bp.route('/testGetHistory', methods=['GET'])
def test_get_history():
    try:
        history = list(current_app.config['pymongo'].db.test_history.find({}, {'_id': 0}))
        print(f"Retrieved test history: {len(history)} items")
        return jsonify(history=history), 200
    except Exception as e:
        print(f"Error retrieving test history: {e}")
        return jsonify(message='Error retrieving test history', error=str(e)), 500


@tests_bp.route('/dbStatus', methods=['GET'])
def db_status():
    try:
        # Test database connection
        db = current_app.config['pymongo'].db
        collections = db.list_collection_names()
        return jsonify(status='connected', collections=collections), 200
    except Exception as e:
        print(f"Database connection error: {e}")
        return jsonify(status='error', error=str(e)), 500