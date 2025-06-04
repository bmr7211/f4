// navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
//import LoginScreen from '../screens/LoginScreen';
//import ProfileScreen from '../screens/ProfileScreen';
import TabNavigator from './Tabnavigator';
import CameraScreen from '../Screens/CameraScreen';
import { NavigatorScreenParams } from '@react-navigation/native';


export type BottomTabParamList = {
  Home: undefined;
  Map: undefined;
  Report: undefined;
  Camera: undefined;
  Mypage: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Camera: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (

  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="Camera" component={CameraScreen} />
  </Stack.Navigator>

  );
}
