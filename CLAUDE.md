# CLAUDE.md - SDSA (Software Development Smart Assist)

## Project Overview

SDSA is a mobile application that provides guided learning journeys for software developers through interactive knowledge blocks. Unlike traditional coding assistants, SDSA walks users through structured decision trees to understand their specific context before providing personalized assistance.

**Core Flow:**

1. User selects a learning topic (e.g., "E2E Testing")
2. Interactive questionnaire builds context through decision trees
3. Progressive refinement based on user's specific situation
4. Relevant resources surface based on the path taken
5. Contextualized chat with full journey awareness

## Repository Structure

- **This repo (private):** `https://github.com/eugene-taran/sdsa` - Application source code
- **Knowledge repo (public):** `https://github.com/eugene-taran/sdsa.team` - Knowledge blocks and learning paths
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

- **Free tier:** On-device inference using Rock
  - Primary model: Phi-3-mini or Llama 3.2 1B
  - Runs completely offline
  - Privacy-preserving
- **Paid tier (future):** Cloud models (Claude, GPT-4, etc.)
  - Implementation deferred post-MVP

## MVP Scope

### Must Have

1. **Knowledge block browser/navigator**
   - Load knowledge blocks from public repo
   - Render decision trees and paths
   - Track user's journey through blocks

2. **Interactive questionnaire system**
   - Dynamic questions based on previous answers
   - State management for user's path
   - Progress indication

3. **Contextual resource display**
   - Show relevant resources based on path
   - Resources accumulate as user progresses through tree
   - Support markdown rendering with author attribution
   - Code syntax highlighting
   - Resources loaded from same sources as knowledge blocks

4. **Context-aware chat**
   - Appears after knowledge block journey
   - Has full context of user's selections and resources shown
   - AI knows which resources user has access to
   - Can reference specific guides in responses
   - Powered by on-device model

### Not in MVP

- Voice input
- MCP integration (will be desktop-only feature later)
- Desktop app
- Cloud model integration (deferred to paid tier)
- User accounts/sync
- Analytics
- Multiple model selection

### Key User Requirements

- **No depth limitations:** Knowledge blocks can go as deep as needed
- **Backtracking:** Users can go back and change previous answers
- **Block linking:** Future feature to merge multiple blocks into same context
- **Model download:** Download on first launch, not bundled with app
- **Offline caching:** Cache all knowledge blocks and resources locally
- **Session persistence:** Remember user's journey between app sessions
- **Community contributions:** Direct PRs to public knowledge repo with author attribution
- **No content gating:** All knowledge blocks available to free tier
- **Free tier:** Full functionality with on-device models
- **Paid tier:** Better model quality (Claude Opus, GPT-4) for premium advice

## Knowledge Block Structure

Knowledge blocks will live in the public repo with structure like:

```yaml
id: 'e2e-testing'
title: 'End-to-End Testing Setup'
initial_question: 'Do you have an existing test system?'
paths:
  yes:
    question: 'Which framework are you using?'
    options:
      - cypress
      - playwright
      - selenium
    resources:
      - 'framework-comparison.md'
    next: 'e2e-framework-specific'
  no:
    question: "What's your primary application type?"
    options:
      - web
      - mobile
      - desktop
    resources:
      - 'getting-started-with-e2e.md'
context_variables:
  - has_test_system
  - framework_choice
  - app_type
metadata:
  author: 'eugene-taran'  # GitHub username from authors.json
  version: '1.0.0'
  created: '2024-12-15'
```

Resources are markdown files stored in `knowledge/resources/` that provide detailed guides. They accumulate as users traverse the decision tree and are available in the chat context.

## Implementation Plan

### Phase 1: Project Setup & Foundation

1. **Initialize Expo with TypeScript**
   - Create new Expo project with TypeScript template
   - Configure for development builds (not Expo Go)
   - Set up EAS Build configuration

2. **Install Core Dependencies**
   - React Navigation for screen navigation
   - React Native YAML for parsing knowledge blocks
   - React Native Markdown Display for rendering resources
   - Zustand for state management (lightweight alternative to Redux)
   - React Native Async Storage for persistence

3. **Setup Rock for On-Device AI**
   - Install @callstack/rock package
   - Configure model download manager
   - Set up model storage directory

### Phase 2: Core Features Implementation

4. **Create Navigation Structure**
   - Home screen (topic selector)
   - Knowledge block journey screen
   - Resource viewer screen
   - Chat screen (context-aware)

