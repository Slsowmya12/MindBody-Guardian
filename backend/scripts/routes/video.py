from flask import Blueprint, current_app, jsonify, send_file
from gridfs import GridFS
from bson import ObjectId
import io

video_bp = Blueprint('video', __name__)

@video_bp.route('/file/<file_id>', methods=['GET'])
def get_file(file_id):
    try:
        mongo = current_app.config['pymongo']  # Access the Mongo object
        fs = GridFS(mongo.db)

        file = fs.get(ObjectId(file_id))
        file_data = file.read()

        return send_file(
            io.BytesIO(file_data),
            download_name=file.filename,
            as_attachment=True
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 404



# ... other code