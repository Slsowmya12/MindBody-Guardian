from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from routes.signup import signup_bp 
from routes.login import login_bp
from routes.video import video_bp
from routes.personalinfo import personalinfo_bp
from routes.media import media_bp
from routes.tests import tests_bp
from rag_lama.rag_model import rag_model_bp


def createApp():
    app = Flask(__name__)
    app.config.from_prefixed_env() #importing flask environmental variables to config object
    app.config['SECRET_KEY'] = 'your-secret-key-here'  # Add this if not set in env
    mongo = PyMongo(app)
    app.config['pymongo'] = mongo
    CORS(app)  # Enable CORS for all routes 

    # Register Blueprints
    app.register_blueprint(signup_bp)
    app.register_blueprint(login_bp)
    # app.register_blueprint(video_bp)
    app.register_blueprint(personalinfo_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(tests_bp, url_prefix='/api')
    app.register_blueprint(rag_model_bp)
    return app

app = createApp() 

# Define a route for the home page
@app.route('/')
def home():
    return "Hello, Flask with MongoDB!"

if __name__ == '__main__':
    # Run the Flask app in debug mode
    app.run(host='0.0.0.0' ,debug=True,port=5500)
