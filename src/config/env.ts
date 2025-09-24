/**
 * Environment configuration
 * Handles environment variables across platforms
 *
 * Note: In a BYOK model, API keys are typically provided by users
 * through the UI rather than environment variables
 */

import Constants from 'expo-constants';

export const getEnvConfig = () => {
  // For Expo/React Native, we need to use Constants.expoConfig.extra or Constants.manifest.extra
  // The structure differs between platforms
  const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

  // Debug logging
  if (__DEV__) {
    console.log('Constants object keys:', Object.keys(Constants));
    console.log('Constants.expoConfig:', Constants.expoConfig ? 'Available' : 'Not available');
    console.log('Constants.manifest:', Constants.manifest ? 'Available' : 'Not available');
    console.log('Extra config:', extra);
    if (extra.geminiApiKey) {
      console.log('API Key from extra: Yes');
    }
  }

  // Optional: Pre-configure API key for development
  const apiKey = extra.geminiApiKey || process.env.GEMINI_API_KEY || undefined;

  // Model configuration with defaults
  const imageModel = extra.geminiImageModel || process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview';
  const chatModel = extra.geminiChatModel || process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';

  return {
    apiKey,
    imageModel,
    chatModel,
  };
};

export const env = getEnvConfig();