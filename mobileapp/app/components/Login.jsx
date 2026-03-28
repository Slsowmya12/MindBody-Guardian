import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ImageBackground, TextInput, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import config from '../../config';

const loginUrl = `${config.SERVER_URL}/login`;
const image = require('../../assets/images/swave.png');

const Login = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email or username and password are required',
      });
      return;
    }

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: identifier.trim(),
          password,
        }),
      });
      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || 'Successfully logged in',
        });
        if (data.needsPersonalInfo) {
          navigation.replace('Personalinfo');
        } else {
          navigation.replace('MindBodyGuardian', { username: identifier.trim() });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Email/username or password incorrect',
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    }
  };

  return (
    <ImageBackground source={image} style={{ flex: 1, width: '100%', height: '100%' }}>
      <View className="container m-4 items-start absolute bottom-5 h-3/6 bg-transparent p-4">
        <Text className='text-lg my-2'>Email or Username</Text>
        <TextInput
          className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
          placeholder="Email or username"
          autoCapitalize="none"
          onChangeText={setIdentifier}
          value={identifier}
        />
        <Text className='text-lg my-2'>Password</Text>
        <TextInput
          className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
          placeholder="abc@123"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <Button
          mode="contained"
          className='bg-cyan-900 text-slate-400 h-10 w-3/4 my-3'
          onPress={handleLogin}
        >
          Login
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text className="text-grey-200 text-sm underline m-2">Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-grey-200 text-sm underline m-2">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </ImageBackground>
  );
};

export default Login