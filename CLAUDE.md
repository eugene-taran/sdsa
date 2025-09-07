# CLAUDE.md - SDSA (Software Development Smart Assist)

## Project Overview

SDSA is a cross-platform application (iOS, Android, Web) that provides guided learning journeys for software developers through interactive questionnaires organized in categories. Built with React Native for multi-platform support from a single codebase. Unlike traditional coding assistants, SDSA uses context-gathering questionnaires to understand users' specific situations before providing personalized AI-powered recommendations.

**Core Flow:**

1. User browses categories and selects a questionnaire (e.g., "E2E Testing")
2. Interactive questionnaire gathers context through targeted questions
3. User answers are collected to build understanding of their needs
4. Answers are processed by LLM to generate personalized recommendations
5. Context-aware chat provides tailored guidance based on questionnaire responses

## Repository Structure

- **This repo (private):** `https://github.com/eugene-taran/sdsa` - Application source code
- **Contexts repo (public):** `https://github.com/eugene-taran/sdsa.team` - Questionnaires and categories
- **Domain:** `sdsa.team`

## Technical Stack

### Core Technologies

- **Framework:** React Native with TypeScript
- **Platform:** Expo (with development builds, not Expo Go)
- **On-device AI:** Rock (CallStack's React Native AI inference)
- **Backend:** Firebase (auth, user data, subscription status)
- **Payments:** RevenueCat (subscription management)
- **Analytics:** None for MVP

### Model Strategy

- **Free tier:** Google Gemini models
  - Joke generation: Gemini 2.5 Flash Image Preview (quick, lightweight)
  - Main chat: Gemini Flash 2.5 (fast, capable)
  - API-based implementation for MVP
- **Future considerations:**
  - On-device inference using Rock (when available)
  - Paid tier with premium models (Claude Opus, GPT-4)

## MVP Scope

### Must Have

1. **Category browser and questionnaire navigator**
   - Load categories and questionnaires from public repo
   - Display questionnaires organized by categories
   - Track user's answers through questionnaires

2. **Interactive questionnaire system**
   - Support for multiple question types (text, textarea, radio, checkbox)
   - State management for user's answers
   - Progress indication through questionnaire

3. **LLM-powered recommendations**
   - Process questionnaire answers through configured LLM
   - Generate personalized recommendations based on context
   - Support for customizable system prompts per questionnaire
   - Configurable temperature and token limits

4. **Context-aware chat**
   - Appears after questionnaire completion
   - Starts with a personalized joke about the topic (Gemini 2.5 Flash Image Preview)
   - Main conversation powered by Gemini Flash 2.5
   - Has full context of user's questionnaire answers
   - AI provides guidance based on collected context
   - Can continue conversation with awareness of initial responses

### Not in MVP

- Voice input
- MCP integration (will be desktop-only feature later)
- Desktop app
- User accounts/sync
- Analytics
- Multiple model selection

### Key User Requirements

- **Flexible question types:** Support for text, textarea, radio, and checkbox inputs
- **Answer revision:** Users can go back and change previous answers
- **Category organization:** Questionnaires grouped into logical categories
- **Model download:** Download on first launch, not bundled with app
- **Offline caching:** Cache all questionnaires and categories locally
- **Session persistence:** Remember user's journey between app sessions
- **Community contributions:** Direct PRs to public contexts repo with author attribution
- **No content gating:** All questionnaires available to free tier
- **Free tier:** Full functionality with on-device models
- **Paid tier:** Better model quality (Claude Opus, GPT-4) for premium advice

## Questionnaire Structure

Questionnaires are JSON files organized in categories within the public repo:

```json
{
  "id": "e2e-testing",
  "title": "E2E Testing Setup",
  "description": "Help configure end-to-end testing for your project",
  "questions": [
    {
      "type": "radio",
      "label": "Do you have an existing test system?",
      "options": [
        { "value": "yes", "label": "Yes, I have a test system" },
        { "value": "no", "label": "No, starting from scratch" }
      ]
    },
    {
      "type": "checkbox",
      "label": "Which features do you need?",
      "options": [
        { "value": "ci_integration", "label": "CI/CD Integration" },
        { "value": "parallel", "label": "Parallel Execution" },
        { "value": "reporting", "label": "Test Reporting" }
      ]
    },
    {
      "type": "text",
      "label": "What is your primary testing goal?",
      "placeholder": "e.g., regression testing, user journey validation..."
    }
  ],
  "llmConfig": {
    "systemPrompt": "You are an expert in E2E testing. Based on the user's answers, provide specific recommendations.",
    "temperature": 0.7,
    "maxTokens": 1500
  },
  "metadata": {
    "author": "eugene-taran"
  }
}
```

Categories are defined in `contexts/categories.json` with metadata like name, description, icon, and display order.

## Implementation Plan

### Phase 1: Project Setup & Foundation

1. **Initialize Expo with TypeScript**
   - Create new Expo project with TypeScript template
   - Configure for development builds (not Expo Go)
   - Set up EAS Build configuration

2. **Install Core Dependencies**
   - React Navigation for screen navigation
   - JSON parsing (built-in) for questionnaires
   - React Native Markdown Display for rendering responses
   - Zustand for state management (lightweight alternative to Redux)
   - React Native Async Storage for persistence

3. **Setup Rock for On-Device AI**
   - Install @callstack/rock package
   - Configure model download manager
   - Set up model storage directory

### Phase 2: Core Features Implementation

4. **Create Navigation Structure**
   - Home screen (category browser)
   - Questionnaire screen (question flow)
   - Results screen (LLM recommendations)
   - Chat screen (context-aware)

5. **Implement Questionnaire System**
   - Questionnaire fetcher from GitHub
   - JSON parser for questionnaire structure
   - Question renderer components (text, radio, checkbox, textarea)
   - Answer state manager
   - Navigation between questions

6. **Build Interactive Questionnaire**
   - Question type components (text, textarea, radio, checkbox)
   - Answer collection UI
   - Progress indicator
   - Answer validation and storage

7. **Create Results Display**
   - Markdown renderer for LLM responses
   - Code block component for recommendations
   - Response caching for offline use
   - Author attribution display
   - Context summary from questionnaire

8. **Integrate Rock AI**
   - Model download on first launch
   - Model initialization service
   - Prompt builder using questionnaire answers
   - Chat interface with questionnaire context

### Phase 3: Data & Persistence

9. **Implement Caching**
   - Cache questionnaires and categories locally
   - Cache LLM responses for offline access
   - Persist questionnaire answers between sessions

10. **State Management**
    - Questionnaire answer state
    - Downloaded models state
    - Cached content management

### Phase 4: Polish & MVP Release

- [ ] UI/UX refinement
- [ ] Offline support verification
- [ ] Error handling
- [ ] Performance optimization
- [ ] App Store preparation

### Phase 5: Monetization (Post-MVP)

- [ ] RevenueCat integration
- [ ] Cloud model routing (Claude, GPT-4)
- [ ] Firebase backend
- [ ] User accounts and sync

## Project Structure

```
sdsa/
├── app.json                 # Expo configuration
├── eas.json                # EAS Build configuration
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js         # For Rock native modules
├── App.tsx                 # App entry point
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx         # Category browser
│   │   ├── QuestionnaireScreen.tsx # Questionnaire flow
│   │   ├── ResultsScreen.tsx      # LLM recommendations
│   │   └── ChatScreen.tsx         # Context-aware chat
│   ├── components/
│   │   ├── Questionnaire/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerInput.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── ResultsViewer/
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── CodeBlock.tsx
│   │   └── Chat/
│   │       ├── MessageList.tsx
│   │       └── InputBar.tsx
│   ├── services/
│   │   ├── questionnaireService.ts # Fetch from GitHub
│   │   ├── modelService.ts        # Rock AI management
│   │   ├── cacheService.ts        # Offline storage
│   │   └── answerService.ts       # Answer state management
│   ├── store/
│   │   ├── questionnaireStore.ts  # Zustand store for questionnaire
│   │   └── appStore.ts           # General app state
│   ├── types/
│   │   ├── questionnaire.ts       # Questionnaire types
│   │   └── answer.ts              # Answer state types
│   └── utils/
│       ├── jsonParser.ts
│       └── contextBuilder.ts     # Build context for AI
├── assets/
│   ├── fonts/
│   └── images/
└── models/                       # Downloaded AI models (gitignored)
```

## Key Implementation Notes

### Gemini Integration

```typescript
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini clients
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const imageModel = 'gemini-2.5-flash-image-preview';  // For image generation
const chatModel = 'gemini-2.5-flash';  // For chat/text generation

// Generate initial joke after questionnaire completion
async function generateWelcomeJoke(topic: string): Promise<string> {
  const prompt = `Create an image with a joke about learning ${topic}.`;
  
  const result = await genAI.models.generateContent({
    model: imageModel,
    contents: prompt,
  });
  return result.text;
}

// Main chat with Gemini Flash 2.5
async function chatWithGemini(userInput: string, context: any): Promise<string> {
  const answers = getQuestionnaireAnswers();
  const questionnaire = getCurrentQuestionnaire();
  
  const prompt = `
    ${questionnaire.llmConfig.systemPrompt}
    
    User completed the ${questionnaire.title} questionnaire.
    Their answers: ${JSON.stringify(answers)}
    
    User question: ${userInput}
  `;
  
  const result = await flashModel.generateContent(prompt);
  return result.response.text();
}
```

### Questionnaire Fetching

```typescript
// Fetch from public repo
const CONTEXTS_BASE_URL = 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main';

async function fetchQuestionnaire(category: string, questionnaireId: string) {
  const response = await fetch(`${CONTEXTS_BASE_URL}/contexts/categories/${category}/${questionnaireId}.json`);
  return JSON.parse(await response.text());
}

async function fetchCategories() {
  const response = await fetch(`${CONTEXTS_BASE_URL}/contexts/categories.json`);
  return JSON.parse(await response.text());
}
```

### Development Build Setup

Since Rock requires native modules:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure Expo development build
eas build:configure

# Create development build
eas build --platform ios --profile development
eas build --platform android --profile development
```

## Architecture Decisions

1. **Why Rock over alternatives:**
   - Simplified API for on-device inference
   - Handles memory management automatically
   - Supports multiple model formats
   - Maintained by CallStack (React Native experts)

2. **Why questionnaires before chat:**
   - Gathers structured context efficiently
   - More valuable than generic Q&A
   - Enables LLM to provide targeted recommendations
   - Chat becomes personalized to user's specific situation

3. **Why public contexts repo:**
   - Community can contribute questionnaires
   - Transparent context-gathering approach
   - Builds trust and community
   - Separates content from application logic

## Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/eugene-taran/sdsa
cd sdsa
npm install

# Start Expo development
npx expo start

# Build development client (required for Rock)
eas build --profile development --platform ios
eas build --profile development --platform android

# Run on device with development build
npx expo start --dev-client
```

## Development Guidelines

### Code Quality Requirements

**ALWAYS run ALL three checks before finishing any work:**
1. `yarn lint` - Check for ESLint issues (must have no errors)
2. `yarn build` or `npx tsc --noEmit` - Verify TypeScript compilation (must pass)
3. `yarn test` - Run all tests and ensure they pass (all tests must be green)

**IMPORTANT:** These checks must ALL pass before considering any task complete. Never skip any of these checks. If tests are failing, fix them before completing work.

## Current Focus

**BUILD THE QUESTIONNAIRE SYSTEM FIRST**
The chat is secondary. The value is in the structured context gathering through questionnaires. Focus on:

1. Loading categories and questionnaires
2. Rendering different question types
3. Collecting and storing answers
4. Processing answers through LLM for recommendations

Chat integration comes after the questionnaire system works.

## Future Expansion (Not MVP)

- Desktop app with MCP integration for development tools
- Voice input for hands-free operation
- Multiple AI model selection
- Collaborative features
- Integration with development tools
- Advanced analytics on questionnaire responses

## Current Implementation Status

### ✅ Completed - Phase 1 & 2

- Expo project initialized with TypeScript
- Multi-platform support (iOS/Android/Web)
- Navigation setup with React Navigation
- Core dependencies installed
- Complete project folder structure created
- All main screens implemented:
  - HomeScreen - Category and questionnaire selection
  - QuestionnaireScreen - Interactive questionnaire with completion flow
  - ResultsScreen - LLM-generated recommendations
  - ChatScreen - Context-aware AI chat
- Services implemented:
  - QuestionnaireService - Fetches questionnaires from GitHub with mock fallback
  - ModelService - Mock AI service ready for Rock integration
  - CacheService - Complete offline caching with AsyncStorage
- State management with Zustand
- Answer persistence and context tracking
- EAS Build configuration
- Comprehensive README with setup instructions

### 🚧 Current Implementation Status

- **Gemini Integration**: Ready to implement with Google AI SDK
- **Contexts Repository**: ✅ Questionnaires and categories available at github.com/eugene-taran/sdsa.team with automated release system
- **Rock Integration**: Deferred (package not yet publicly available from CallStack)

### 📝 Next Steps for Production

1. Implement Gemini API integration (Flash Image Preview for jokes, Flash 2.5 for chat)
2. Add API key management and environment configuration
3. Create questionnaires in the public contexts repository
4. Test on physical devices with development builds
5. Add error handling and recovery flows
6. UI/UX polish and animations
7. Consider Rock integration when package becomes available

## Running the Project

### Prerequisites-free Setup

The project is designed to work on clean CI environments without any global dependencies:

- **Node Version**: Managed via `.nvmrc` and `.node-version`
- **Package Manager**: Yarn for consistent dependency management
- **Scripts**: All commands work without global tool requirements

### Quick Start

```bash
# Verify setup
yarn verify

# Install dependencies (CI-compatible)
yarn install --frozen-lockfile

# Start development
yarn start
```

### Platform Requirements

- **iOS Development**: macOS with Xcode (for simulator)
- **Android Development**: Android Studio with emulator
- **Web Development**: Any OS with modern browser
- **Device Testing**: Expo Go app on iOS/Android device

### Available Scripts

- `yarn install:ci` - CI-compatible installation (frozen lockfile)
- `yarn install:dev` - Development installation
- `yarn verify` - Verify environment setup
- `yarn type-check` - TypeScript validation
- `yarn clean` - Remove all generated files

---

_MVP Target: Functional prototype with questionnaire system and context-aware chat_
_Contexts Repository: Active at github.com/eugene-taran/sdsa.team with automated releases_
