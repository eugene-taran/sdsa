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
import { geminiService, QuestionnaireContext } from '../services/geminiService';

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
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { path, answers, context } = useJourneyStore();

  useEffect(() => {
    initializeModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeModel = async () => {
    try {
      // Initialize Gemini service
      await geminiService.initialize();
      setIsModelReady(true);
      
      // Generate and show welcome joke
      await showWelcomeJoke();
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      // Try to initialize without showing error, user might need to add API key
      setIsModelReady(false);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Please ensure Gemini API key is configured. You can set it in the app settings or as EXPO_PUBLIC_GEMINI_API_KEY environment variable.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    }
  };

  const showWelcomeJoke = async () => {
    if (hasShownWelcome) return;
    
    try {
      const journeyContext = buildJourneyContext();
      const questionnaireContext = buildQuestionnaireContext();
      
      // Initialize chat with context and get welcome joke
      const welcomeMessage = await geminiService.initializeChat(questionnaireContext);
      
      const jokeMessage: Message = {
        id: '1',
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages([jokeMessage]);
      setHasShownWelcome(true);
    } catch (error) {
      console.error('Error generating welcome joke:', error);
      // Fallback to a simple welcome message
      const fallbackMessage: Message = {
        id: '1',
        text: `Welcome! I see you've completed the questionnaire about ${path[0] || 'software development'}. I'm here to help guide you through your learning journey. What would you like to know?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
      setHasShownWelcome(true);
    }
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

  const buildQuestionnaireContext = (): QuestionnaireContext => {
    // Build context for Gemini service
    const topic = path[0] || 'Software Development';
    
    // Convert answers to array format expected by Gemini
    const formattedAnswers = Object.entries(answers).map(([question, answer]) => ({
      question,
      value: answer,
    }));
    
    return {
      title: topic,
      description: `Learning journey for ${topic}`,
      answers: formattedAnswers,
      systemPrompt: `You are an expert software development mentor specializing in ${topic}. 
        Provide helpful, specific, and actionable guidance based on the user's experience level and goals.`,
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
      const questionnaireContext = buildQuestionnaireContext();
      
      // Use Gemini Flash 2.0 for the main chat
      const response = await geminiService.chat(inputText, questionnaireContext);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
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
          placeholder={isModelReady ? 'Ask a question...' : 'Initializing Gemini...'}
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
