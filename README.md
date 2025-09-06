# SDSA - Software Development Smart Assist

A mobile application that provides guided learning journeys for software developers through interactive questionnaires and on-device AI assistance.

## Overview

SDSA uses context-gathering questionnaires organized in categories to understand users' specific situations before providing personalized AI-powered recommendations. Unlike traditional coding assistants, it builds context through targeted questions before offering guidance.

## Features

- 🚀 **Interactive Questionnaires**: Answer targeted questions to build context
- 🤖 **On-Device AI**: Privacy-preserving assistance with offline capabilities
- 📚 **Community-Driven Content**: Open-source questionnaire repository
- 💬 **Contextual Chat**: AI chat that understands your entire learning journey
- 🔒 **Privacy-First**: Free tier runs entirely on-device

## Getting Started

### Prerequisites

- Node.js 20.x (auto-installed via nvm/fnm/asdf)
- Yarn 1.22+ package manager
- iOS Simulator (Mac only) or Android Studio for mobile testing

### Quick Start

```bash
# Clone repository
git clone https://github.com/eugene-taran/sdsa
cd sdsa

# Install correct Node version (if using nvm)
nvm install
nvm use

# Install Yarn (if not installed)
npm install -g yarn

# Install dependencies
yarn install

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

We welcome contributions! The questionnaires are open source and live at:

- Repository: https://github.com/eugene-taran/sdsa.team
- Domain: https://sdsa.team

To contribute questionnaires:

1. Fork the sdsa.team repository
2. Add your questionnaire in JSON format to the appropriate category
3. Submit a PR with your contribution

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

## Troubleshooting

### Metro bundler issues

```bash
npx expo start -c
```

### iOS build issues

Ensure you have the latest Xcode and iOS simulators installed.

### Android build issues

Ensure Android Studio and Android SDK are properly configured.

## License

Private repository - see LICENSE file for details.

## Support

For questions or issues, please open an issue in this repository.
