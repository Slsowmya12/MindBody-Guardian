import pandas as pd
import joblib

def predict_severity(user_inputs):
    # Load the trained model from the joblib file
    model = joblib.load(os.path.join(os.path.dirname(__file__), 'adhd_final_model.joblib'))

    # Load the LabelEncoder used during training
    le = joblib.load(os.path.join(os.path.dirname(__file__), 'label_encoder.joblib'))

    # Example: Create a DataFrame with the input values using a for loop
    user_inputs_dict = {}
    for i in range(1, 7):
        user_inputs_dict[f'q{i}'] = [user_inputs[i-1]]
    sum = 0
    for i in range(1,4):
        if (user_inputs_dict[f'q{i}'][0] >=2):
            sum +=1
    for i in range(4,7):
        if (user_inputs_dict[f'q{i}'][0] >=3):
            sum +=1
    user_inputs_dict['Adhd'] = [sum ]

    user_inputs_df = pd.DataFrame(user_inputs_dict)

    # Ensure column order and names match the ones used during training
    user_inputs_df = user_inputs_df[['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'Adhd']]

    percentage = (user_inputs_dict['Adhd'][0]/6)*100

    # Prepare features for prediction
    user_inputs_encoded = pd.get_dummies(user_inputs_df)  # Apply one-hot encoding if needed

    # Make predictions
    predictions_numeric = model.predict(user_inputs_encoded)

    # Convert numeric predictions to string labels using the loaded LabelEncoder
    predictions_string = le.inverse_transform(predictions_numeric)
    result = {'percentage' : percentage,'severity_level' : predictions_string[0]}
    # Example: Return the predicted values in string format
    return result