import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import tw from 'twrnc';

const Tests = () => {
  const navigation = useNavigation();

  const testCategories = [
    { id: '1', name: 'Depression', category: 'depression', icon: 'emoticon-sad-outline' },
    { id: '2', name: 'Anxiety', category: 'anxiety', icon: 'brain' },
    { id: '3', name: 'Stress', category: 'stress', icon: 'lightning-bolt' },
    { id: '4', name: 'ADHD', category: 'adhd', icon: 'head-flash-outline' },
    { id: '5', name: 'Autism', category: 'autism', icon: 'account-group' },
    { id: '6', name: 'Dyslexia', category: 'dyslexia', icon: 'book-open-variant' },
    { id: '7', name: 'PTSD', category: 'ptsd', icon: 'shield-alert-outline' },
    { id: '8', name: 'General Mental Health', category: 'general_test', icon: 'heart-pulse' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.tile}
      onPress={() => navigation.navigate('Questions', { category: item.category, name: item.name })}
    >
      <MaterialCommunityIcons name={item.icon} size={30} color="#fff" style={styles.icon} />
      <Text style={styles.tileText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mental Health Tests</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <MaterialCommunityIcons name="history" size={24} color="#00acc1" />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  historyButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginBottom: 8,
  },
  tileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Tests;