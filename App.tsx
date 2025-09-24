import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme, Platform, TouchableOpacity, Linking, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeScreen } from './src/screens/HomeScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { QuestionnaireScreen } from './src/screens/QuestionnaireScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ApiKeyModal } from './src/components/ApiKeyModal';
import { Colors } from './src/utils/colors';
import { geminiService } from './src/services/geminiService';

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [_isCheckingApiKey, setIsCheckingApiKey] = useState(true);

  const handleGitHubPress = () => {
    Linking.openURL('https://github.com/eugene-taran/sdsa');
  };

  const HeaderRight = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        onPress={() => setShowApiKeyModal(true)}
        style={{ marginRight: 15 }}
        accessibilityLabel="API Key Settings"
        accessibilityRole="button"
      >
        <Ionicons name="key-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleGitHubPress}
        style={{ marginRight: 15 }}
        accessibilityLabel="Open GitHub repository"
        accessibilityRole="button"
      >
        <Ionicons name="logo-github" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    // Check for API key on startup
    const checkApiKey = async () => {
      try {
        // Check if user has already set up API key
        const hasSeenWelcome = await AsyncStorage.getItem('has_seen_welcome');
        const storedApiKey = await AsyncStorage.getItem('gemini_api_key');

        if (!hasSeenWelcome && !storedApiKey && !process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
          // First time user without API key
          setShowApiKeyModal(true);
        } else if (storedApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
          // Initialize service with existing key
          await geminiService.initialize();
        }

        if (!hasSeenWelcome) {
          await AsyncStorage.setItem('has_seen_welcome', 'true');
        }
      } catch (error) {
        console.error('Error checking API key:', error);
      } finally {
        setIsCheckingApiKey(false);
      }
    };

    checkApiKey();

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
            headerRight: HeaderRight,
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
            headerRight: HeaderRight,
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
            headerRight: HeaderRight,
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
            headerRight: HeaderRight,
          }}
        />
      </Stack.Navigator>
      <ApiKeyModal
        visible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={async () => {
          setShowApiKeyModal(false);
          await geminiService.initialize();
        }}
      />
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
