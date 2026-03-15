import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

const Tests = () => {
  const navigation = useNavigation();

  const testCategories = [
    { id: '1', name: 'Depression', category: 'depression' },
    { id: '2', name: 'Anxiety', category: 'anxiety' },
    { id: '3', name: 'Stress', category: 'stress' },
    { id: '4', name: 'ADHD', category: 'adhd' },
    { id: '5', name: 'Autism', category: 'autism' },
    { id: '6', name: 'Dyslexia', category: 'dyslexia' },
    { id: '7', name: 'PTSD', category: 'ptsd' },
    { id: '8', name: 'General Mental Health', category: 'general_test' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => navigation.navigate('Questions', { category: item.category, name: item.name })}
    >
      <Text style={styles.tileText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mental Health Tests</Text>
      <FlatList
        data={testCategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
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
    alignItems: 'center',
  },
  tile: {
    backgroundColor: '#00acc1',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: 150,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Tests;