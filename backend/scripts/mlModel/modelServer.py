from flask import Flask, request, jsonify
import anxiety.predict as anxietyprediction# Import your machine learning model here
import depression.predict as depressionprediction
import adhd.predict as adhdprediction
import autism.predict as autismprediction
import stress.predict as stressprediction
import dyslexia.predict as dyslexiaprediction
import ptsd.predict as ptsdprediction
import general_test.predict as general_testprediction

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from the request
        inputs = request.get_json()

        userInputs = [int(value) for value in inputs['userInputs']]
        print(inputs)
        category = inputs["category"]
        if(category == "depression"):
            predictions = depressionprediction.predict_severity(userInputs)
        elif(category == "anxiety"):
            predictions = anxietyprediction.predict_severity(userInputs)
        elif(category == "stress"):
            predictions = stressprediction.predict_severity(userInputs)
        elif(category == "adhd"):
            predictions = adhdprediction.predict_severity(userInputs)
        elif(category == "autism"):
            predictions = autismprediction.predict_severity(userInputs)
        elif(category == "dyslexia"):
            predictions = dyslexiaprediction.predict_severity(userInputs)
        elif(category == "ptsd"):
            predictions = ptsdprediction.predict_severity(userInputs)
        elif(category=="general_test"):
            predictions = general_testprediction.predict_severity(userInputs)
        else:
            return jsonify({"error": "couldn't find model predictions"})
        percentage = predictions["percentage"]
        severity_level = predictions["severity_level"]
        result = {"percentage":percentage, "severity_level": severity_level}
        print(result)
        
        return jsonify(result)

    except Exception as e:
        print(e)
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(port=5000, debug=True) 
