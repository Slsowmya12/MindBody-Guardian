import { View, Text,Pressable } from 'react-native'
import React from 'react';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const Profile = ({route}) => {
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Logged out successfully',
      });
      navigation.replace('Login');
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      });
    }
  };
  const { username } = route.params; 
  return (
    <>
       <View className='flex-1'>
      <View className='items-center m-4 justify-center'>
        <View style={{ borderWidth: 6, borderColor: '#00acc1', borderRadius: 75 }}>
          <MaterialCommunityIcons
            name="account-circle"
            size={150}
            color="grey"
          />
        </View>
        <Text className='text-xl text-black font-bold mt-2'>Welcome, {username}</Text>
      </View>

      <View className='items-center ml-5 justify-evenly bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg'>
        <Pressable
          onPress={() => navigation.navigate('Personalinfo')}
          className='flex-row items-center justify-start bg-white rounded-lg p-3 mt-4 w-3/4'
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            style={{
              backgroundColor: '#00acc1',
              color: 'white',
              padding: 8,
              borderRadius: 12,
              marginRight: 8
            }}
          />
          <Text className='text-lg text-cyan-600 font-bold'>Personal info</Text>
        </Pressable>

        {/* <Pressable
          onPress={() => navigation.navigate('History')}
          className='flex-row items-center justify-start bg-white rounded-lg p-3 mt-4 w-3/4'
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <MaterialCommunityIcons
            name="history"
            size={24}
            style={{
              backgroundColor: '#00acc1',
              color: 'white',
              padding: 8,
              borderRadius: 12,
              marginRight: 8
            }}
          />
          <Text className='text-lg text-cyan-600 font-bold'>History</Text>
        </Pressable> */}

        <Pressable
          onPress={handleLogout}
          className='flex-row items-center justify-start bg-white rounded-lg p-3 mt-4 w-3/4'
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={24}
            style={{
              backgroundColor: '#00acc1',
              color: 'white',
              padding: 8,
              borderRadius: 12,
              marginRight: 8
            }}
          />
          <Text className='text-lg text-cyan-600 font-bold'>Logout</Text>
        </Pressable>
      </View>
    </View>
    </> 
  )
} 
export default Profile