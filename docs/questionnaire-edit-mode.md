# Questionnaire Edit Mode Implementation Plan

## Overview
Enable users to view and edit their questionnaire answers directly from the chat screen, making the questionnaire a living document that can be refined as users learn more about their needs.

## Core Features

### 1. Context Display in Chat
Show questionnaire answers in an accessible but non-intrusive way within the chat interface.

### 2. Two-Way Navigation
Allow seamless movement between questionnaire and chat while preserving state.

## Implementation Plan

### Phase 0: Code Refactoring & Testing Foundation
**Priority: Critical**  
**Status: Must complete first**

#### Rename Journey to Questionnaire
**Why:** "Journey" is vague and confusing. "Questionnaire" clearly describes the feature.

**Files to rename:**
- `src/store/journeyStore.ts` → `src/store/questionnaireStore.ts`
- Update all imports across the codebase

**Code changes:**
- `useJourneyStore` → `useQuestionnaireStore`
- Store properties:
  - `path` → `questionnaireHistory`
  - Keep `answers` as is (already clear)
  - Keep `context` as is (already clear)
- Navigation types:
  - `JourneyScreenNavigationProp` → `QuestionnaireScreenNavigationProp`
  - Update all usages in components

#### Jest Setup & Configuration
- Configure Jest for React Native with TypeScript
- Setup test environment for Expo
- Configure mocks for React Navigation, AsyncStorage, and Expo modules
- Add test scripts to package.json
- Ensure `yarn test` runs successfully with all tests passing

#### Test Coverage for Existing Business Logic

**Store Tests (`__tests__/store/`):**
- `journeyStore.test.ts`
  - Test answer addition/removal
  - Test context setting
  - Test state persistence
  - Test clear operations
  - Test answer updates

**Service Tests (`__tests__/services/`):**
- `questionnaireService.test.ts`
  - Test questionnaire fetching
  - Test category loading
  - Test error handling
  - Test caching behavior
  - Test fallback to mock data

- `geminiService.test.ts`
  - Test initialization
  - Test context building
  - Test chat session creation
  - Test error handling
  - Test API key validation

- `cacheService.test.ts`
  - Test cache set/get operations
  - Test cache expiration
  - Test clear operations
  - Test error handling

**Component Tests (`__tests__/components/`):**
- Test questionnaire flow completion
- Test answer validation
- Test navigation between questions
- Test back button behavior
- Test skip functionality for text questions

**Integration Tests:**
- Complete questionnaire flow
- Context persistence across app restarts
- Navigation state management
- Chat initialization with context

### Phase 1: Context Display Header
**Priority: High**

#### Components to Create:
- `src/components/Chat/ContextHeader.tsx`
  - Collapsible header showing current questionnaire context
  - Display questionnaire title and category
  - Show answer count (e.g., "5 answers provided")
  - Expand/collapse animation
  - When expanded, show all Q&A pairs in scrollable view

#### UI Design:
```
┌─────────────────────────────────────┐
│ 📋 E2E Testing Setup      [▼]      │
│ 5 context answers • Tap to edit     │
├─────────────────────────────────────┤
│ [Chat messages below...]            │
└─────────────────────────────────────┘

When expanded:
┌─────────────────────────────────────┐
│ 📋 E2E Testing Setup      [▲]      │
│                                     │
│ Q: Do you have existing tests?     │
│ A: Yes, using Jest                 │
│                                     │
│ Q: Which features do you need?     │
│ A: CI/CD Integration, Reporting    │
│                                     │
│ [Edit Answers] button               │
├─────────────────────────────────────┤
│ [Chat messages below...]            │
└─────────────────────────────────────┘
```

#### State Management:
- Add to `journeyStore.ts`:
  - `isContextExpanded: boolean`
  - `toggleContextExpanded()`

### Phase 2: Edit Navigation
**Priority: High**

#### Navigation Flow:
1. From Chat → Questionnaire (Edit Mode)
   - Pass `editMode: true` parameter
   - Pre-fill all previous answers
   - Show "Update Context" button instead of "Start Chat"
   - Preserve chat history in store

2. From Questionnaire → Chat (Resume)
   - If chat exists, show "Resume Chat" option
   - Update AI context with new answers
   - Show indicator: "Context updated ✓"

#### Required Changes:

