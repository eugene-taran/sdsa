# Chat History Persistence Plan

## Overview

Implement chat history persistence to maintain conversation context when navigating between screens. Start with an in-memory solution for MVP, designed to easily transition to backend storage later.

## Problem Statement

Currently, chat history is lost when:
1. Completing a questionnaire and returning to chat
2. Navigating back from chat to categories
3. Editing answers and returning to chat
4. Any navigation away from the ChatScreen

## Solution Architecture

### Phase 1: In-Memory Storage (Current Implementation)

```
┌─────────────────┐
│   ChatScreen    │
│                 │
│  - messages[]   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ChatHistoryStore│
│   (Zustand)     │
│                 │
│ - conversations │
│ - activeChat    │
│ - methods       │
└─────────────────┘
```

### Phase 2: Backend Storage (Future)

```
┌─────────────────┐
│   ChatScreen    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ChatHistoryStore│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ChatService    │
│  (API Layer)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Firebase     │
│   Firestore     │
└─────────────────┘
```

## Implementation Plan

### 1. Create Chat History Store

**File:** `src/store/chatHistoryStore.ts`

```typescript
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

interface Conversation {
  id: string;
  questionnaireId: string;
  categoryPath: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryStore {
  // State
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  
  // Actions
  addMessage: (message: Message) => void;
  getConversation: (questionnaireId: string, categoryPath: string) => Conversation | null;
  createConversation: (questionnaireId: string, categoryPath: string) => string;
  clearConversation: (conversationId: string) => void;
  persistToStorage: () => Promise<void>; // For future backend
  loadFromStorage: () => Promise<void>; // For future backend
}
```

### 2. Modify ChatScreen

**Changes needed:**
1. Load existing conversation on mount
2. Save messages to store on each interaction
3. Restore scroll position
4. Handle context updates without losing history

```typescript
// ChatScreen.tsx
useEffect(() => {
  // Load existing conversation if available
  const conversation = chatHistoryStore.getConversation(
    context.questionnaireId,
    context.category
  );
  
  if (conversation) {
    setMessages(conversation.messages);
  } else {
    // Initialize with welcome message
    initializeChat();
  }
}, [context.questionnaireId, context.category]);

// Save each new message
const sendMessage = async () => {
  // ... existing logic
  chatHistoryStore.addMessage(userMessage);
  chatHistoryStore.addMessage(aiMessage);
};
```

### 3. Storage Strategy

#### In-Memory (Phase 1)
- Use Zustand store with Map for O(1) lookup
- Key conversations by `${categoryPath}_${questionnaireId}`
- Limit stored messages per conversation (e.g., last 100)
- Clear on app restart (acceptable for MVP)

#### Persistent Storage (Phase 2)
- AsyncStorage for offline capability
- Firebase Firestore for cloud sync
- Implement pagination for large histories
- Add user authentication

### 4. Migration Path to Backend

```typescript
// Abstract storage interface
interface ChatStorageAdapter {
  save(conversation: Conversation): Promise<void>;
  load(conversationId: string): Promise<Conversation | null>;
  delete(conversationId: string): Promise<void>;
  list(): Promise<Conversation[]>;
}

// Implementations
class InMemoryAdapter implements ChatStorageAdapter { /* ... */ }
class AsyncStorageAdapter implements ChatStorageAdapter { /* ... */ }
class FirebaseAdapter implements ChatStorageAdapter { /* ... */ }

// Store uses adapter
class ChatHistoryStore {
  private adapter: ChatStorageAdapter;
  
  constructor(adapter: ChatStorageAdapter = new InMemoryAdapter()) {
    this.adapter = adapter;
  }
}
```

## Implementation Steps

### Step 1: Create Basic Store (30 min)
1. Create `chatHistoryStore.ts` with Zustand
2. Implement basic CRUD operations
3. Add conversation management

### Step 2: Integrate with ChatScreen (45 min)
1. Import and use store in ChatScreen
2. Load existing conversation on mount
3. Save messages as they're created
4. Handle navigation without data loss

### Step 3: Handle Edge Cases (30 min)
1. Context updates (questionnaire edits)
2. Multiple questionnaires in same category
3. Memory management (limit message count)
4. Error handling

