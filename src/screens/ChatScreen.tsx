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
  Image,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useChatHistoryStore, createChatKey, type Message } from '../store/chatHistoryStore';
import { geminiService, QuestionnaireContext } from '../services/geminiService';
import { useThemeColors } from '../utils/colors';
import { ImageModal } from '../components/ImageModal';
import { ContextHeader } from '../components/Chat/ContextHeader';
import { env } from '../config/env';

const { width: screenWidth } = Dimensions.get('window');

type ChatRouteProp = RouteProp<{ Chat: { contextUpdated?: boolean } }, 'Chat'>;

export const ChatScreen = () => {
  const route = useRoute<ChatRouteProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { questionnaireHistory, answers, context } = useQuestionnaireStore();
  const { saveMessages, getMessages } = useChatHistoryStore();
  
  // Create unique key for this questionnaire/category combo
  // Ensure we only pass string or number values to createChatKey
  const questionnaireId = typeof context.questionnaireId === 'string' || typeof context.questionnaireId === 'number' 
    ? context.questionnaireId 
    : undefined;
  const category = typeof context.category === 'string' || typeof context.category === 'number'
    ? context.category
    : undefined;
  const chatKey = createChatKey(questionnaireId, category);

  useEffect(() => {
    // Load existing messages if available
    const existingMessages = getMessages(chatKey);
    if (existingMessages && existingMessages.length > 0) {
      setMessages(existingMessages);
      setHasShownWelcome(true); // Don't show welcome again
      setIsInitializing(false);
      setIsModelReady(true);
    } else {
      // No existing messages, initialize normally
      initializeModel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatKey]);

  useEffect(() => {
    // Handle context updates from questionnaire edit
    if (route.params?.contextUpdated) {
      handleContextUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.contextUpdated]);

  useEffect(() => {
    // Save messages whenever they change (except on initial load)
    if (messages.length > 0) {
      saveMessages(chatKey, messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chatKey]);

  const initializeModel = async () => {
    try {
      setIsInitializing(true);
      // Initialize Gemini service
      await geminiService.initialize();
      setIsModelReady(true);
      
      // Generate and show welcome joke
      await showWelcomeJoke();
    } catch (error) {
      console.error('Error initializing Gemini:', error);
      setIsModelReady(false);
      
      let errorText = "Unable to initialize AI assistant. ";
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('API key') || !env.apiKey) {
        errorText += "Please ensure your Gemini API key is configured. Set GEMINI_API_KEY in your .env.local file.";
      } else {
        errorText += "Please check your configuration and try refreshing the page.";
      }
      
      const errorMsgObj: Message = {
        id: Date.now().toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([errorMsgObj]);
      
      // Try to set model as ready anyway to allow retrying
      setTimeout(() => {
        setIsModelReady(true);
      }, 2000);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleContextUpdate = async () => {
    try {
      // Add a message indicating context was updated
      const updateMessage: Message = {
        id: `update-${Date.now()}`,
        text: "✅ I've updated my understanding based on your revised answers. How can I help you with your updated context?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, updateMessage]);
      
      // Refresh the AI context
      const questionnaireContext = buildQuestionnaireContext();
      await geminiService.refreshContext(questionnaireContext);
    } catch (error) {
      console.error('Error updating context:', error);
    }
  };

  const showWelcomeJoke = async () => {
    if (hasShownWelcome) return;
    
    try {
      const questionnaireContext = buildQuestionnaireContext();
      
      // Initialize chat with context and get welcome with optional image
      const welcome = await geminiService.initializeChat(questionnaireContext);
      
      const messagesToAdd: Message[] = [];
      
      // Add image message if available
      if (welcome.image) {
        messagesToAdd.push({
          id: '1',
          text: '',
          image: welcome.image,
          isUser: false,
          timestamp: new Date(),
        });
      }
      
      // Add welcome text message
      messagesToAdd.push({
        id: welcome.image ? '2' : '1',
        text: welcome.message,
        isUser: false,
        timestamp: new Date(),
      });
      
      setMessages(messagesToAdd);
      setHasShownWelcome(true);
      
      // Scroll to show welcome message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Error generating welcome:', error);
      // Fallback to a simple welcome message
      const topic = context.questionnaire || context.category || 'new technologies';
      const fallbackMessage: Message = {
        id: '1',
        text: `Learning ${topic} can be challenging, but that's what makes it rewarding! I'm here to help guide you through your journey. What would you like to learn or improve in your current process?`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([fallbackMessage]);
      setHasShownWelcome(true);
    }
  };

  const _buildJourneyContext = () => {
    // Build a summary of the user's journey
    const topic = questionnaireHistory[0] || 'general development';
    const choices = Object.entries(answers)
      .map(([question, answer]) => `${question}: ${answer}`)
      .join(', ');

    return {
      topic,
      summary: choices || 'getting started',
      fullContext: { questionnaireHistory, answers, context },
    };
  };

  const buildQuestionnaireContext = (): QuestionnaireContext => {
    // Build context for Gemini service
    // Use the questionnaire title from context, or category name, or fallback
    const topic = String(context.questionnaire || context.category || 'Software Development');
    
    // Convert answers to array format expected by Gemini
    const formattedAnswers = Object.entries(answers).map(([question, answer]) => ({
      question,
      value: String(answer), // Ensure value is always a string
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

    const aiMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add placeholder AI message that will be updated via streaming
    const aiMessage: Message = {
      id: aiMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const questionnaireContext = buildQuestionnaireContext();
      
      // Use streaming chat with callback to update message in real-time
      await geminiService.chatStream(
        inputText, 
        questionnaireContext,
        (chunk: string) => {
          // Update the AI message with new chunks
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === aiMessageId 
                ? { ...msg, text: msg.text + chunk }
                : msg
            )
          );
          
          // Immediate scroll to bottom as text streams in
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      );
    } catch (error) {
      console.error('Error generating response:', error);
      let errorText = "I apologize, but I'm having trouble generating a response. ";
      const errorMsg = error instanceof Error ? error.message : '';
      
      if (errorMsg.includes('API key')) {
        errorText += "Please check that your Gemini API key is configured correctly.";
      } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
        errorText += "It looks like we've hit the API rate limit. Please wait a moment and try again.";
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        errorText += "There seems to be a network issue. Please check your connection and try again.";
      } else {
        errorText += "Please try again in a moment. If the issue persists, check your API configuration.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Final scroll to bottom after message is complete
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
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
      ],
      item.image && !item.text && styles.imageMessageContainer
    ]}>
      {item.image && (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => {
            setSelectedImage(item.image || null);
            setIsImageModalVisible(true);
          }}
        >
          <Image 
            source={{ uri: item.image }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {item.text ? (
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : { color: colors.text }
        ]}>
          {item.text}
        </Text>
      ) : null}
      {(item.text || !item.image) && (
        <Text style={[
          styles.timestamp,
          { color: item.isUser ? 'rgba(255,255,255,0.7)' : colors.secondaryText }
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ContextHeader />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isInitializing ? (
          <View style={styles.initializingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.initializingText, { color: colors.secondaryText }]}>
              Generating your personalized welcome...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.messagesContainer, { paddingBottom: 20 }]}
            style={styles.flatList}
            onContentSizeChange={() => {
              // Always scroll to bottom when content changes
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            onLayout={() => {
              // Scroll on initial layout
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 50);
            }}
          />
        )}

      {isLoading && (
        <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.secondaryText }]}>AI is typing...</Text>
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
      
      <ImageModal
        visible={isImageModalVisible}
        imageUri={selectedImage}
        onClose={() => {
          setIsImageModalVisible(false);
          setSelectedImage(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  flatList: {
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
  initializingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initializingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
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
  imageMessageContainer: {
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  messageImage: {
    width: Math.min(screenWidth * 0.65, 260),
    height: Math.min(screenWidth * 0.45, 180),
    borderRadius: 10,
    marginBottom: 8,
  },
});
