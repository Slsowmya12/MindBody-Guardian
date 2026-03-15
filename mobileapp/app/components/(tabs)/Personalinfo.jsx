import React, { useState } from 'react';

import Toast from 'react-native-toast-message'; // Import useToast hook
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../../../config';

const personalinfoUrl = `${config.SERVER_URL}/personalinfo`;


const Personalinfo = () => {
  const [fullName, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');


  const handleSignup = async () => {
    if (!fullName || !email || !dob || !gender || !fitnessGoals) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill all the fields',
      });
      return;
    }
    console.log({ fullName, email, dob, gender, fitnessGoals });
    try {
      console.log('request to post personal info...')
      const token = await AsyncStorage.getItem('authToken');
      console.log(token)
      if(!token){
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
          info: {fullName, email, dob, gender, fitnessGoals}
        }),
      });
      const data = await response.json();  
      console.log(data)

      if(response.ok){
        Toast.show({
          type: 'success',                        // Type of the toast message (error, success, info, etc.)
          text1: 'success',                       // Main text displayed in the toast
          text2: data.message || 'Your info is successfully saved',  // Secondary text or description
        });
      }else {
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
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-lg my-2">Email</Text>
        <View className="flex-row items-center border border-cyan-600 border-2 p-1 rounded-3xl">
          <MaterialCommunityIcons
            name="email"
            style={{ backgroundColor: '#00acc1', color: 'white', padding: 8, borderRadius: 25, marginRight: 8 }}
            size={24}
          />
          <TextInput
            className="text-sm w-3/4"
            placeholder="example@example.com"
            onChangeText={setEmail}
            keyboardType="email-address"
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
          />
        </View>
      </View>
      <Pressable className="flex-row items-center justify-center h-12 bg-cyan-600 rounded-3xl" onPress={handleSignup}>
        <Text className="text-white text-lg">Submit</Text>
      </Pressable>
    </View>
  );
};

export default Personalinfo;
