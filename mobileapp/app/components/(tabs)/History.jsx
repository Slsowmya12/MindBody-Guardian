import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../../config';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        const response = await fetch(`${config.SERVER_URL}/chat-history`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setHistory(data.chat_history || []);
        } else {
          setError(data.message || 'Unable to load chat history');
        }
      } catch (err) {
        console.log('Fetch history failed', err);
        setError('Unable to load chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00acc1" />
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No chat history available yet.</Text>
        ) : (
          history.map((entry, index) => (
            <View key={index} style={styles.entryContainer}>
              <Text style={styles.entryLabel}>Question:</Text>
              <Text style={styles.entryText}>{entry.message}</Text>
              <Text style={styles.entryLabel}>Answer:</Text>
              <Text style={styles.answerText}>{entry.response}</Text>
              <Text style={styles.dateText}>{new Date(entry.created_at).toLocaleString()}</Text>
            </View>
          ))
        )}
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
    flexGrow: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#333',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  entryContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  entryLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryText: {
    color: '#334155',
    fontSize: 15,
    marginBottom: 10,
  },
  answerText: {
    color: '#1d4ed8',
    fontSize: 15,
    marginBottom: 10,
  },
  dateText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default History;
