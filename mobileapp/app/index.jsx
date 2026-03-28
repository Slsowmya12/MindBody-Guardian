import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message'; // Import useToast hook
import { createStackNavigator } from '@react-navigation/stack';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import MindBodyGuardian from './components/(tabs)/_layout';
import Personalinfo from './components/(tabs)/Personalinfo';
import Search from './components/(tabs)/Prompt';
// import DrawerNavigator from './components/(tabs)/DrawerNavigator';
import Started from './components/(tabs)/Started';
import Questions from './components/Questions';
import Result from './components/Result';

const Stack = createStackNavigator();
const Index = () => {
 return (
  <>
    <Stack.Navigator screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
            height:70,
          },
          headerTintColor: 'black',
          headerTitleStyle: {
            fontWeight: 'medium',
          },
        }}> 
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="Signup" component={Signup}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPassword}/>
        <Stack.Screen name="ResetPassword" component={ResetPassword}/>
        <Stack.Screen name="MindBodyGuardian" component={MindBodyGuardian} options={{ headerShown: false }} /> 
        <Stack.Screen name="Personalinfo" component={Personalinfo}/>
        <Stack.Screen name="Search" component={Search}/>
        {/* <Stack.Screen name="DrawerNavigator" component={DrawerNavigator}/> */}
        <Stack.Screen name="Started" component={Started}/>
        <Stack.Screen name="Questions" component={Questions}/>
        <Stack.Screen name="Result" component={Result}/>
    </Stack.Navigator>  
    <Toast></Toast>
    </>
  )
}

export default Index
