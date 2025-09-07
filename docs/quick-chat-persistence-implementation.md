# Quick Chat Persistence Implementation

## Immediate Solution (In-Memory)

### 1. Create Chat History Store (15 min)

```typescript
// src/store/chatHistoryStore.ts
import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

interface ChatHistoryStore {
  // Simple in-memory storage
  messages: Map<string, Message[]>; // key: questionnaireId_categoryPath
  
  // Actions
  saveMessages: (key: string, messages: Message[]) => void;
  getMessages: (key: string) => Message[] | undefined;
  clearMessages: (key: string) => void;
}

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  messages: new Map(),
  
  saveMessages: (key, messages) => {
    set((state) => {
      const newMap = new Map(state.messages);
      newMap.set(key, messages);
      return { messages: newMap };
    });
  },
  
  getMessages: (key) => {
    return get().messages.get(key);
  },
  
  clearMessages: (key) => {
    set((state) => {
      const newMap = new Map(state.messages);
      newMap.delete(key);
      return { messages: newMap };
    });
  },
}));
```

### 2. Update ChatScreen (20 min)

```typescript
// src/screens/ChatScreen.tsx

// Add import
import { useChatHistoryStore } from '../store/chatHistoryStore';

// Inside component
const { saveMessages, getMessages } = useChatHistoryStore();

// Create unique key for this questionnaire/category combo
const chatKey = `${context.questionnaireId || 'default'}_${context.category || 'general'}`;

// Load existing messages on mount
useEffect(() => {
  const existingMessages = getMessages(chatKey);
  if (existingMessages && existingMessages.length > 0) {
    setMessages(existingMessages);
    setHasShownWelcome(true); // Don't show welcome again
  } else {
    initializeModel();
  }
}, [chatKey]);

// Save messages whenever they change
useEffect(() => {
  if (messages.length > 0) {
    saveMessages(chatKey, messages);
  }
}, [messages, chatKey]);
```

### 3. Handle Context Updates (10 min)

When questionnaire is edited and context updates:
- Keep existing messages
- Add a system message about context update
- Don't regenerate welcome message

```typescript
// In handleContextUpdate
const updateMessage: Message = {
  id: `update-${Date.now()}`,
  text: "✅ I've updated my understanding based on your revised answers.",
  isUser: false,
  timestamp: new Date(),
};

// Append to existing messages instead of replacing
setMessages((prev) => [...prev, updateMessage]);
```

## Testing Checklist

- [ ] Complete questionnaire → Navigate to chat → Messages appear
- [ ] Send messages → Navigate away → Come back → Messages preserved
- [ ] Edit answers → Return to chat → Old messages still there + update message
- [ ] Different questionnaires → Different chat histories
- [ ] Same questionnaire → Same chat history

## Future Backend Migration

When ready for backend:

1. **Add persistence layer:**
```typescript
// Add to chatHistoryStore
persistToBackend: async (key: string, messages: Message[]) => {
  await fetch('/api/chat-history', {
    method: 'POST',
    body: JSON.stringify({ key, messages })
  });
}
```

2. **Add loading from backend:**
```typescript
loadFromBackend: async (key: string) => {
  const response = await fetch(`/api/chat-history/${key}`);
  return response.json();
}
```

3. **Sync strategy:**
- Save to memory immediately (fast UX)
- Sync to backend in background
- Load from backend on app start

## Implementation Order

1. **Step 1:** Create `chatHistoryStore.ts` (5 min)
2. **Step 2:** Import in ChatScreen (2 min)
3. **Step 3:** Add load logic in useEffect (5 min)
4. **Step 4:** Add save logic in message handlers (5 min)
5. **Step 5:** Test navigation flows (10 min)
6. **Step 6:** Handle edge cases (10 min)

Total: ~40 minutes

## Key Points

✅ **Simple:** Just a Map in Zustand store
✅ **Fast:** No async operations, instant save/load
✅ **Isolated:** Each questionnaire has its own chat
✅ **Extensible:** Easy to add backend later
✅ **Testable:** Simple functions, easy to mock

## Edge Cases to Handle

1. **Memory limit:** Cap at 100 messages per chat
2. **New questionnaire:** Clear old chat when switching
3. **No context:** Use 'default' key for general chat
4. **App refresh:** Accept data loss for now (MVP)