/**
 * Service for fetching and managing questionnaires and categories
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CategoriesData } from '../types/category';
import { Questionnaire } from '../types/questionnaire';

const CACHE_PREFIX = 'questionnaire_cache_';
const CATEGORIES_CACHE_KEY = 'categories_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class QuestionnaireService {
  private baseUrl = 'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts';
  private localFallback = true; // Use local assets as fallback

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      // Try cache first
      const cached = await this.getCachedData<CategoriesData>(CATEGORIES_CACHE_KEY);
      if (cached) {
        return cached.categories;
      }

      // Try remote fetch
      try {
        const response = await fetch(`${this.baseUrl}/categories.json`);
        if (response.ok) {
          const data: CategoriesData = await response.json();
          await this.setCachedData(CATEGORIES_CACHE_KEY, data);
          return data.categories;
        }
      } catch (error) {
        console.error('Remote fetch failed, using local fallback:', error);
      }

      // Fallback to local assets
      if (this.localFallback) {
        const data = require('../../assets/contexts/categories.json') as CategoriesData;
        return data.categories;
      }

      throw new Error('Failed to load categories');
    } catch (error) {
      console.error('Error loading categories:', error);
      // Return mock data as last resort
      return this.getMockCategories();
    }
  }

  /**
   * Get questionnaires for a specific category
   */
  async getQuestionnaires(categoryPath: string): Promise<Questionnaire[]> {
    try {
      const cacheKey = `${CACHE_PREFIX}${categoryPath}`;
      
      // Try cache first
      const cached = await this.getCachedData<Questionnaire[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const questionnaires: Questionnaire[] = [];

      // Map of known questionnaires per category
      const categoryQuestionnaires: Record<string, string[]> = {
        'cicd': ['cicd-pipeline'],
        'e2e': ['e2e-testing'],
      };

      const questionnaireIds = categoryQuestionnaires[categoryPath] || [];

      for (const id of questionnaireIds) {
        try {
          // Try remote fetch
          const response = await fetch(`${this.baseUrl}/categories/${categoryPath}/${id}.json`);
          if (response.ok) {
            const questionnaire: Questionnaire = await response.json();
            questionnaires.push(questionnaire);
          }
        } catch (error) {
          console.error(`Failed to fetch ${id} remotely, trying local:`, error);
          
          // Fallback to local assets
          if (this.localFallback) {
            try {
              const questionnaire = this.getLocalQuestionnaire(categoryPath, id);
              if (questionnaire) {
                questionnaires.push(questionnaire);
              }
            } catch (localError) {
              console.error(`Failed to load local questionnaire ${id}:`, localError);
            }
          }
        }
      }

      if (questionnaires.length > 0) {
        await this.setCachedData(cacheKey, questionnaires);
      }

      return questionnaires;
    } catch (error) {
      console.error('Error loading questionnaires:', error);
      return [];
    }
  }

  /**
   * Get a specific questionnaire
   */
  async getQuestionnaire(categoryPath: string, questionnaireId: string): Promise<Questionnaire | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${categoryPath}_${questionnaireId}`;
      
      // Try cache first
      const cached = await this.getCachedData<Questionnaire>(cacheKey);
      if (cached) {
        return cached;
      }

      // Try remote fetch
      try {
        const response = await fetch(`${this.baseUrl}/categories/${categoryPath}/${questionnaireId}.json`);
        if (response.ok) {
          const questionnaire: Questionnaire = await response.json();
          await this.setCachedData(cacheKey, questionnaire);
          return questionnaire;
        }
      } catch (error) {
        console.error('Remote fetch failed, using local fallback:', error);
      }

      // Fallback to local assets
      if (this.localFallback) {
        return this.getLocalQuestionnaire(categoryPath, questionnaireId);
      }

      return null;
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      return null;
    }
  }

  /**
   * Get local questionnaire from assets
   */
  private getLocalQuestionnaire(categoryPath: string, questionnaireId: string): Questionnaire | null {
    try {
      // Dynamic requires don't work well in React Native, so we need to map them
      const questionnaireMap: Record<string, Questionnaire> = {
        'cicd/cicd-pipeline': require('../../assets/contexts/categories/cicd/cicd-pipeline.json'),
        'e2e/e2e-testing': require('../../assets/contexts/categories/e2e/e2e-testing.json'),
      };

      const key = `${categoryPath}/${questionnaireId}`;
      return questionnaireMap[key] || null;
    } catch (error) {
      console.error('Error loading local questionnaire:', error);
      return null;
    }
  }

  /**
   * Get cached data
   */
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > CACHE_DURATION) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  private async setCachedData<T>(key: string, data: T): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(CACHE_PREFIX) || key === CATEGORIES_CACHE_KEY
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get mock categories for development
   */
  private getMockCategories(): Category[] {
    return [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'Continuous Integration, Deployment, and DevOps practices',
        icon: '🚀',
        path: 'cicd',
        order: 1,
      },
      {
        id: 'e2e',
        name: 'Testing & Quality',
        description: 'Testing strategies, frameworks, and quality assurance',
        icon: '🧪',
        path: 'e2e',
        order: 2,
      },
    ];
  }
}

export const questionnaireService = new QuestionnaireService();