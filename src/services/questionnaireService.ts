/**
 * Service for managing local questionnaires and categories
 */

import { Category, CategoriesData } from '../types/category';
import { Questionnaire } from '../types/questionnaire';

// Import local contexts
import categoriesData from '../../contexts/categories.json';
import cicdPipeline from '../../contexts/categories/cicd/cicd-pipeline.json';
import e2eTesting from '../../contexts/categories/e2e/e2e-testing.json';

class QuestionnaireService {
  private categories: CategoriesData = categoriesData;
  private questionnaires: Record<string, Questionnaire> = {
    'cicd/cicd-pipeline': cicdPipeline as Questionnaire,
    'e2e/e2e-testing': e2eTesting as Questionnaire,
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      return this.categories.categories;
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
      const questionnaires: Questionnaire[] = [];

      // Map of known questionnaires per category
      const categoryQuestionnaires: Record<string, string[]> = {
        'cicd': ['cicd-pipeline'],
        'e2e': ['e2e-testing'],
      };

      const questionnaireIds = categoryQuestionnaires[categoryPath] || [];

      for (const id of questionnaireIds) {
        const key = `${categoryPath}/${id}`;
        const questionnaire = this.questionnaires[key];
        if (questionnaire) {
          questionnaires.push(questionnaire);
        }
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
      const key = `${categoryPath}/${questionnaireId}`;
      return this.questionnaires[key] || null;
    } catch (error) {
      console.error('Error loading questionnaire:', error);
      return null;
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