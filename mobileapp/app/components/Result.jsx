import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Result = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, answers, questions = [], name } = route.params;

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

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

  const analyzeWithAI = async () => {
    if (!result) {
      alert('No result available to analyze.');
      return;
    }

    setAnalysisLoading(true);
    setAnalysis('');

    try {
      const answerContext = questions && questions.length === answers.length
        ? questions.map((q, index) => {
            const selectedIndex = answers[index];
            const selectedOption = q.options?.[selectedIndex];
            return `Question ${index + 1}: ${q.question}\nSelected answer: ${selectedOption ?? 'Answered option #' + (selectedIndex + 1)}`;
          }).join('\n\n')
        : `Answers: ${JSON.stringify(answers)}`;

      const prompt = `Analyze this mental health test result and provide:\n- A short analysis report\n- Personalized suggestions\n- Actionable mental health recommendations\n\nCategory: ${category}\nResult: ${result.severity_level}\nScore: ${result.percentage}%\n\nUse the following question context to understand the user responses:\n${answerContext}\n\nDo not repeat the raw answers back to the user. Provide only the final analysis, suggestions, and recommendations.`;

      const response = await fetch(`${config.SERVER_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await response.json();

      if (data && (data.answer || data.content)) {
        setAnalysis(data.answer || data.content || 'No analysis available.');
      } else {
        setAnalysis('AI analysis could not be generated.');
      }
    } catch (error) {
      console.error(error);
      alert('Error analyzing result with AI');
    } finally {
      setAnalysisLoading(false);
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
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
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
        style={[styles.button, analysisLoading && styles.disabledButton]}
        onPress={analyzeWithAI}
        disabled={analysisLoading}
      >
        {analysisLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Analyze Result with AI</Text>
        )}
      </TouchableOpacity>
      {analysis ? (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>AI Analysis Report</Text>
          <Text style={styles.analysisText}>{analysis}</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MindBodyGuardian', { screen: 'Tests' })}
      >
        <Text style={styles.buttonText}>Take Another Test</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
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
  analysisContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  analysisText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
  },
  button: {
    backgroundColor: '#00acc1',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Result;