from flask import request, jsonify, Blueprint, current_app
import jwt

personalinfo_bp = Blueprint('personalinfo', __name__)

@personalinfo_bp.route('/personalinfo', methods=['POST'])
def personalinfo():
  data = request.json
  SECRET_KEY = current_app.config['SECRET_KEY']

  user_details = jwt.decode(data['token'], SECRET_KEY , algorithms='HS256')
  print(user_details)
  print(data)

  #pushing data to mongodb
  mongo = current_app.config['pymongo']
  user = mongo.db.Users.find_one({'username': user_details['username']})
  if user:
    mongo.db.Users.update_one(
          {'username': user_details['username']},
          {'$set': data["info"]}  
    )
  else:
    return jsonify({"message": "unable to find user"}), 500
    
  return jsonify({"message": "successful"})