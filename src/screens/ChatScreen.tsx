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
  useColorScheme,
} from 'react-native';
import { useJourneyStore } from '../store/journeyStore';
import { geminiService, QuestionnaireContext } from '../services/geminiService';
import { useThemeColors } from '../utils/colors';

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
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const _buildJourneyContext = () => {
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
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : [
        styles.aiMessage,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userMessageText : { color: colors.text }
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.timestamp,
        { color: item.isUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
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
        <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>AI is thinking...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
              borderColor: colors.border,
              color: colors.text,
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={isModelReady ? 'Ask a question...' : 'Initializing Gemini...'}
          placeholderTextColor={colors.placeholder}
          multiline
          maxLength={500}
          editable={isModelReady}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary },
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
  },
  messagesContainer: {
    padding: 10,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 14,
    borderRadius: 18,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
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
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
