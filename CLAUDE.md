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
    - Support markdown rendering
    - Code syntax highlighting

4. **Context-aware chat**
    - Appears after knowledge block journey
    - Has full context of user's selections
    - Powered by on-device model

### Not in MVP
- Voice input
- MCP integration
- Desktop app
- Cloud model integration
- User accounts/sync
- Analytics
- Multiple model selection

## Knowledge Block Structure

Knowledge blocks will live in the public repo with structure like:
```yaml
id: "e2e-testing"
title: "End-to-End Testing Setup"
initial_question: "Do you have an existing test system?"
paths:
  yes:
    question: "Which framework are you using?"
    options:
      - cypress
      - playwright
      - selenium
    next: "e2e-framework-specific"
  no:
    question: "What's your primary application type?"
    options:
      - web
      - mobile
      - desktop
    resources:
      - "getting-started-with-e2e.md"
context_variables:
  - has_test_system
  - framework_choice
  - app_type
```

## Development Phases

### Phase 1: Foundation (Current)
- [ ] Expo + Rock setup
- [ ] Basic navigation structure
- [ ] Knowledge block loader from GitHub
- [ ] Decision tree renderer

### Phase 2: Intelligence
- [ ] State management for user journey
- [ ] On-device model integration with Rock
- [ ] Context passing to chat
- [ ] Basic chat UI

### Phase 3: Polish
- [ ] UI/UX refinement
- [ ] Offline support
- [ ] Error handling
- [ ] Performance optimization

### Phase 4: Monetization (Post-MVP)
- [ ] RevenueCat integration
- [ ] Cloud model routing
- [ ] Firebase backend
- [ ] User accounts

## Key Implementation Notes

### Rock Setup
```typescript
import { LLM } from '@callstack/rock';

const model = new LLM({
  model: 'phi-3-mini.onnx', // or llama-3.2-1b.onnx
  maxTokens: 1024,
  temperature: 0.7
});

// Include user's journey context
const context = getUserJourneyContext(); // All selections from knowledge blocks
const response = await model.generate(`
  Context: User went through ${context.topic} setup.
  Their choices: ${JSON.stringify(context.selections)}
  
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

---
*Last Updated: September 2025*
*MVP Target: Functional prototype with knowledge block navigation and basic chat*