**QuestionnaireScreen.tsx:**
```typescript
// Add route param handling
type QuestionnaireRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;
interface RouteParams {
  categoryPath: string;
  questionnaireId: string;
  editMode?: boolean;  // New parameter
}

// Load existing answers if in edit mode
useEffect(() => {
  if (route.params.editMode) {
    const existingAnswers = journeyStore.answers;
    // Pre-populate answers
    restoreAnswers(existingAnswers);
  }
}, []);

// Different completion behavior for edit mode
const handleCompletion = () => {
  if (editMode) {
    // Update context and return to chat
    navigation.navigate('Chat', { contextUpdated: true });
  } else {
    // Normal flow to new chat
    navigation.navigate('Chat');
  }
};
```

**ChatScreen.tsx:**
```typescript
// Handle context updates
useEffect(() => {
  if (route.params?.contextUpdated) {
    // Show toast/indicator
    showContextUpdateNotification();
    // Refresh AI context
    updateAIContext();
  }
}, [route.params]);
```

### Phase 3: Quick Edit Modal
**Priority: Medium**

#### Components to Create:
- `src/components/Chat/QuickEditModal.tsx`
  - Full-screen modal with all Q&A pairs
  - Inline editing for each answer
  - Save/Cancel buttons
  - Real-time validation

#### Features:
- Edit answers without leaving chat
- See immediate context changes
- Undo/redo capability
- Highlight changed answers

#### UI Design:
```
┌─────────────────────────────────────┐
│        Edit Context                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Do you have existing tests?     │ │
│ │ [Yes, using Jest        ] ✏️    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Which features do you need?     │ │
│ │ ☑ CI/CD Integration             │ │
│ │ ☐ Parallel Execution            │ │
│ │ ☑ Test Reporting                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]          [Save Changes]    │
└─────────────────────────────────────┘
```

### Phase 4: Context Persistence
**Priority: High**

#### Implementation:
- Save questionnaire state to AsyncStorage
- Key structure: `questionnaire_${categoryPath}_${questionnaireId}`
- Store:
  - All answers
  - Current question index
  - Completion status
  - Last modified timestamp

#### Auto-save triggers:
- After each answer
- On app background
- Before navigation

### Phase 5: AI Context Refresh
**Priority: High**

#### When context changes:
1. Clear previous chat context in Gemini service
2. Re-initialize with updated answers
3. Optional: Generate transition message
   - "I see you've updated your context. Based on your new answers..."

#### Implementation in geminiService.ts:

```typescript
async refreshContext(newContext: QuestionnaireContext) {
  // Clear existing chat history
  this.chatSession = null;
  
  // Re-initialize with new context
  await this.initializeChat(newContext);
  
  // Return confirmation
  return {
    success: true,
    message: "Context updated successfully"
  };
}
```

## Technical Considerations

### State Management
- Zustand store updates:
  - Add `editMode` flag
  - Add `previousAnswers` for comparison
  - Add `hasActiveChat` boolean
  - Add `contextVersion` counter

### Navigation
- Update navigation types for edit mode params
- Add deep linking support for resuming sessions
- Handle back button properly in edit mode

### Performance
- Lazy load edit components
- Debounce answer saves
- Cache questionnaire data locally
- Minimize re-renders during edits

## Testing Plan

### User Flows to Test:
1. Complete questionnaire → Start chat → Edit answers → Resume chat
2. Start questionnaire → Partially complete → Navigate away → Resume
3. Edit answers multiple times → Verify context updates
4. Quick edit in modal → Cancel → Verify no changes
5. Quick edit in modal → Save → Verify context refresh

### Edge Cases:
- Network failure during save
- Large questionnaires (20+ questions)
- Rapid navigation between screens
- App killed during questionnaire

## Success Metrics
- Users can edit answers within 2 taps from chat
- Context updates reflected in <1 second
- Zero data loss on navigation
- 90% of users understand edit capability

## Implementation Order
1. Phase 0: Code Refactoring & Testing Foundation
   - Rename Journey to Questionnaire throughout codebase
   - Set up Jest and test existing business logic
   - Ensure all tests pass with `yarn test`
2. Phase 1: Context Display Header - Show answers in chat
3. Phase 2: Edit Navigation - Two-way navigation flow
4. Phase 3: Quick Edit Modal - Inline editing capability
5. Phase 4: Context Persistence - Save/restore state
6. Phase 5: AI Context Refresh - Update Gemini context

**Requirements:**
- All phases must have full test coverage
- `yarn test` must pass with all tests green
- Each feature must have unit and integration tests
- Tests must be written before or alongside implementation (TDD encouraged)

## Future Enhancements
- Version history for answer sets
- A/B comparison of different answer combinations
- Suggested answer improvements based on chat
- Export/import answer sets
- Templates for common scenarios