import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const Result = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, answers = [], questions = [], name, historyItem } = route.params || {};
  const [entryId, setEntryId] = useState(historyItem?.entry_id || historyItem?._id || null);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  useEffect(() => {
    if (historyItem) {
      // If coming from history, use saved data
      setResult({
        percentage: historyItem.percentage,
        severity_level: historyItem.severity_level,
      });
      // Check if AI analysis was already done
      if (historyItem.ai_recommendation) {
        setAnalysis(historyItem.ai_recommendation);
      }
      setLoading(false);
      setResultSaved(true); // Mark as saved since it's from history
    } else {
      fetchResult();
    }
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
      console.log('Prediction response data:', data);
      if (data.percentage !== undefined && data.severity_level) {
        setResult(data);

        // Save initial result to history even before AI analysis, if not saved yet.
        if (!resultSaved) {
          try {
            const responseData = await saveHistory(data, null);
            if (responseData?.entry_id) {
              setEntryId(responseData.entry_id);
            }
            setResultSaved(true);
          } catch (saveErr) {
            console.error('Failed to save initial history:', saveErr);
          }
        }
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

  const saveHistory = async (resultData, aiAnalysis = null) => {
    console.log('saveHistory function called with resultData:', resultData, 'aiAnalysis:', aiAnalysis);
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const requestData = {
        entry_id: entryId,
        category,
        name: name || category,
        result: resultData.severity_level,
        percentage: resultData.percentage,
        severity_level: resultData.severity_level,
        answers,
        ai_recommendation: aiAnalysis,
      };

      console.log('Saving history with data:', requestData);

      const response = await fetch(`${config.SERVER_URL}/api/saveTestHistory`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Save history response status:', response.status);
      const responseData = await response.json();
      console.log('Save history response data:', responseData);

      if (!response.ok) {
        throw new Error(`History save failed ${response.status}: ${responseData?.message || JSON.stringify(responseData)}`);
      }

      setResultSaved(true);

      if (responseData?.entry_id) {
        setEntryId(responseData.entry_id);
      }

      return responseData;

    } catch (error) {
      console.error('Error saving history:', error);
      // Don't alert user for background save failure
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
      const normalizedQuestions = Array.isArray(questions) ? questions : [];
      const normalizedAnswers = Array.isArray(answers) ? answers : [];

      const answerContext = (normalizedQuestions.length > 0 && normalizedQuestions.length === normalizedAnswers.length)
        ? normalizedQuestions.map((q, index) => {
            const selectedIndex = normalizedAnswers[index];
            const selectedOption = q?.options?.[selectedIndex];
            return `Question ${index + 1}: ${q?.question ?? 'Unknown question'}\nSelected answer: ${selectedOption ?? 'Answered option #' + (Number.isInteger(selectedIndex) ? (selectedIndex + 1) : 'unknown')}`;
          }).join('\n\n')
        : `Answers: ${JSON.stringify(normalizedAnswers)}`;

      const prompt = `Analyze this mental health test result and provide:\n- A short analysis report\n- Personalized suggestions\n- Actionable mental health recommendations\n\nCategory: ${category}\nResult: ${result.severity_level}\nScore: ${result.percentage}%\n\nUse the following question context to understand the user responses:\n${answerContext}\n\nDo not repeat the raw answers back to the user. Provide only the final analysis, suggestions, and recommendations.`;

      const response = await fetch(`${config.SERVER_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await response.json();
      console.log('AI raw response data:', data);
      const aiResult = data?.answer || data?.content || data?.result || data?.analysis || data?.message || null;
      console.log('Parsed aiResult:', aiResult);

      if (aiResult) {
        setAnalysis(aiResult);

        // Save to history (AI analysis text) and mark saved
        if (result) {
          try {
            const responseData = await saveHistory(result, aiResult);
            if (responseData?.entry_id) {
              setEntryId(responseData.entry_id);
            }
            setResultSaved(true);
          } catch (error) {
            console.error('saveHistory failed:', error);
            alert('Failed to save analysis. Please try again.');
            return;
          }
        }
      } else {
        console.warn('No AI result available', data);
        alert('AI analysis returned no content. Please try again.');
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
          <Text style={styles.buttonText}>
            {analysis ? 'Re-analyze with AI' : 'Analyze Result with AI'}
          </Text>
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