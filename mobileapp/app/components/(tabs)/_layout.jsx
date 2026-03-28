import React from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // or your preferred icon library
import Profile from './Profile';
import Search from './Prompt';
import Videos from './Videos';
import Tests from './Tests';
import tw from 'twrnc'; // Import twrnc for Tailwind CSS classes

const Tab = createMaterialBottomTabNavigator();

const MindBodyGuardian = ({ route }) => {
  const username = route.params?.username ?? '';
  console.log(username);
  
  return (
    <Tab.Navigator
      initialRouteName="Search"
      activeColor={tw.color('text-cyan-600')}
      inactiveColor={tw.color('text-black')}
      barStyle={[tw`bg-white`,{height:70}]}
    >
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        initialParams={{ username: username }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={Search} 
        initialParams={{fileId:''}}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat-processing-outline" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen 
        name="videos" 
        component={Videos} 
        options={{
          tabBarLabel: 'videos',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="video" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tests" 
        component={Tests} 
        options={{
          tabBarLabel: 'Tests',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-check" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MindBodyGuardian;
