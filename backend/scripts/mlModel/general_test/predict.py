import pandas as pd
import joblib

def predict_severity(user_inputs):
    # Load the trained model from the joblib file
    model = joblib.load(os.path.join(os.path.dirname(__file__), 'general_final_model.joblib'))

    # Load the LabelEncoder used during training
    le = joblib.load(os.path.join(os.path.dirname(__file__), 'label_encoder.joblib'))


    user_inputs_dict = {}
    user_inputs_dict['age'] = user_inputs[0]
    # Example: Create a DataFrame with the input values using a for loop
    for i in range(1, 28):
        user_inputs_dict[f'q{i}'] = [user_inputs[i]]

    user_inputs_df = pd.DataFrame(user_inputs_dict)

    # Ensure column order and names match the ones used during training
    user_inputs_df = user_inputs_df[['age','q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12','q13','q14','q15','q16','q17','q18','q19','q20','q21','q22','q23','q24','q25','q26','q27']]

    # Prepare features for prediction
    user_inputs_encoded = pd.get_dummies(user_inputs_df)  # Apply one-hot encoding if needed

    # Make predictions
    predictions_numeric = model.predict(user_inputs_encoded)

    # Convert numeric predictions to string labels using the loaded LabelEncoder
    predictions_string = le.inverse_transform(predictions_numeric)
    result = {'percentage' : None,'severity_level' : predictions_string[0]}
    # Example: Return the predicted values in string format
    return result
