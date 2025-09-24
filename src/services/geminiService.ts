/**
 * Gemini Service for AI-powered chat and image generation
 * 
 * Uses Google's Gemini models:
 * - gemini-2.0-flash-v2: Image generation and main chat functionality
 */

import { GoogleGenAI } from '@google/genai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config/env';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface QuestionnaireContext {
  title: string;
  description: string;
  answers: Array<{ question: string; value: string | string[] }>;
  systemPrompt?: string;
}

class GeminiService {
  private genAI: GoogleGenAI | null = null;
  private apiKey: string | null = null;
  private chatHistory: ChatMessage[] = [];
  private imageModelName: string = 'gemini-2.5-flash-image-preview';
  private chatModelName: string = 'gemini-2.5-flash';

  /**
   * Initialize Gemini service with API key
   */
  async initialize(apiKey?: string): Promise<void> {
    // Try to get API key from:
    // 1. Parameter (for UI input)
    // 2. Stored in AsyncStorage (user's saved key)
    // 3. Environment variable (for development only)
    this.apiKey = apiKey || await this.getStoredApiKey() || env.apiKey;

    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please provide your API key.');
    }

    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });

    // Set model names
    this.imageModelName = env.imageModel;
    this.chatModelName = env.chatModel;
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
  async getStoredApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('gemini_api_key');
    } catch {
      return null;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey !== undefined && this.apiKey !== '';
  }

  /**
   * Clear stored API key
   */
  async clearApiKey(): Promise<void> {
    await AsyncStorage.removeItem('gemini_api_key');
    this.apiKey = null;
    this.genAI = null;
  }

  /**
   * Generate an image with a joke about the topic
   */
  async refreshContext(newContext: QuestionnaireContext): Promise<void> {
    // Re-initialize with new context which will clear the old session
    await this.initializeChat(newContext);
  }

  async generateJokeImage(topic: string): Promise<string | null> {
    if (!this.genAI) {
      throw new Error('Gemini service not initialized. Call initialize() first.');
    }

    const imagePrompt = `Create an image with a joke about learning ${topic}. The image should be fun, light-hearted, and encouraging. Include visual elements that represent ${topic} in a humorous way. Make it colorful and engaging.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: this.imageModelName,
        contents: imagePrompt,
      });
      const response = result;
      
      // Check if response contains generated content
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.mimeType?.startsWith('image/')) {
            // Return base64 image data with proper data URL format
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      
      // If no image in response, try to extract base64 from text
      const text = response.text;
      if (text && text.includes('data:image')) {
        return text;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating joke image:', error);
      return null;
    }
  }

  /**
   * Generate a welcome message after questionnaire completion
   */
  async generateWelcomeMessage(topic: string, hasImage: boolean): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini service not initialized. Call initialize() first.');
    }

    const prompt = hasImage 
      ? `Generate a friendly welcome message for someone starting to learn ${topic}. Say: "We know learning ${topic} isn't easy! Here's a little humor to get us started. Let's begin - what would you like to learn or improve in your current ${topic} process?" Keep it exactly like this but you can adjust the topic name to fit naturally.`
      : `Generate a friendly welcome message for someone starting to learn ${topic}. Acknowledge it can be challenging and ask what they'd like to learn or improve in their current process. Keep it encouraging and conversational.`;

    try {
      const result = await this.genAI.models.generateContent({
        model: this.chatModelName,
        contents: prompt,
      });
      return result.text || this.getFallbackWelcome(topic, hasImage);
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return this.getFallbackWelcome(topic, hasImage);
    }
  }

  private getFallbackWelcome(topic: string, hasImage: boolean): string {
    return hasImage
      ? `We know learning ${topic} isn't easy! Here's a little humor to get us started. Let's begin - what would you like to learn or improve in your current process?`
      : `Learning ${topic} can be challenging, but that's what makes it rewarding! I'm here to help guide you through your journey. What would you like to learn or improve in your current process?`;
  }

  /**
   * Main chat function using Gemini Flash 2.5 with streaming
   * Maintains context from questionnaire and conversation history
   */
  async chatStream(
    userInput: string,
    context?: QuestionnaireContext,
    onChunk?: (text: string) => void
  ): Promise<string> {
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
      if (!this.genAI) {
        throw new Error('Gemini service not initialized. Please provide your API key.');
      }

      // Use streaming API
      const stream = await this.genAI.models.generateContentStream({
        model: this.chatModelName,
        contents: fullPrompt,
      });

      let fullResponse = '';

      // Process stream chunks
      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        fullResponse += chunkText;

        // Call the callback with the new chunk
        if (onChunk && chunkText) {
          onChunk(chunkText);
        }
      }

      // If no response was generated, use fallback
      if (!fullResponse) {
        fullResponse = 'I apologize, but I had trouble generating a response. Please try again.';
      }

      // Add assistant response to history
      this.chatHistory.push({ role: 'assistant', content: fullResponse });

      return fullResponse;
    } catch (error) {
      console.error('Error in chat:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  /**
   * Legacy non-streaming chat function
   */
  async chat(userInput: string, context?: QuestionnaireContext): Promise<string> {
    return this.chatStream(userInput, context);
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
   * Set initial context and generate welcome with optional image
   */
  async initializeChat(context: QuestionnaireContext): Promise<{ message: string; image?: string }> {
    this.clearHistory();
    
    // Try to generate joke image
    const jokeImage = await this.generateJokeImage(context.title);
    
    // Generate welcome message based on whether we have an image
    const welcomeMessage = await this.generateWelcomeMessage(context.title, !!jokeImage);
    
    // Add message to history
    this.chatHistory.push({ role: 'assistant', content: welcomeMessage });
    
    return {
      message: welcomeMessage,
      image: jokeImage || undefined
    };
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
    this.chatHistory = [];
    // Service cleaned up
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export types
export type { ChatMessage, QuestionnaireContext };