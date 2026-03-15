// src/navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import History from './History'; // Adjust the path if needed

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="History" component={History} />
      {/* Add other screens if needed */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
