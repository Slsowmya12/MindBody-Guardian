import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const History = ({ route }) => {
  const { questions } = route.params; // Extract the questions from navigation parameters

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.question}>{question}</Text>
          </View>
        ))}
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
    padding: 20,
  },
  questionContainer: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f1f1',
  },
  question: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 16,
  },
});

export default History;
