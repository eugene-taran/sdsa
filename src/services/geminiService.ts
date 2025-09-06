/**
 * Gemini Service for AI-powered chat and joke generation
 * 
 * Uses Google's Gemini models:
 * - Gemini 2.5 Flash Image Preview: Quick joke generation
 * - Gemini Flash 2.5: Main chat functionality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuestionnaireContext {
  title: string;
  description: string;
  answers: any[];
  systemPrompt?: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private nanoModel: any = null;
  private flashModel: any = null;
  private apiKey: string | null = null;
  private chatHistory: ChatMessage[] = [];

  /**
   * Initialize Gemini service with API key
   */
  async initialize(apiKey?: string): Promise<void> {
    // Try to get API key from parameter, environment, or storage
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || await this.getStoredApiKey();
    
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please provide an API key.');
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // Initialize models
    this.nanoModel = this.genAI.getGenerativeModel({ 
      model: process.env.EXPO_PUBLIC_GEMINI_JOKE_MODEL || 'gemini-2.5-flash-image-preview'
    });
    
    this.flashModel = this.genAI.getGenerativeModel({ 
      model: process.env.EXPO_PUBLIC_GEMINI_FLASH_MODEL || 'gemini-2.5-flash' 
    });

    console.log('Gemini service initialized successfully');
  }

  /**
   * Store API key securely
   */
  async storeApiKey(apiKey: string): Promise<void> {
    await AsyncStorage.setItem('gemini_api_key', apiKey);
    this.apiKey = apiKey;
    await this.initialize(apiKey);
  }

  /**
   * Get stored API key
   */
  private async getStoredApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('gemini_api_key');
    } catch {
      return null;
    }
  }

  /**
   * Generate a welcome joke after questionnaire completion
   * Uses Gemini 2.5 Flash Image Preview for quick generation
   */
  async generateWelcomeJoke(topic: string, difficulty?: string): Promise<string> {
    if (!this.nanoModel) {
      throw new Error('Gemini service not initialized. Call initialize() first.');
    }

    const prompt = `Generate a short, friendly, and encouraging message about learning ${topic}. 
    ${difficulty ? `This is a ${difficulty} level topic.` : ''}
    
    Structure:
    1. First, acknowledge that learning ${topic} can be challenging
    2. Then add ONE short, light-hearted programming joke related to ${topic}
    3. End with an encouraging note
    
    Keep it brief (2-3 sentences total), friendly, and motivating.
    
    Example format:
    "Learning [topic] isn't always easy! [relevant joke]. But don't worry, I'm here to help guide you through it!"`;

    try {
      const result = await this.nanoModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating joke:', error);
      // Fallback message if joke generation fails
      return `Learning ${topic} can be challenging, but that's what makes it rewarding! I'm here to help guide you through your journey. Let's tackle this together!`;
    }
  }

  /**
   * Main chat function using Gemini Flash 2.5
   * Maintains context from questionnaire and conversation history
   */
  async chat(userInput: string, context?: QuestionnaireContext): Promise<string> {
    if (!this.flashModel) {
      throw new Error('Gemini service not initialized. Call initialize() first.');
    }

    // Build the conversation prompt with context
    let systemContext = '';
    
    if (context) {
      systemContext = `
${context.systemPrompt || 'You are a helpful AI assistant specializing in software development.'}

The user has completed the "${context.title}" questionnaire.
${context.description ? `Description: ${context.description}` : ''}

User's questionnaire responses:
${JSON.stringify(context.answers, null, 2)}

Based on this context, provide personalized, specific, and actionable advice.
`;
    }

    // Add message to history
    this.chatHistory.push({ role: 'user', content: userInput });

    // Build conversation history for context
    const conversationContext = this.chatHistory.slice(-10).map(msg => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const fullPrompt = `${systemContext}

Previous conversation:
${conversationContext}

Please provide a helpful, specific response to the user's latest message.`;

    try {
      const result = await this.flashModel.generateContent(fullPrompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Add assistant response to history
      this.chatHistory.push({ role: 'assistant', content: responseText });
      
      return responseText;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.chatHistory = [];
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Set initial context and generate welcome message
   */
  async initializeChat(context: QuestionnaireContext): Promise<string> {
    this.clearHistory();
    
    // Generate welcome joke
    const welcomeJoke = await this.generateWelcomeJoke(
      context.title,
      context.answers.find((a: any) => a.question?.toLowerCase().includes('experience'))?.value
    );
    
    // Add joke as first message in history
    this.chatHistory.push({ role: 'assistant', content: welcomeJoke });
    
    return welcomeJoke;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.genAI !== null && this.apiKey !== null;
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.genAI = null;
    this.nanoModel = null;
    this.flashModel = null;
    this.chatHistory = [];
    console.log('Gemini service cleaned up');
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export types
export type { ChatMessage, QuestionnaireContext };