const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env.local file explicitly
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}


module.exports = {
  expo: {
    name: 'SDSA',
    slug: 'sdsa',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sdsa.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: 'com.sdsa.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // These will be accessible via Constants.expoConfig.extra
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiImageModel: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image-preview',
      geminiChatModel: process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash',
    },
  },
};