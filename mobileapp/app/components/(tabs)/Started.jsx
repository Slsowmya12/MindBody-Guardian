import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera/legacy';
import * as Speech from 'expo-speech';
import config from '../../../config';
const startedUrl = `${config.SERVER_URL}/video_feed`; 

const Started = () => {
  const cameraRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null); 
  const [exerciseStatus, setExerciseStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [intervalId, setIntervalId] = useState(null);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [noPoseCount, setNoPoseCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted'); 
    })();
  }, []);

 const speakIncorrectFeedback = () => {
    console.log("incorrect");
    Speech.speak("Your form is incorrect. Please correct it.", {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
      onError: (error) => console.log('Error in Speech:', error),
    });
  };

  const speakCorrectFeedback = () => {
    console.log("correct form");
    Speech.speak("Great, keep doing", {
      language: 'en',
      pitch: 1.0,
      rate: 1.0,
      onError: (error) => console.log('Error in Speech:', error),
    });
  };
  const speaknopose = () => {
    console.log("no pose detected")
    Speech.speak("No pose detected. Ensure camera is correctly placed ",{
      language:'en',
      pitch: 1.0,
      rate:1.0,
      onError: (error) => console.log("error in pose",error),
    })
  }

  const startStreaming = async () => {  
    if (cameraRef.current && !recording) {
      setRecording(true);
      const id = setInterval(async () => {
        if (cameraRef.current) {
          const photo = await cameraRef.current.takePictureAsync({ base64: true, isAudioEnabled: false });
          const response = await fetch(startedUrl, {
            method: 'POST',
            body: JSON.stringify({ image: photo.base64 }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log(data);
          setExerciseStatus(data.message || 'Error fetching status');  

        if (data.message === "INCORRECT FORM") {
            speakIncorrectFeedback();
          } 
          else if (data.message === "Correct") {
            
            speakCorrectFeedback();
          }
          else if (data.message === "No pose detected")
          {
            speaknopose();
          }
        }
      }, 5000); // Send a frame every second

      setIntervalId(id); // Store the interval ID for clearing later
    }
  };

  const stopStreaming = () => {
    if (recording) {
      setRecording(false);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null); // Clear the stored interval ID
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(prevType =>
      prevType === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
    );
  };

  const getStatusStyle = () => {
    return exerciseStatus === "Correct" ? styles.correct : exerciseStatus === "Incorrect" ? styles.incorrect : styles.default;
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} type={cameraType} />
      <View style={styles.buttonContainer}>
        <Button
          title={recording ? "Stop Streaming" : "Start Streaming"}
          onPress={recording ? stopStreaming : startStreaming}
          color="#841584"
        />
        <Button title={`Switch to ${cameraType === Camera.Constants.Type.back ? 'Front' : 'Back'} Camera`} onPress={toggleCameraType} />
      </View>
      <Text style={[styles.statusText, getStatusStyle()]}>Status: {exerciseStatus}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  statusText: {
    fontSize: 20,
    marginTop: 20,
  },
  correct: {
    color: 'green',
  },
  incorrect: {
    color: 'red',
  },
  default: {
    color: 'black',
  },
});

export default Started;





