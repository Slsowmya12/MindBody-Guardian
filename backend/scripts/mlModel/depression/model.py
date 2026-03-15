import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib

# Load the dataset
data = pd.read_csv(r'C:\Users\valli\Desktop\project school\manashealth\mlModel\depression\Depression_dataset.csv')

# Convert the target variable to numerical using LabelEncoder
le = LabelEncoder()
data["Severity Level"] = le.fit_transform(data["Severity Level"])

# Split the data into features (X) and target variable (y)
X = data.drop("Severity Level", axis=1)
y = data["Severity Level" ]

# Convert categorical variables to numerical using one-hot encoding
X = pd.get_dummies(X)

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use StratifiedKFold for cross-validation
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Define the RandomForestClassifier with class_weight
model = RandomForestClassifier(random_state=42, class_weight='balanced')

# Define the hyperparameter grid for GridSearchCV
param_grid = {
    'n_estimators': [50, 100, 200],
    'criterion': ['gini', 'entropy'],
    'max_depth': [None, 10, 20, 30, 40, 50],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Use GridSearchCV with class_weight
grid_search = GridSearchCV(estimator=model, param_grid=param_grid, cv=cv)
grid_search.fit(X_train, y_train)

# Best parameters from the grid search
best_params = grid_search.best_params_
print("Best Hyperparameters:", best_params)

# Model Evaluation
y_pred = grid_search.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred, zero_division=1))
# Define the RandomForestClassifier with the specified hyperparameters
depression_final_model = RandomForestClassifier(
    n_estimators=100,  # You can adjust the number of trees in the forest
    criterion='gini',
    max_depth=None,
    min_samples_leaf=1,
    min_samples_split=10,
    random_state=42
)

# Fit the model to the training data
depression_final_model.fit(X_train, y_train)
y_pred_final = depression_final_model.predict(X_test)
accuracy_final = accuracy_score(y_test, y_pred_final)
print("Final Model Accuracy:", accuracy_final)
joblib.dump(depression_final_model, 'depression_final_model.joblib')
joblib.dump(le, 'label_encoder.joblib')
