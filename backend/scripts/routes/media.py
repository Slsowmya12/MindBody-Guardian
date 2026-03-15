import os
import cv2
import numpy as np
import tensorflow as tf
from flask import Blueprint, Response, jsonify, request,current_app
import mediapipe as mp
import base64
import logging 

# Suppress TensorFlow warnings
logging.getLogger('tensorflow').setLevel(logging.ERROR)

media_bp = Blueprint('media', __name__)
mp_pose = mp.solutions.pose

# Load your trained neural network model
model_path = os.path.join(os.path.dirname(__file__), '..', 'NeuralNetwork', 'my_best_model.keras')
model = tf.keras.models.load_model(model_path)

# Define keypoints for each exercise
exercise_keypoints = {
    "plank": [("LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST"),
              ("RIGHT_SHOULDER", "RIGHT_ELBOW", "RIGHT_WRIST"),
              ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
              ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
              ("LEFT_KNEE", "LEFT_ANKLE", "LEFT_HEEL"),
              ("RIGHT_KNEE", "RIGHT_ANKLE", "RIGHT_HEEL")],
    "wall_sit": [("LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE"),
                 ("RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"),
                 ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
                 ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
                 ("LEFT_KNEE", "LEFT_ANKLE", "LEFT_HEEL"),
                 ("RIGHT_KNEE", "RIGHT_ANKLE", "RIGHT_HEEL")],
    "squat": [("LEFT_SHOULDER", "LEFT_HIP", "LEFT_KNEE"),
              ("RIGHT_SHOULDER", "RIGHT_HIP", "RIGHT_KNEE"),
              ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
              ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE")]
}

Exercise = ['Exercise', 'LEFT_WRIST', 'RIGHT_WRIST', 'LEFT_ELBOW', 'RIGHT_ELBOW', 'LEFT_SHOULDER', 'RIGHT_SHOULDER', 'LEFT_HIP', 
'RIGHT_HIP', 'LEFT_KNEE', 'RIGHT_KNEE','LEFT_ANKLE', 'RIGHT_ANKLE', 'LEFT_HEEL', 'RIGHT_HEEL', 'LEFT_FOOT_INDEX', 'RIGHT_FOOT_INDEX']

names=['plank','wall_sit','squat','treepose',]

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def calculate_exercise_angles(landmarks, keypoints, mp_pose, max_keypoints, current_exercise):
    angles = [0.0] * max_keypoints
    angles[0] = names.index(current_exercise)
    for points in keypoints:
        if all(landmarks[getattr(mp_pose.PoseLandmark, part).value].visibility > 0.4 for part in points):
            a = [landmarks[getattr(mp_pose.PoseLandmark, points[0]).value].x,
                 landmarks[getattr(mp_pose.PoseLandmark, points[0]).value].y]
            b = [landmarks[getattr(mp_pose.PoseLandmark, points[1]).value].x,
                 landmarks[getattr(mp_pose.PoseLandmark, points[1]).value].y]
            c = [landmarks[getattr(mp_pose.PoseLandmark, points[2]).value].x,
                 landmarks[getattr(mp_pose.PoseLandmark, points[2]).value].y]
            angle = calculate_angle(a, b, c)
            idx = Exercise.index(points[1])
            angles[idx] = angle
    return angles

@media_bp.route('/video_feed', methods=['POST'])
def video_feed():
    data = request.get_json()
    img_data = base64.b64decode(data['image'])
    nparr = np.frombuffer(img_data, np.uint8)
    img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        image = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            current_exercise = "squat"  # Change this based on the exercise being performed
            keypoints = exercise_keypoints[current_exercise]
            angles = calculate_exercise_angles(landmarks, keypoints, mp_pose, 17, current_exercise)
            input_data = np.array(angles)
            input_data = np.expand_dims(input_data, axis=0)
            print(input_data)
            prediction = model.predict(input_data)
            exercise_status = "Correct" if prediction[0] > 0.5 else "INCORRECT FORM"
            print(exercise_status)
            return jsonify({"status":True, "message": exercise_status})
        return jsonify({"message": "No pose detected", "status": False})