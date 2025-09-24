import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Platform, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { QuestionnaireScreen } from './src/screens/QuestionnaireScreen';
import { ResourceScreen } from './src/screens/ResourceScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { Colors } from './src/utils/colors';

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/eugene-taran/sdsa');
  };

  const GitHubButton = () => (
    <TouchableOpacity
      onPress={handleGitHubPress}
      style={{ marginRight: 15 }}
      accessibilityLabel="Open GitHub repository"
      accessibilityRole="button"
    >
      <Ionicons name="logo-github" size={24} color={colors.text} />
    </TouchableOpacity>
  );

  useEffect(() => {
    // Fix scrolling on web
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        body {
          overflow: auto !important;
          height: 100%;
        }
        html {
          height: 100%;
        }
        #root {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        /* Ensure ScrollView and FlatList work properly */
        div[data-testid="ScrollView"], 
        div[data-testid="FlatList"] {
          flex: 1;
          overflow: auto !important;
        }
        /* Fix for RN Web FlatList */
        div[dir="ltr"] {
          height: 100%;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

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
            headerRight: GitHubButton,
          }}
        />
        <Stack.Screen
          name="Category"
          component={CategoryScreen}
          options={({ route }: { route: { params?: { category?: { name?: string } } } }) => ({
            title: route.params?.category?.name || 'Category',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerRight: GitHubButton,
          })}
        />
        <Stack.Screen
          name="Questionnaire"
          component={QuestionnaireScreen}
          options={{
            title: 'Questionnaire',
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.text,
            headerRight: GitHubButton,
          }}
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
            headerRight: GitHubButton,
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
            headerRight: GitHubButton,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
