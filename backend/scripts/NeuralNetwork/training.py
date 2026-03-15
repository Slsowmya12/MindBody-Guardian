# import pandas as pd
# import random
# import numpy as np
# import os
# from sklearn.preprocessing import LabelEncoder
# #0=incorrect 1 correct 0-wallsit 1-plank
# #loading the dataset into array format 
# data=pd.read_csv("squat.csv",header=1)
# # Shuffle the rows of the DataFrame
# shuffled = data.sample(frac=1).reset_index(drop=True)
# #print(shuffled.head())
# shuffled.shape

# from sklearn.model_selection import train_test_split
# # Assuming the last column is the target variable (y) and the rest are features (X)
# X = data.iloc[:, :-1]  # All columns except the last one
# y = data.iloc[:, -1]   # Last column

# # Split the dataset into training and testing sets (80% training, 20% testing)
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# print(X_train.shape)


# #creating the neural network model
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import Dense,Input
# from tensorflow.keras.optimizers import Adam

# # Build the neural network
# model = Sequential()
# # Input layer (5 inputs)
# model.add(Input(shape=(X_train.shape[1],)))

# model.add(Dense(10, activation='relu')) 
# # Additional hidden layer (optional)

# model.add(Dense(5, activation='relu'))  # 5 neurons in the hidden layer

# # Output layer (binary classification, so 1 neuron with sigmoid activation)
# model.add(Dense(1, activation='sigmoid'))
# print(model.summary())

# #compiling the model(configuring the model)
# model.compile(loss='binary_crossentropy',optimizer=Adam(learning_rate=0.01), metrics=['accuracy'])

# #training the model
# from keras.callbacks import EarlyStopping, ModelCheckpoint

# # Create the callbacks
# callback_a = ModelCheckpoint(filepath="my_best_model.keras", monitor='val_loss', save_best_only=True)
# callback_b = EarlyStopping(monitor='val_loss', mode='min', patience=20, verbose=1)



# history= model.fit(X_train,y_train,validation_data=(X_test,y_test),epochs=256,batch_size=20,callbacks=[callback_a,callback_b],verbose=1)

# #checking the learning curves
# print(history.params)

# #evaluate the model
# scores=model.evaluate(X_train,y_train)
# print(model.metrics_names)
# print(scores)
# print("\n%s: %.2f%%" % (model.metrics_names[1],scores[1]*100))


# #evaluating on validating set
# scores=model.evaluate(X_test,y_test)
# print("\n%s: %.2f%%" % (model.metrics_names[1],scores[1]*100))


# print(X_test[0:5])
# print(y_test[0:5])

# prediction=model.predict(X_test)

# print(prediction[0:10])

# print(prediction[0:10].round())