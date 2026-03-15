import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const videoFiles = [
  { source: require('../../../assets/vedios/burpee.mp4'), name: 'Burpee' },
  { source: require('../../../assets/vedios/squat.mp4'), name: 'Squat' },
  { source: require('../../../assets/vedios/jumpsquat.mp4'), name: 'Jumpsquat' },
  { source: require('../../../assets/vedios/sidelunge.mp4'), name: 'Sidelunge' },

];


const Videos = () => {
  const [playingVideo, setPlayingVideo] = useState(null);
  const videoRefs = useRef([]);

  const navigation = useNavigation();

  const handleFullScreen = (index) => {
    if (playingVideo !== index) {
      videoRefs.current[index]?.presentFullscreenPlayer();
      setPlayingVideo(index);
    } else {
      videoRefs.current[index]?.dismissFullscreenPlayer();
      setPlayingVideo(null);
    }
  };

  const handleGetStarted = () => {
    navigation.navigate('Started'); // Navigate to the "Started" page
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Videos</Text>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {videoFiles.map((video, index) => {

          const isPlaying = playingVideo === index;
          return (
            <View key={index} style={styles.videoContainer}>
              <Video
                ref={(ref) => (videoRefs.current[index] = ref)}
                source={video.source}

                style={styles.video}
                shouldPlay={isPlaying}
                resizeMode="contain"
                isLooping
                useNativeControls
              />
              <View style={styles.videoInfoContainer}>
                <Text style={styles.videoName}>{video.name}</Text>
                <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
                  <Text style={styles.getStartedButtonText}>Get Started</Text>
                </TouchableOpacity>
              </View>

            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  videoContainer: {
    marginBottom: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,

  },
  video: {
    width: '100%',
    height: 280,
    borderRadius: 10,
  },
  videoInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  videoName: {
    fontSize: 20,
    color: 'black',
    padding:6,
  },
  getStartedButton: {
    backgroundColor: '#00acc1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default Videos;
