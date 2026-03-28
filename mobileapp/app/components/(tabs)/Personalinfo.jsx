import React, { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; // Import useToast hook
import { View, Text, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../../../config';

const personalinfoUrl = `${config.SERVER_URL}/personalinfo`;


const Personalinfo = () => {
  const navigation = useNavigation();
  const [fullName, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPersonalInfo = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(personalinfoUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.data) {
        setName(data.data.fullName || '');
        setDob(data.data.dob || '');
        setGender(data.data.gender || '');
        setFitnessGoals(data.data.fitnessGoals || '');
      }
    } catch (error) {
      console.log('Failed to load personal info', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPersonalInfo();
    }, [])
  );

  const handleSignup = async () => {
    if (!fullName || !dob || !gender || !fitnessGoals) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all the fields',
      });
      return;
    }
    console.log({ fullName, dob, gender, fitnessGoals });
    try {
      console.log('request to post personal info...')
      const token = await AsyncStorage.getItem('authToken');
      console.log(token)
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Unauthorized',
          text2: 'There\'s some error please sign in again.',
        });
        return;
      }
      const response = await fetch(personalinfoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          info: { fullName, dob, gender, fitnessGoals }
        }),
      });
      const data = await response.json();
      console.log(data)

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'success',
          text2: data.message || 'Your info is successfully saved',
        });
        setTimeout(() => {
          navigation.replace('MindBodyGuardian', { screen: 'Profile' });
        }, 800);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sorry, we Couldn\'t save your info',
          text2: 'Please try again. ',
        });
      }
  }catch(error){
    console.log(error)
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2:  'Something went wrong',
    });
  };
  };

  return (
    <View className=" p-4 bg-white h-full justify-start">
      <View className="mb-4">
        <Text className="text-lg my-2 ">Name</Text>
        <View className="flex-row items-center border border-cyan-600 border-2 p-1 rounded-3xl">
          <MaterialCommunityIcons
            name="account"
            style={{ backgroundColor: '#00acc1', color: 'white', padding: 8, borderRadius: 25, marginRight: 8 }}
            size={24}
          />
          <TextInput
            className="text-sm w-3/4"
            placeholder="Full Name"
            onChangeText={setName}
            value={fullName}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg my-2">Date of Birth</Text>
        <View className="flex-row items-center border border-cyan-600 border-2 p-1 rounded-3xl">
          <MaterialCommunityIcons
            name="calendar"
            style={{ backgroundColor: '#00acc1', color: 'white', padding: 8, borderRadius: 25, marginRight: 8 }}
            size={24}
          />
          <TextInput
            className="text-sm w-3/4"
            placeholder="YYYY-MM-DD"
            onChangeText={setDob}
            value={dob}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg my-2">Gender</Text>
        <View className="flex-row items-center border border-cyan-600 border-2 p-1 rounded-3xl">
          <MaterialCommunityIcons
            name="gender-male-female"
            style={{ backgroundColor: '#00acc1', color: 'white', padding: 8, borderRadius: 25, marginRight: 8 }}
            size={24}
          />
          <TextInput
            className="text-sm w-3/4"
            placeholder="Gender"
            onChangeText={setGender}
            value={gender}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg my-2">Fitness Goals</Text>
        <View className="flex-row items-center border border-cyan-600 border-2 p-1 rounded-3xl">
          <MaterialCommunityIcons
            name="dumbbell"
            style={{ backgroundColor: '#00acc1', color: 'white', padding: 8, borderRadius: 25, marginRight: 8 }}
            size={24}
          />
          <TextInput
            className="text-sm w-3/4"
            placeholder="strength/cardio/weightloss"
            onChangeText={setFitnessGoals}
            value={fitnessGoals}
          />
        </View>
      </View>
      <Pressable className="flex-row items-center justify-center h-12 bg-cyan-600 rounded-3xl" onPress={handleSignup}>
        <Text className="text-white text-lg">Save</Text>
      </Pressable>
    </View>
  );
};

export default Personalinfo;
