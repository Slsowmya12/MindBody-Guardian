import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ImageBackground, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
const image=require('../../assets/images/home.jpg')

const Home = () => {
  const navigation = useNavigation();
  return (
    <ImageBackground source={image} style={{flex:1 ,width:'100%', height:'100%'}}>
     <View className='container  items-start justify-center h-3/5 m-5'>
      <Text className='text-4xl text-cyan-900'>MIND BODY</Text>
      <Text className='text-4xl text-slate-200 text-slate-400'>GUARDIAN</Text>
     </View>
    <View className='conatiner items-center justify-start p-2 h-2/5 bg-slate-200 '>
    <Text className='text-xl my-2 text-slate-950  font-medium'>Your ultimate personal trainer</Text>
    <Text className='text-slate-950 my-3 items-center'>Train Your Body. Strengthen Your Mind!</Text>
    <Button mode="contained" className='bg-slate-700 text-slate-400 h-10 w-80 my-3' onPress={() => navigation.navigate('Login')} >Get started</Button>
    </View>
    </ImageBackground>
      
  );
};

export default Home;
