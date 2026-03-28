from flask import Blueprint, request, jsonify, current_app
import jwt
from datetime import datetime
from uuid import uuid4

history_bp = Blueprint('history', __name__)


def get_user_from_token(token: str):
    SECRET_KEY = current_app.config['SECRET_KEY']
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


@history_bp.route('/chat-history', methods=['POST'])
def save_chat_history():
    data = request.json or {}
    message = data.get('message')
    response_text = data.get('response')
    session_id = data.get('session_id')
    if not message or not response_text:
        return jsonify(message='Message and response are required'), 400

    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    chat_collection = current_app.config['pymongo'].db.Users
    now = datetime.utcnow().isoformat()

    if session_id:
        session = chat_collection.find_one(
            {'username': user['username'], 'chat_history.session_id': session_id},
            {'chat_history.$': 1}
        )
        if not session or 'chat_history' not in session:
            return jsonify(message='Session not found'), 404

        chat_collection.update_one(
            {'username': user['username'], 'chat_history.session_id': session_id},
            {
                '$push': {
                    'chat_history.$.messages': {
                        'question': message,
                        'response': response_text,
                        'created_at': now,
                    }
                },
                '$set': {
                    'chat_history.$.updated_at': now,
                    'updated_at': now,
                }
            }
        )
        return jsonify(message='Chat appended successfully', session_id=session_id), 200

    new_session_id = str(uuid4())
    session_entry = {
        'session_id': new_session_id,
        'initial_question': message,
        'messages': [
            {
                'question': message,
                'response': response_text,
                'created_at': now,
            }
        ],
        'created_at': now,
        'updated_at': now,
    }
    chat_collection.update_one(
        {'username': user['username']},
        {'$push': {'chat_history': session_entry}, '$set': {'updated_at': now}}
    )
    return jsonify(message='Chat saved successfully', session_id=new_session_id), 200


@history_bp.route('/chat-history', methods=['GET'])
def get_chat_history():
    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    raw_history = user.get('chat_history', [])
    normalized_history = []
    needs_migration = False

    def iso(value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value

    for item in raw_history:
        if isinstance(item, dict) and item.get('session_id') and item.get('messages'):
            normalized_item = item.copy()
            normalized_item['created_at'] = iso(normalized_item.get('created_at'))
            normalized_item['updated_at'] = iso(normalized_item.get('updated_at'))
            normalized_messages = []
            for msg in normalized_item.get('messages', []):
                if isinstance(msg, dict):
                    msg_copy = msg.copy()
                    msg_copy['created_at'] = iso(msg_copy.get('created_at'))
                    normalized_messages.append(msg_copy)
                else:
                    normalized_messages.append(msg)
            normalized_item['messages'] = normalized_messages
            normalized_history.append(normalized_item)
        elif isinstance(item, dict) and item.get('message') and item.get('response'):
            needs_migration = True
            normalized_history.append({
                'session_id': str(uuid4()),
                'initial_question': item.get('message'),
                'messages': [
                    {
                        'question': item.get('message'),
                        'response': item.get('response'),
                        'created_at': iso(item.get('created_at')) or datetime.utcnow().isoformat(),
                    }
                ],
                'created_at': iso(item.get('created_at')) or datetime.utcnow().isoformat(),
                'updated_at': iso(item.get('created_at')) or datetime.utcnow().isoformat(),
            })
        else:
            normalized_history.append(item)
    if needs_migration:
        current_app.config['pymongo'].db.Users.update_one(
            {'username': user['username']},
            {'$set': {'chat_history': normalized_history, 'updated_at': datetime.utcnow().isoformat()}}
        )
    return jsonify(message='success', chat_history=normalized_history), 200


@history_bp.route('/chat-history/delete', methods=['POST'])
def delete_chat_history():
    data = request.json or {}
    session_id = data.get('session_id')
    created_at = data.get('created_at')
    if not session_id and not created_at:
        return jsonify(message='session_id or created_at is required'), 400

    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    pull_query = {'session_id': session_id} if session_id else {'created_at': created_at}
    current_app.config['pymongo'].db.Users.update_one(
        {'username': user['username']},
        {'$pull': {'chat_history': pull_query}}
    )
    return jsonify(message='Chat deleted successfully'), 200


@history_bp.route('/chat-history/rename', methods=['POST'])
def rename_chat_history():
    data = request.json or {}
    session_id = data.get('session_id')
    created_at = data.get('created_at')
    new_title = data.get('new_title')

    if not new_title or (not session_id and not created_at):
        return jsonify(message='session_id or created_at and new_title are required'), 400

    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    search_query = {'username': user['username']}
    if session_id:
        search_query['chat_history.session_id'] = session_id
    else:
        search_query['chat_history.created_at'] = created_at

    result = current_app.config['pymongo'].db.Users.update_one(
        search_query,
        {
            '$set': {
                'chat_history.$.initial_question': new_title,
                'chat_history.$.updated_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
            }
        }
    )

    if result.modified_count == 0:
        return jsonify(message='Chat session not found or title unchanged'), 404

    return jsonify(message='Chat renamed successfully'), 200


@history_bp.route('/test-history', methods=['POST'])
def save_test_history():
    data = request.json or {}
    category = data.get('category')
    name = data.get('name')
    result = data.get('result')
    percentage = data.get('percentage')
    severity = data.get('severity')
    answers = data.get('answers')

    if not category or not name or result is None or percentage is None or severity is None:
        return jsonify(message='Test history requires category, name, result, percentage, and severity'), 400

    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    entry = {
        'category': category,
        'name': name,
        'result': result,
        'percentage': percentage,
        'severity': severity,
        'answers': answers,
        'created_at': datetime.utcnow()
    }
    current_app.config['pymongo'].db.Users.update_one(
        {'username': user['username']},
        {'$push': {'test_history': entry}, '$set': {'updated_at': datetime.utcnow()}}
    )
    return jsonify(message='Test saved successfully'), 200


@history_bp.route('/test-history', methods=['GET'])
def get_test_history():
    user, error_resp, status = get_user_from_request(request)
    if error_resp:
        return error_resp, status

    return jsonify(message='success', test_history=user.get('test_history', [])), 200
