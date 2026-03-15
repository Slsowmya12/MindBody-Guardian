from flask import Blueprint, jsonify

model_bp = Blueprint('model', __name__)

@model_bp.route('/model', methods=['POST'])
def model():
    print("chat")
    # Just for testing, send a simple JSON response back to the frontend
    return jsonify({
        'response': 'Request received successfully'
    })