5. **Implement Knowledge Block System**
   - Knowledge block fetcher from GitHub
   - YAML parser for block structure
   - Decision tree renderer component
   - Journey state manager (track user's path)
   - Backtrack functionality

6. **Build Interactive Questionnaire**
   - Dynamic question components
   - Answer selection UI
   - Progress indicator
   - Context accumulator

7. **Create Resource Display**
   - Markdown renderer with syntax highlighting
   - Code block component
   - Resource caching for offline use
   - Author attribution display from authors.json
   - Resource accumulation from journey path

8. **Integrate Rock AI**
   - Model download on first launch
   - Model initialization service
   - Context-aware prompt builder
   - Chat interface with journey context

### Phase 3: Data & Persistence

9. **Implement Caching**
   - Cache knowledge blocks locally
   - Cache resources for offline access
   - Persist user journey between sessions

10. **State Management**
    - User journey state
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
│   │   ├── HomeScreen.tsx         # Topic selection
│   │   ├── JourneyScreen.tsx      # Knowledge block journey
│   │   ├── ResourceScreen.tsx     # Resource viewer
│   │   └── ChatScreen.tsx         # Context-aware chat
│   ├── components/
│   │   ├── KnowledgeBlock/
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── AnswerOptions.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── ResourceViewer/
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── CodeBlock.tsx
│   │   └── Chat/
│   │       ├── MessageList.tsx
│   │       └── InputBar.tsx
│   ├── services/
│   │   ├── knowledgeService.ts    # Fetch from GitHub
│   │   ├── modelService.ts        # Rock AI management
│   │   ├── cacheService.ts        # Offline storage
│   │   └── journeyService.ts      # Journey state management
│   ├── store/
│   │   ├── journeyStore.ts        # Zustand store for journey
│   │   └── appStore.ts           # General app state
│   ├── types/
│   │   ├── knowledge.ts           # Knowledge block types
│   │   └── journey.ts            # Journey state types
│   └── utils/
│       ├── yamlParser.ts
│       └── contextBuilder.ts     # Build context for AI
├── assets/
│   ├── fonts/
│   └── images/
└── models/                       # Downloaded AI models (gitignored)
```

## Key Implementation Notes

### Rock Setup

```typescript
import { LLM } from '@callstack/rock';

const model = new LLM({
  model: 'phi-3-mini.onnx', // or llama-3.2-1b.onnx
  maxTokens: 1024,
  temperature: 0.7,
});

// Include user's journey context with resources
const context = getUserJourneyContext(); // All selections from knowledge blocks
const resources = getAccumulatedResources(); // Resources shown during journey
const response = await model.generate(`
  Context: User went through ${context.topic} setup.
  Their choices: ${JSON.stringify(context.selections)}
  Resources provided: ${resources.map(r => r.title).join(', ')}
  
  User question: ${userInput}
`);
```

### Knowledge Block Fetching

```typescript
// Fetch from public repo
const KNOWLEDGE_BASE_URL = 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main';

async function fetchKnowledgeBlock(blockId: string) {
  const response = await fetch(`${KNOWLEDGE_BASE_URL}/blocks/${blockId}.yaml`);
  return parseYAML(await response.text());
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

2. **Why knowledge blocks before chat:**
   - Builds context progressively
   - More valuable than generic Q&A
   - Guides users to relevant solutions
   - Chat becomes personalized to their specific situation

3. **Why public knowledge repo:**
   - Community can contribute learning paths
   - Transparent learning content
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

## Current Focus

**BUILD THE KNOWLEDGE BLOCK NAVIGATION FIRST**
The chat is secondary. The value is in the guided journey through knowledge blocks that builds context. Focus on:

1. Loading and parsing knowledge blocks
2. Rendering decision trees
3. Tracking user path
4. Showing relevant resources

Chat integration comes after the journey system works.

## Future Expansion (Not MVP)

- Desktop app with MCP integration for development tools
- Voice input for hands-free operation
- Multiple AI model selection
- Collaborative features
- Integration with development tools
- Advanced analytics on learning paths

## Current Implementation Status

### ✅ Completed - Phase 1 & 2

- Expo project initialized with TypeScript
- Multi-platform support (iOS/Android/Web)
- Navigation setup with React Navigation
- Core dependencies installed
- Complete project folder structure created
- All main screens implemented:
  - HomeScreen - Topic selection
  - JourneyScreen - Interactive questionnaire with completion flow
  - ResourceScreen - Markdown resource viewer
  - ChatScreen - Context-aware AI chat
- Services implemented:
  - KnowledgeService - Fetches blocks from GitHub with mock fallback
  - ModelService - Mock AI service ready for Rock integration
  - CacheService - Complete offline caching with AsyncStorage
- State management with Zustand
- Journey persistence and context tracking
- EAS Build configuration
- Comprehensive README with setup instructions

### 🚧 Waiting for External Dependencies

- **Rock Integration**: Package not yet publicly available from CallStack
- **Knowledge Repository**: ✅ Initial content now available at github.com/eugene-taran/sdsa.team with release system

### 📝 Next Steps for Production

1. Replace mock ModelService with actual Rock implementation when available
2. Create content in the public knowledge repository
3. Test on physical devices with development builds
4. Implement model download manager
5. Add error handling and recovery flows
6. UI/UX polish and animations

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

_Last Updated: December 15, 2024_
_MVP Target: Functional prototype with knowledge block navigation and basic chat_
_Knowledge Repository: Active at github.com/eugene-taran/sdsa.team with automated releases_
