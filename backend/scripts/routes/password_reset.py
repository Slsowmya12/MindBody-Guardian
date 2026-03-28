from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta
import os
import secrets
import bcrypt
import smtplib
import ssl
from email.message import EmailMessage

password_reset_bp = Blueprint('password_reset', __name__)


def send_reset_email(recipient: str, reset_token: str) -> tuple[bool, str]:
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    email_from = os.getenv('EMAIL_FROM')

    if not smtp_host or not smtp_user or not smtp_password or not email_from:
        return False, 'SMTP is not configured'

    message = EmailMessage()
    message['Subject'] = 'Password Reset Instructions'
    message['From'] = email_from
    message['To'] = recipient
    message.set_content(
        f"""Hello,

A password reset was requested for your account.

Use the following token to reset your password:

{reset_token}

This token is valid for 1 hour.

If you did not request this, please ignore this message.
"""
    )

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        return True, 'Reset instructions sent via email.'
    except Exception as exc:
        current_app.logger.error('Failed to send reset email: %s', exc)
        return False, str(exc)


@password_reset_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')

    if not username and not email:
        return jsonify(message='Username or email is required to reset the password.'), 400

    mongo = current_app.config['pymongo']
    query = {}
    if username and email:
        query = {
            '$or': [
                {'username': username},
                {'email': email.lower()},
                {'name': username}
            ]
        }
    elif username:
        query = {'$or': [{'username': username}, {'name': username}]}
    else:
        query = {'email': email.lower()}

    user = mongo.db.Users.find_one(query)
    if not user:
        return jsonify(message='If this account exists, password reset instructions have been sent.'), 200

    reset_token = secrets.token_urlsafe(24)
    expiry = datetime.utcnow() + timedelta(hours=1)

    mongo.db.Users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'reset_token': reset_token,
            'reset_token_expiry': expiry,
            'updated_at': datetime.utcnow()
        }}
    )

    if user.get('email'):
        success, info = send_reset_email(user['email'], reset_token)
        if success:
            return jsonify(message='Password reset token has been sent to your email.'), 200
        current_app.logger.warning('Email send failed: %s', info)
        return jsonify(message='Failed to send reset instructions by email.'), 500

    return jsonify(message='Unable to send password reset instructions because email is not available.'), 400


@password_reset_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password or (not username and not email):
        return jsonify(message='Username or email, token, and new password are required.'), 400

    mongo = current_app.config['pymongo']
    query = {}
    if username and email:
        query = {
            '$or': [
                {'username': username},
                {'email': email.lower()},
                {'name': username}
            ]
        }
    elif username:
        query = {'$or': [{'username': username}, {'name': username}]}
    else:
        query = {'email': email.lower()}

    user = mongo.db.Users.find_one(query)
    if not user:
        return jsonify(message='Invalid reset request.'), 400

    if not user.get('reset_token') or user.get('reset_token') != token:
        return jsonify(message='Invalid or expired reset token.'), 400

    if not user.get('reset_token_expiry') or user.get('reset_token_expiry') < datetime.utcnow():
        return jsonify(message='Reset token has expired.'), 400

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    mongo.db.Users.update_one(
        {'_id': user['_id']},
        {'$set': {
            'password': hashed_password,
            'updated_at': datetime.utcnow()
        },
         '$unset': {
            'reset_token': '',
            'reset_token_expiry': ''
        }}
    )

    return jsonify(message='Password has been reset successfully.'), 200
