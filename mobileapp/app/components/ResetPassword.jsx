import React, { useState } from 'react';
import { View, Text, TextInput, ImageBackground } from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import config from '../../config';

const image = require('../../assets/images/swave.png');

const ResetPassword = ({ route, navigation }) => {
  const { identifier = '' } = route.params || {};
  const [usernameOrEmail, setUsernameOrEmail] = useState(identifier);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!usernameOrEmail.trim() || !token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'All fields are required.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        token: token.trim(),
        new_password: newPassword,
      };

      if (usernameOrEmail.includes('@')) {
        payload.email = usernameOrEmail.trim().toLowerCase();
      } else {
        payload.username = usernameOrEmail.trim();
      }

      const response = await fetch(`${config.SERVER_URL}/reset-password`, {
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
          text2: data.message || 'Password reset successfully.',
        });
        navigation.navigate('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'Unable to reset password.',
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
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 16, color: '#0a4a6d' }}>Reset Password</Text>
        <Text style={{ fontSize: 16, marginBottom: 8, color: '#333' }}>Enter your email, username or name plus the token sent to your inbox.</Text>
        <Text style={{ fontSize: 14, marginBottom: 16, color: '#666' }}>If you don't see the email, check your spam or junk folder.</Text>
        <TextInput
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          placeholder="Username or email"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: '#00acc1',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: '#fff',
          }}
        />
        <TextInput
          value={token}
          onChangeText={setToken}
          placeholder="Reset token"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderColor: '#00acc1',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: '#fff',
          }}
        />
        <TextInput
          value={newPassword}
          secureTextEntry
          onChangeText={setNewPassword}
          placeholder="New password"
          style={{
            borderWidth: 1,
            borderColor: '#00acc1',
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: '#fff',
          }}
        />
        <TextInput
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          style={{
            borderWidth: 1,
            borderColor: '#00acc1',
            borderRadius: 12,
            padding: 12,
            marginBottom: 20,
            backgroundColor: '#fff',
          }}
        />
        <Button mode="contained" loading={loading} disabled={loading} onPress={handleResetPassword} style={{ marginBottom: 12 }}>
          Reset Password
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')}>
          Back to Login
        </Button>
      </View>
      <Toast />
    </ImageBackground>
  );
};

export default ResetPassword;
