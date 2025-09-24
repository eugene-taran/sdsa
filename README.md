# SDSA - Software Development Smart Assist

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-green.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-black.svg)](https://expo.dev/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A cross-platform application (iOS, Android, Web) that provides personalized AI assistance for software developers through context-aware questionnaires.

## Overview

SDSA revolutionizes development assistance by first understanding your specific context through interactive questionnaires. Instead of generic AI responses, you get tailored guidance based on your project's unique requirements, tech stack, and constraints.

### How It Works

1. **Browse Categories**: Explore questionnaires organized by topics (CI/CD, Testing, Architecture, etc.)
2. **Answer Questions**: Provide context about your specific situation
3. **Get Recommendations**: Receive personalized AI-generated guidance
4. **Chat with Context**: Continue the conversation with full awareness of your answers

## Features

- 🎯 **Context-Aware**: Questionnaires gather specific requirements before providing advice
- 💬 **Personalized Chat**: AI conversations tailored to your project's context
- 📱 **Multi-Platform**: Works on iOS, Android, and Web from a single codebase
- 🌐 **Offline Ready**: Bundled questionnaires work without internet
- 🚀 **Gemini Powered**: Uses Google's Gemini AI for intelligent responses
- 👥 **Open Source**: Community-driven questionnaires and development

## Getting Started

### Prerequisites

- Node.js 20.x (auto-installed via nvm/fnm/asdf)
- Yarn 1.22+ package manager
- iOS Simulator (Mac only) or Android Studio for mobile testing
- Gemini API Key (free tier available)

### API Key Setup

SDSA uses a **BYOK (Bring Your Own Key)** model for maximum security and flexibility.

#### Option 1: In-App Setup (Recommended)

1. **Launch the app**:
   ```bash
   yarn start
   ```

2. **On first launch**, you'll see a welcome screen asking for your API key

3. **Get your free API key**:
   - Click "Get your free API key" link in the app
   - Or visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new key (free tier available)

4. **Enter your key** in the app and click "Save & Continue"

Your API key is stored securely on your device using AsyncStorage and never sent to any servers.

#### Option 2: Pre-configure for Development

For development, you can pre-configure your API key:

```bash
# Copy the example environment file
cp .env.example .env.local

# Add your API key (optional)
echo "EXPO_PUBLIC_GEMINI_API_KEY=your_key_here" >> .env.local

# Start the app
yarn start
```

> **🔒 Security**: This is a BYOK application where:
> - Each user provides their own API key
> - Keys are stored locally on the device
> - No keys are ever sent to our servers
> - Perfect for open-source and community use

> **Note**: Free tier includes 15 requests/minute and 1M tokens/month - plenty for development and personal use.

### Quick Start

```bash
# Clone repository
git clone https://github.com/eugene-taran/sdsa.git
cd sdsa

# Install correct Node version (if using nvm)
nvm install
nvm use

# Install Yarn (if not installed)
npm install -g yarn

# Install dependencies
yarn install

# Set up your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your API key from https://aistudio.google.com/app/apikey

# Start development server
yarn start
```

### Detailed Installation

1. **Install Node.js 20.x using a version manager (recommended):**

```bash
# Using nvm
nvm install
nvm use

# Using fnm
fnm install
fnm use

# Using asdf
asdf install nodejs
```

2. **Install Yarn and dependencies:**

```bash
# Install Yarn globally
npm install -g yarn

# Install project dependencies
yarn install
# or for CI environments
yarn install --frozen-lockfile
```

3. **Start the development server:**

```bash
yarn start
```

### Running the App

#### Web Development

```bash
yarn web
# Or
yarn start --web
```

#### iOS Simulator (Mac only)

```bash
yarn ios
# Or
yarn start --ios
```

#### Android Emulator

```bash
yarn android
# Or
yarn start --android
```

#### Physical Device

1. Install Expo Go app on your device
2. Scan the QR code from the terminal
3. For production features requiring native modules (Rock AI), you'll need a development build

### Development Builds

Since the app uses Rock for on-device AI inference, you'll need development builds for full functionality:

#### iOS Development Build

```bash
yarn dev-client:ios
# Or
yarn build:ios --profile development
```

#### Android Development Build

```bash
yarn dev-client:android
# Or
yarn build:android --profile development
```

## Project Structure

```
sdsa/
├── src/
│   ├── screens/         # App screens
│   ├── components/       # Reusable components
│   ├── services/         # Business logic
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── assets/              # Images and fonts
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
└── CLAUDE.md           # Detailed project documentation
```

## Tech Stack

- **Framework**: React Native with TypeScript
- **Platform**: Expo (development builds)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **On-device AI**: Rock (CallStack)
- **Styling**: React Native StyleSheet

## Contributing

We welcome contributions! There are many ways to help:

### Contributing Questionnaires

Questionnaires are stored in the `contexts/` folder. To add a new questionnaire:

1. Fork this repository
2. Create your questionnaire in `contexts/categories/[category]/your-questionnaire.json`
3. Follow the format in existing questionnaires
4. Submit a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Contributing Code

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass (`yarn test`)
5. Submit a Pull Request

All contributions must pass linting and tests

## Development Status

🚧 **Current Phase**: MVP Development

### ✅ Completed

- [x] Expo project setup with TypeScript
- [x] Multi-platform configuration (iOS/Android/Web)
- [x] Navigation structure with React Navigation
- [x] Basic screens (Home, Journey)
- [x] State management with Zustand
- [x] Project folder structure

### 🔄 Implementation Roadmap

#### Phase 1: Core Infrastructure ✅

- [x] Add Rock for on-device AI inference (Mock service ready for Rock integration)
- [x] Implement questionnaire fetching from GitHub
- [x] Add resource viewer with markdown rendering

#### Phase 2: Interactive Features ✅

- [x] Create chat interface with context awareness
- [x] Implement offline caching with AsyncStorage
- [x] Add journey state management with Zustand

#### Phase 3: AI Integration

- [ ] Integrate on-device models (Phi-3, Llama 3.2)
- [ ] Implement context-aware prompting
- [ ] Add model download manager

#### Phase 4: Polish & Optimization

- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Error handling and recovery

See [CLAUDE.md](./CLAUDE.md) for detailed implementation plans and architecture decisions.

## Available Commands

### Yarn Scripts

```bash
yarn start             # Start Expo development server
yarn web               # Start web development
yarn ios               # Run on iOS simulator
yarn android           # Run on Android emulator
yarn build:web         # Build for web deployment
yarn build:ios         # Build iOS app with EAS
yarn build:android     # Build Android app with EAS
yarn install:ci        # CI-compatible dependency installation (frozen lockfile)
yarn install:dev       # Development dependency installation
yarn lint              # Run ESLint to check code quality
yarn lint:fix          # Auto-fix ESLint issues
yarn format            # Format code with Prettier
yarn format:check      # Check code formatting
yarn type-check        # TypeScript type checking
yarn clean             # Clean all generated files
yarn clean:install     # Clean and reinstall dependencies
yarn verify            # Verify setup is correct
```

## CI/CD Ready

This project is configured to work on clean CI environments:

- **Node Version Management**: `.nvmrc` and `.node-version` files ensure consistent Node.js version
- **Dependency Locking**: `yarn.lock` with `yarn install --frozen-lockfile` for reproducible builds
- **Package Manager**: Yarn for faster, more reliable dependency management
- **EAS Build**: Cloud builds for iOS and Android without local setup
- **GitHub Actions Ready**: CI workflow included (currently disabled, rename `.github/workflows/ci.yml.disabled` to enable)

## Security & Privacy

### BYOK (Bring Your Own Key) Model

SDSA prioritizes user privacy and security through a BYOK approach:

- **🔐 Your Key, Your Control**: Each user provides their own Gemini API key
- **📱 Local Storage Only**: Keys are stored securely on your device using AsyncStorage
- **🚫 No Server Transmission**: Your API key never leaves your device
- **✅ Open Source Transparency**: All code is open for review

### Why BYOK?

1. **Maximum Privacy**: Your API usage and data stay between you and Google
2. **No Middleman**: Direct communication with Gemini API
3. **Cost Control**: You manage your own API usage and billing
4. **Trust**: No need to trust third-party servers with your keys

### For Deployment

When deploying SDSA:
- **Web/Vercel**: Users enter their own keys through the UI
- **App Stores**: Each user provides their own key on first launch
- **Enterprise**: Can pre-configure keys via MDM or environment variables

## Troubleshooting

### Gemini API Key Issues

If AI features are not working:

1. **Verify API key is set**:
   ```bash
   yarn verify  # Check if API key is configured
   ```

2. **Check environment file**:
   ```bash
   # Ensure .env.local exists and contains your key
   cat .env.local | grep GEMINI_API_KEY
   ```

3. **Restart Metro bundler**:
   ```bash
   # Clear cache and restart
   npx expo start -c
   ```

4. **API key limits**:
   - Free tier: 15 requests/minute, 1M tokens/month
   - If you hit limits, wait or upgrade your plan

### Metro bundler issues

```bash
npx expo start -c
```

### iOS build issues

Ensure you have the latest Xcode and iOS simulators installed.

### Android build issues

Ensure Android Studio and Android SDK are properly configured.

## License

MIT - see [LICENSE](LICENSE) file for details.

## Support

For questions or issues, please open an issue in this repository.
