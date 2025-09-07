import { create } from 'zustand';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string;
}

interface ChatHistoryStore {
  // Simple in-memory storage - key format: "questionnaireId_categoryPath"
  messages: Map<string, Message[]>;
  
  // Actions
  saveMessages: (key: string, messages: Message[]) => void;
  getMessages: (key: string) => Message[] | undefined;
  appendMessage: (key: string, message: Message) => void;
  clearMessages: (key: string) => void;
  clearAll: () => void;
}

const MAX_MESSAGES_PER_CHAT = 100; // Limit to prevent memory issues

export const useChatHistoryStore = create<ChatHistoryStore>((set, get) => ({
  messages: new Map(),
  
  saveMessages: (key, messages) => {
    set((state) => {
      const newMap = new Map(state.messages);
      // Limit messages to prevent memory issues
      const limitedMessages = messages.slice(-MAX_MESSAGES_PER_CHAT);
      newMap.set(key, limitedMessages);
      return { messages: newMap };
    });
  },
  
  getMessages: (key) => {
    return get().messages.get(key);
  },
  
  appendMessage: (key, message) => {
    set((state) => {
      const newMap = new Map(state.messages);
      const existing = newMap.get(key) || [];
      const updated = [...existing, message].slice(-MAX_MESSAGES_PER_CHAT);
      newMap.set(key, updated);
      return { messages: newMap };
    });
  },
  
  clearMessages: (key) => {
    set((state) => {
      const newMap = new Map(state.messages);
      newMap.delete(key);
      return { messages: newMap };
    });
  },
  
  clearAll: () => {
    set({ messages: new Map() });
  },
}));

// Helper function to create a chat key
export const createChatKey = (questionnaireId?: string | number, categoryPath?: string | number): string => {
  const qId = questionnaireId || 'default';
  const cPath = categoryPath || 'general';
  return `${qId}_${cPath}`;
};