import React, {useState} from 'react';
import { View, Text ,ImageBackground,TextInput,TouchableOpacity} from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message'; 
import config from '../../config';

const signupUrl = `${config.SERVER_URL}/signup`;

const image=require('../../assets/images/swave.png')
const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Both fields are required',
      });
      return;
    }
    try {
      console.log('enteres signup');

      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        // Check if the response is not OK and log the response
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: data.message || 'Registered successfully',
        });
        // Navigate to the next screen or perform any other actions on success
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: data.message || 'An error occurred',
        });
      }
    }
    catch (error) {
      console.error('Fetch error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to connect to the server',
      });
    }

  }
   return (
    <ImageBackground source={image} style={{flex:1 ,width:'100%', height:'100%'}}>
       <View className="container  m-4 items-start  absolute bottom-5 h-3/6 bg-transparent  p-4  ">
        <Text className='text-lg my-2'>Username</Text>
       <TextInput className='border border-cyan-600 border-2 p-1 text-sm  w-3/4 rounded-3xl ' placeholder="Username"  onChangeText={setUsername} />
       <Text className='text-lg my-2'>Password</Text>
       <TextInput  className=' border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl ' placeholder="abc@123" onChangeText={setPassword}/>
       <Button mode="contained" className='bg-cyan-900 text-slate-400 h-10 w-3/4 my-3' onPress={handleLogin}>signup</Button>
      </View>
      <Toast></Toast>
      
    </ImageBackground>
  )
}
export default Signup