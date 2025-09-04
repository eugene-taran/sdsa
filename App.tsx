import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { ResourceScreen } from './src/screens/ResourceScreen';
import { ChatScreen } from './src/screens/ChatScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'SDSA',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#333',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Journey"
          component={JourneyScreen}
          options={{
            title: 'Learning Journey',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#333',
          }}
        />
        <Stack.Screen
          name="Resource"
          component={ResourceScreen}
          options={{
            title: 'Resource',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#333',
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'AI Assistant',
            headerStyle: {
              backgroundColor: '#fff',
            },
            headerTintColor: '#333',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
