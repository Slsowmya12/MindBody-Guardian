from flask import request, jsonify, Blueprint, current_app
import bcrypt
import secrets
import os
import smtplib
import ssl
from email.message import EmailMessage
from datetime import datetime, timedelta

# Create a Blueprint for signup
signup_bp = Blueprint('signup', __name__)


def send_signup_otp(recipient: str, otp: str) -> tuple[bool, str]:
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    email_from = os.getenv('EMAIL_FROM')

    if not smtp_host or not smtp_user or not smtp_password or not email_from:
        return False, 'SMTP is not configured'

    message = EmailMessage()
    message['Subject'] = 'Your Signup OTP'
    message['From'] = email_from
    message['To'] = recipient
    message.set_content(
        f"""Hello,

Your one-time password (OTP) for completing signup is:

{otp}

It is valid for 10 minutes.

If you did not request this, please ignore this email.
"""
    )

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.send_message(message)
        return True, 'OTP sent successfully.'
    except Exception as exc:
        current_app.logger.error('Failed to send signup OTP email: %s', exc)
        return False, str(exc)


@signup_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify(message="Name, email, and password are required"), 400

    mongo = current_app.config['pymongo']
    if mongo.db.Users.find_one({'email': email}) or mongo.db.Users.find_one({'username': email}):
        return jsonify(message="Email already exists"), 400

    otp = str(secrets.randbelow(900000) + 100000)
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    expiry = datetime.utcnow() + timedelta(minutes=10)

    mongo.db.SignupRequests.update_one(
        {'email': email},
        {'$set': {
            'name': name,
            'email': email,
            'password': hashed_password,
            'otp': otp,
            'otp_expiry': expiry,
            'created_at': datetime.utcnow()
        }},
        upsert=True
    )

    success, message = send_signup_otp(email, otp)
    if not success:
        return jsonify(message=f"Failed to send OTP: {message}"), 500

    return jsonify(message="OTP sent to your email. Verify it to complete signup."), 200


@signup_bp.route('/signup/verify-otp', methods=['POST'])
def verify_signup_otp():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()

    if not email or not otp:
        return jsonify(message="Email and OTP are required."), 400

    mongo = current_app.config['pymongo']
    request_doc = mongo.db.SignupRequests.find_one({'email': email})
    if not request_doc:
        return jsonify(message="No signup request found for this email."), 404

    if request_doc.get('otp') != otp:
        return jsonify(message="Invalid OTP."), 400

    if not request_doc.get('otp_expiry') or request_doc['otp_expiry'] < datetime.utcnow():
        return jsonify(message="OTP has expired."), 400

    if mongo.db.Users.find_one({'email': email}) or mongo.db.Users.find_one({'username': email}):
        mongo.db.SignupRequests.delete_one({'email': email})
        return jsonify(message="This email is already registered."), 400

    now = datetime.utcnow()
    new_user = {
        'name': request_doc['name'],
        'username': email,
        'password': request_doc['password'],
        'email': email,
        'created_at': now,
        'updated_at': now,
        'last_login': None,
        'reset_token': None,
        'reset_token_expiry': None,
        'fullName': None,
        'dob': None,
        'gender': None,
        'fitnessGoals': None,
        'chat_history': [],
        'test_history': []
    }

    result = mongo.db.Users.insert_one(new_user)
    mongo.db.SignupRequests.delete_one({'email': email})
    return jsonify(message="User registered successfully.", user_id=str(result.inserted_id)), 201
