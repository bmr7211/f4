import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../Screens/HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CameraScreen from '../Screens/CameraScreen';
import MapScreen from '../Screens/MapScreen';
import Mypage from '../Screens/Mypage';
import ReportScreen from '../Screens/ReportScreen';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
      headerShown: false,   
      tabBarIcon: ({ focused, color, size }) => {
      let iconName = 'Home'; // 기본 아이콘 이름

      switch (route.name) {
        case 'Home':
          iconName = 'home-outline';          
          break;
        case 'Camera':
          iconName = 'camera-outline';
          break;
        case 'Map':
          iconName = 'map-outline';
          break;
        case 'Mypage':
          iconName = 'person-outline';
          break;
        case 'Report':
          iconName = 'document-text-outline';
          break;
      }

      return (
        <Ionicons name={iconName} size={size} color={color} />
      );
    },
    tabBarActiveTintColor: '#DD0000',   // 선택된 탭의 색
    tabBarInactiveTintColor: 'gray',    // 비활성 탭의 색
    tabBarStyle: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  })}
>
  <Tab.Screen name="Map" component={MapScreen} />
  <Tab.Screen name="Report" component={ReportScreen} />
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Camera" component={CameraScreen} />
  <Tab.Screen name="Mypage" component={Mypage} />
  
  
  
</Tab.Navigator>
  );
}
