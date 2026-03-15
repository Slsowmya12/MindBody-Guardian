from flask import Blueprint, request, jsonify
import json
import os
import sys
import importlib

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

tests_bp = Blueprint('tests', __name__)

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