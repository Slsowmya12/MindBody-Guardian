import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Questions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, name } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      // Replace with your backend URL
      const response = await fetch(`${config.SERVER_URL}/api/getQuestions?category=${category}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
        setAnswers(new Array(data.data.questions.length).fill(null));
      } else {
        alert('Failed to load questions');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, navigate to result with question context
      navigation.navigate('Result', { category, answers: newAnswers, questions, name });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00acc1" />
        <Text>Loading questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name} Test</Text>
      <Text style={styles.progress}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
      <View style={styles.questionContainer}>
        <Text style={styles.question}>{currentQuestion?.question}</Text>
        {currentQuestion?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  progress: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  questionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    color: '#333',
  },
  option: {
    backgroundColor: '#00acc1',
    padding: 15,
    marginVertical: 5,
    borderRadius: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Questions;