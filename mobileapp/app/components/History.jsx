import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config';

const History = () => {
  const navigation = useNavigation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Refresh history when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchHistory(false); // Don't show loading spinner when refreshing
    }, [])
  );

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${config.SERVER_URL}/api/getTestHistory`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.history)) {
        setHistory(data.history);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const getSeverityColor = (percentage, severity) => {
    if (severity) {
      const level = severity.toLowerCase();
      if (level.includes('low')) return '#4caf50';
      if (level.includes('moderate')) return '#ff9800';
      if (level.includes('high') || level.includes('severe')) return '#f44336';
    }
    if (percentage !== undefined && percentage !== null) {
      if (percentage < 40) return '#4caf50';
      if (percentage < 70) return '#ff9800';
      return '#f44336';
    }
    return '#00acc1';
  };

  const renderItem = ({ item }) => {
    const severityColor = getSeverityColor(item?.percentage, item?.severity_level);
    return (
      <TouchableOpacity
        style={[styles.historyItem, { borderLeftColor: severityColor }]}
        onPress={() => {
          navigation.navigate('Result', {
            historyItem: item,
            category: item?.category,
            name: item?.name || item?.category,
            percentage: item?.percentage,
            severity_level: item?.severity_level,
          });
        }}
      >
      <Text style={styles.category}>{(item?.category || '').replace('_', ' ').toUpperCase()}</Text>
      <Text style={styles.date}>
        {(() => {
          const dateValue = item?.created_at || item?.timestamp;
          
          if (!dateValue) return 'Date not available';
          
          try {
            let date;
            if (typeof dateValue === 'string') {
              date = new Date(dateValue);
              if (isNaN(date.getTime())) {
                date = new Date(dateValue.replace(' ', 'T'));
              }
            } else if (dateValue && typeof dateValue === 'object' && dateValue.$date) {
              date = new Date(dateValue.$date);
            } else {
              date = new Date(dateValue);
            }
            
            return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
          } catch (error) {
            return 'Date not available';
          }
        })()}
      </Text>
      <View style={styles.resultRow}>
        <Text style={[styles.score, { color: severityColor }]}>Score: {item?.percentage}%</Text>
        <Text style={[styles.severity, { backgroundColor: severityColor, color: '#fff' }]}>{item?.severity_level}</Text>
      </View>
      {item?.ai_recommendation ? (
        <Text style={styles.aiIndicator}>✓ AI Analysis Available</Text>
      ) : (
        <Text style={styles.noAIText}>No AI analysis yet</Text>
      )}
    </TouchableOpacity>
  );
};

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00acc1" />
        <Text>Loading history...</Text>
      </View>
    );
  }

  const clearHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      setLoading(true);
      const response = await fetch(`${config.SERVER_URL}/api/clearTestHistory`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setHistory([]);
      } else {
        console.error('Failed to clear history', data);
      }
    } catch (error) {
      console.error('Error clearing history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.clearButtonTopRight} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </TouchableOpacity>
      </View>
      {Array.isArray(history) && history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?._id || `item-${index}`}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noHistory}>No test history found.</Text>
      )}
    </View>
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
  list: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#e3f2fd',
    padding: 24,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#1565c0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#0d47a1',
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00acc1',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  severity: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: 'bold',
  },
  aiIndicator: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: 5,
  },
  recommendationContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  clearButtonTopRight: {
    backgroundColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  aiBlock: {
    marginTop: 8,
    backgroundColor: '#eef7ff',
    borderRadius: 8,
    padding: 8,
  },
  aiText: {
    marginTop: 4,
    color: '#1a237e',
    fontSize: 12,
    lineHeight: 18,
  },
  noAIText: {
    marginTop: 8,
    color: '#999',
    fontSize: 12,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noHistory: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});

export default History;