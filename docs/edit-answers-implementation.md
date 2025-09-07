# Edit Answers Implementation

## Overview

The Edit Answers feature allows users to modify their questionnaire responses after completion. Users can navigate from the Chat screen back to a questionnaire to update their answers, which then refreshes the AI context for more relevant assistance.

## Current Issue

When users click "Edit Answers" from the chat context header, they are taken to the questionnaire but immediately see the completion summary instead of being able to edit their answers. This happens because:

1. The `journey` array is incorrectly populated with question keys instead of answer values
2. The screen detects all questions as answered and jumps to completion
3. There's no mechanism to navigate through previously answered questions in edit mode

## Solution Architecture

### Data Flow

```
Chat Screen → Context Header → Edit Button
                ↓
    Navigate to Questionnaire with:
    - categoryPath: string
    - questionnaireId: string  
    - editMode: true
                ↓
    Questionnaire Screen (Edit Mode)
    - Loads questionnaire
    - Restores previous answers
    - Allows navigation through questions
    - Pre-fills previous responses
                ↓
    User Updates Answers → Save State
                ↓
    Return to Chat → Context Refreshed
```

### Key Components

#### 1. QuestionnaireScreen.tsx
- **Edit Mode Detection**: Reads `editMode` from navigation params
- **Answer Restoration**: Maps stored answers to questionnaire questions
- **Journey Management**: Maintains array of answer values (not keys)
- **Navigation Logic**: Allows forward/backward navigation through all questions

#### 2. ContextHeader.tsx  
- **Edit Trigger**: Navigates to questionnaire with correct params
- **Context Display**: Shows current answers in collapsible view
- **State Connection**: Reads from questionnaireStore

#### 3. questionnaireStore.ts
- **Answer Storage**: Persists answers keyed by question label
- **Context Tracking**: Maintains category and questionnaire IDs
- **State Persistence**: Saves/loads from AsyncStorage

## Implementation Details

### Journey Restoration Logic

```typescript
// CORRECT: Map questions to their answers
const restoredJourney = questionnaire.questions.map(q => 
  existingAnswers[q.label] || ''
);

// INCORRECT (current bug): Using question keys
const restoredJourney = Object.keys(existingAnswers);
```

### Pre-filling Answers

For text inputs:
```typescript
const previousAnswer = isEditMode && journey[currentQuestionIndex] 
  ? journey[currentQuestionIndex] 
  : '';
setTextInputValue(previousAnswer);
```

For radio/checkbox:
- Highlight previously selected option
- Allow changing selection
- Update journey array on change

### Edit Mode UI Indicators

1. **Header Badge**: Show "Edit Mode" indicator
2. **Progress Bar**: Different color in edit mode
3. **Navigation**: Always show back button
4. **Completion**: Different message for updates vs first completion

## Testing Scenarios

### Unit Tests
1. **Journey restoration** - Verify answers map correctly to questions
2. **Navigation** - Test forward/back with answer preservation  
3. **Pre-filling** - Ensure previous answers appear correctly
4. **State updates** - Verify store updates on answer changes

### Integration Tests
1. **Full edit flow** - Navigate from chat → edit → return
2. **Context refresh** - Verify AI context updates after edit
3. **Persistence** - Ensure edits survive app restart
4. **Edge cases** - Handle missing questions, new questions added

### Manual Testing Checklist
- [ ] Click "Edit Answers" from chat context header
- [ ] Verify questionnaire loads with first question (not summary)
- [ ] Check previous answer is pre-filled
- [ ] Navigate forward - see all previous answers
- [ ] Navigate backward - maintain edits
- [ ] Change an answer and continue
- [ ] Complete edit flow and return to chat
- [ ] Verify context header shows updated answers
- [ ] Restart app and verify edits persisted

## Alternative Approaches Considered

### 1. Summary View with Edit Buttons
Show all questions/answers at once with individual edit buttons. 
- **Pros**: See all context at once
- **Cons**: Complex UI, doesn't match original flow

### 2. Inline Editing in Context Header
Allow editing directly in the collapsed context view.
- **Pros**: Quick edits without navigation
- **Cons**: Limited space, poor mobile UX

### 3. Modal Edit Dialog
Pop up a modal with editable fields.
- **Pros**: No navigation needed
- **Cons**: Breaks from questionnaire flow pattern

## Future Enhancements

1. **Selective Editing**: Jump directly to specific question
2. **Change Tracking**: Highlight which answers were modified
3. **Undo/Redo**: Allow reverting changes before saving
4. **Validation**: Ensure required questions remain answered
5. **Diff View**: Show before/after for complex questionnaires

## Migration Notes

When implementing this fix:
1. No data migration needed - existing answers remain compatible
2. Update tests to expect new behavior
3. Consider backward compatibility for navigation params
4. Document the fix in release notes

## References

- [Original questionnaire implementation](../src/screens/QuestionnaireScreen.tsx)
- [Context header component](../src/components/Chat/ContextHeader.tsx)
- [Store implementation](../src/store/questionnaireStore.ts)
- [Navigation types](../src/types/navigation.ts)