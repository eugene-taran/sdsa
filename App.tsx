import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { ResourceScreen } from './src/screens/ResourceScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Colors } from './src/utils/colors';

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'SDSA',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }: any) => ({
            title: route.params?.category?.name || 'Category',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          })}
        />
        <Stack.Screen
          name="Questionnaire"
          component={JourneyScreen}
          options={({ route }: any) => ({
            title: route.params?.questionnaire?.title || 'Questionnaire',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          })}
        />
        <Stack.Screen
          name="Resource"
          component={ResourceScreen}
          options={{
            title: 'Resource',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'AI Assistant',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
