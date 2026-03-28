import React, { useState } from 'react';
import { View, Text, TextInput, ImageBackground } from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import config from '../../config';

const image = require('../../assets/images/swave.png');

const ForgotPassword = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!identifier.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter your username or email.',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: identifier.trim(),
      };

      if (identifier.includes('@')) {
        payload.email = identifier.trim().toLowerCase();
      }

      const response = await fetch(`${config.SERVER_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || 'Password reset instructions sent. Check your email.',
        });
        setTimeout(() => {
          navigation.navigate('ResetPassword', { identifier: identifier.trim() });
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Unable to process request.',
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to connect to the server.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={image} style={{ flex: 1, width: '100%', height: '100%' }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333' }}>Forgot Password</Text>
        <Text style={{ fontSize: 16, marginBottom: 8, color: '#333' }}>Enter your registered name, username or email to receive reset instructions.</Text>
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Username or email"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: '#00acc1',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            backgroundColor: '#fff',
          }}
        />
        <Button mode="contained" loading={loading} disabled={loading} onPress={handleForgotPassword} style={{ marginBottom: 12 }}>
          Send reset instructions
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('ResetPassword', { identifier: identifier.trim() })} style={{ marginBottom: 12 }}>
          I already have a token
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')}>
          Back to Login
        </Button>
      </View>
      <Toast />
    </ImageBackground>
  );
};

export default ForgotPassword;
