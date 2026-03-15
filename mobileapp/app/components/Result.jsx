import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Result = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, answers, name } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // Replace with your backend URL
      const response = await fetch(`${config.SERVER_URL}/api/getPredictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          userInputs: answers,
          age: 20,  // TODO: Get actual age from user profile
          date: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      if (data.success !== false) {
        setResult(data);
      } else {
        alert('Failed to get prediction');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching result');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00acc1" />
        <Text>Analyzing your responses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name} Test Result</Text>
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.percentage}>Severity: {result.percentage}%</Text>
          <Text style={styles.severity}>Level: {result.severity_level}</Text>
          <Text style={styles.message}>
            {result.severity_level === 'Low' ? 'You seem to be doing well. Keep maintaining your mental health!' :
             result.severity_level === 'Moderate' ? 'Consider seeking support or professional help.' :
             'Please consult a mental health professional immediately.'}
          </Text>
        </View>
      ) : (
        <Text style={styles.error}>Unable to load result. Please try again.</Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MindBodyGuardian', { screen: 'Tests' })}
      >
        <Text style={styles.buttonText}>Take Another Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
    width: '100%',
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00acc1',
    marginBottom: 10,
  },
  severity: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#00acc1',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Result;