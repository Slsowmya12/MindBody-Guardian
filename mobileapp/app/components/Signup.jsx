import React, {useState} from 'react';
import { View, Text, ImageBackground, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import config from '../../config';

const requestOtpUrl = `${config.SERVER_URL}/signup`;
const verifyOtpUrl = `${config.SERVER_URL}/signup/verify-otp`;
const image = require('../../assets/images/swave.png');

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleRequestOtp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Name, email, and password are required',
      });
      return;
    }

    try {
      const response = await fetch(requestOtpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: data.message || 'OTP sent to your email',
        });
        setOtpSent(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Unable to send OTP',
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to connect to the server',
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!email.trim() || !otp.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email and OTP are required',
      });
      return;
    }

    try {
      const response = await fetch(verifyOtpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || 'Signup completed',
        });
        setTimeout(() => navigation.navigate('Login'), 800);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Invalid OTP',
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to connect to the server',
      });
    }
  };

  return (
    <ImageBackground source={image} style={{ flex: 1, width: '100%', height: '100%' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}>
          <View className="container items-start bg-transparent p-4">
            <Text className='text-lg my-2'>Name</Text>
            <TextInput
          className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
          placeholder="Your full name"
          autoCapitalize="words"
          onChangeText={setName}
          value={name}
          editable={!otpSent}
        />
        <Text className='text-lg my-2'>Email</Text>
        <TextInput
          className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          editable={!otpSent}
        />
        <Text className='text-lg my-2'>Password</Text>
        <TextInput
          className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
          placeholder="abc@123"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          editable={!otpSent}
        />
        {otpSent && (
          <>
            <Text className='text-lg my-2'>OTP</Text>
            <TextInput
              className='border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl'
              placeholder="Enter OTP"
              keyboardType="numeric"
              onChangeText={setOtp}
              value={otp}
            />
          </>
        )}
        <Button
          mode="contained"
          className='bg-cyan-900 text-slate-400 h-10 w-3/4 my-3'
          onPress={otpSent ? handleVerifyOtp : handleRequestOtp}
        >
          {otpSent ? 'Verify OTP' : 'Send OTP'}
        </Button>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  <Toast />
</ImageBackground>
  );
};

export default Signup