### Step 4: Add Tests (30 min)
1. Store unit tests
2. Integration tests with ChatScreen
3. Navigation flow tests

### Step 5: Prepare for Backend (15 min)
1. Add adapter interface
2. Document API requirements
3. Add TODO comments for backend integration

## API Design for Future Backend

```typescript
// RESTful API endpoints
POST   /api/conversations                 // Create new conversation
GET    /api/conversations/:id             // Get conversation
PUT    /api/conversations/:id/messages    // Add message
DELETE /api/conversations/:id             // Delete conversation
GET    /api/conversations?userId=xxx      // List user conversations

// WebSocket for real-time
ws://api/chat/:conversationId            // Real-time message stream
```

## Memory Management

### Strategies:
1. **Message Limit:** Keep last 100 messages per conversation
2. **Conversation Limit:** Keep last 10 conversations
3. **Time-based Cleanup:** Remove conversations older than session
4. **Size-based Cleanup:** If total size > 5MB, remove oldest

### Implementation:
```typescript
const MAX_MESSAGES = 100;
const MAX_CONVERSATIONS = 10;

class ChatHistoryStore {
  addMessage(message: Message) {
    // Add message
    conversation.messages.push(message);
    
    // Trim if needed
    if (conversation.messages.length > MAX_MESSAGES) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    }
  }
}
```

## Testing Strategy

### Unit Tests:
- Store CRUD operations
- Memory management limits
- Conversation lookup

### Integration Tests:
- Navigation flow preservation
- Context update handling
- Message persistence

### E2E Tests:
- Complete questionnaire → chat flow
- Edit answers → return to chat
- Multiple conversation management

## Performance Considerations

1. **Lazy Loading:** Only load active conversation
2. **Debounced Saves:** Batch message saves
3. **Virtual Scrolling:** For long message lists
4. **Indexed Storage:** Use Map for O(1) lookup

## Security Considerations (Future)

1. **Encryption:** Encrypt messages in AsyncStorage
2. **Authentication:** Require auth for API calls
3. **Validation:** Sanitize message content
4. **Rate Limiting:** Prevent spam/abuse

## Success Metrics

1. **No Data Loss:** Chat history persists across navigation
2. **Fast Load:** < 100ms to restore conversation
3. **Low Memory:** < 5MB for typical usage
4. **Easy Migration:** < 2 hours to add backend

## Timeline

### Phase 1 (Today - 2.5 hours):
- ✅ Basic store implementation
- ✅ ChatScreen integration
- ✅ Navigation testing
- ✅ Documentation

### Phase 2 (Future - 1 day):
- AsyncStorage persistence
- Sync indicators
- Offline support

### Phase 3 (Future - 2 days):
- Firebase integration
- User authentication
- Cloud sync
- Migration from local storage

## Code Examples

### Store Usage:
```typescript
// In ChatScreen
const { addMessage, getConversation } = useChatHistoryStore();

// Load existing
const existing = getConversation(questionnaireId, categoryPath);
if (existing) {
  setMessages(existing.messages);
}

// Save new
addMessage({
  id: Date.now().toString(),
  text: userInput,
  isUser: true,
  timestamp: new Date(),
});
```

### Future Backend Integration:
```typescript
// Just swap the adapter
const store = new ChatHistoryStore(
  process.env.USE_BACKEND 
    ? new FirebaseAdapter()
    : new InMemoryAdapter()
);
```

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Memory leak | High | Implement limits and cleanup |
| Data loss on refresh | Medium | Add AsyncStorage sooner |
| Complex migration | Medium | Use adapter pattern |
| Performance degradation | Low | Implement pagination |

## Decision Log

1. **Why Zustand?** Already in use, simple API, TypeScript support
2. **Why in-memory first?** Fastest to implement, good enough for MVP
3. **Why adapter pattern?** Easy migration path, testable
4. **Why conversation-based?** Natural grouping, easier to manage

## Next Steps

1. Review plan with team
2. Create store implementation
3. Integrate with ChatScreen
4. Test navigation flows
5. Document API requirements for backend team