import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useJourneyStore } from '../store/journeyStore';
import { modelService } from '../services/modelService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { path, answers, context } = useJourneyStore();

  useEffect(() => {
    initializeModel();
    addInitialMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeModel = async () => {
    try {
      await modelService.initialize({
        model: 'phi-3-mini.onnx',
        maxTokens: 1024,
        temperature: 0.7,
      });
      setIsModelReady(true);
    } catch (error) {
      console.error('Error initializing model:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "I'm having trouble loading the AI model. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    }
  };

  const addInitialMessage = () => {
    const journeyContext = buildJourneyContext();
    const initialMessage: Message = {
      id: '1',
      text: `I understand you've been exploring ${journeyContext.topic || 'software development'}. Based on your journey, I can see you're interested in ${journeyContext.summary || 'learning more'}. How can I help you with this?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  };

  const buildJourneyContext = () => {
    // Build a summary of the user's journey
    const topic = path[0] || 'general development';
    const choices = Object.entries(answers)
      .map(([question, answer]) => `${question}: ${answer}`)
      .join(', ');

    return {
      topic,
      summary: choices || 'getting started',
      fullContext: { path, answers, context },
    };
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || !isModelReady) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const journeyContext = buildJourneyContext();
      const prompt = `
        User Context:
        - Topic: ${journeyContext.topic}
        - Journey: ${journeyContext.summary}
        - Full Context: ${JSON.stringify(journeyContext.fullContext)}
        
        User Question: ${inputText}
        
        Please provide a helpful response based on the user's journey and context.
      `;

      const response = await modelService.generate(prompt, journeyContext.fullContext);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't generate a response. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <Text style={[styles.messageText, item.isUser && styles.userMessageText]}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isModelReady ? 'Ask a question...' : 'Loading model...'}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={isModelReady}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || !isModelReady) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading || !isModelReady}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#333',
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
