import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text ,ImageBackground,TextInput,TouchableOpacity} from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message'; 
import config from '../../config';

const loginUrl = `${config.SERVER_URL}/login`;

const image=require('../../assets/images/swave.png')
const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSignup = async () => {
    
    
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Both fields are required',
      });
      return;
    }
    try {
      console.log('Request for login')

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();  

      if (response.ok && data.token) {
       await AsyncStorage.setItem('authToken', data.token);
       const token = await AsyncStorage.getItem('authToken');
       console.log(token);
        Toast.show({
          type: 'success',                        // Type of the toast message (error, success, info, etc.)
          text1: 'success',                       // Main text displayed in the toast
          text2: data.message || 'Successfully logged in',  // Secondary text or description
        });
        navigation.replace('MindBodyGuardian', { username: username })
        
        // Navigate to the next screen or perform any other actions on success
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Username or password incorrect ',
        });
      }
    } catch (error) {
      console.log(error)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:  'Something went wrong',
      });
    }
  };
  
  return (
    <ImageBackground source={image} style={{flex:1 ,width:'100%', height:'100%',}}>
     
      <View className="container  m-4 items-start  absolute bottom-5 h-3/6 bg-transparent  p-4  ">
        <Text className='text-lg my-2  '>Username</Text>
       <TextInput className='border border-cyan-600 border-2 p-1 text-sm  w-3/4 rounded-3xl ' placeholder="Username"  onChangeText={setUsername} />
       <Text className='text-lg my-2'>Password</Text>
       <TextInput  className=' border border-cyan-600 border-2 p-1 text-sm w-3/4 rounded-3xl ' placeholder="abc@123" onChangeText={setPassword}/>
       <Button mode="contained" className='bg-cyan-900 text-slate-400 h-10 w-3/4 my-3' onPress={handleSignup} >Login</Button>
       <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text className="text-grey-200 text-sm underline m-2">Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
      <Toast></Toast>
      
    </ImageBackground>
  )
}
export default Login