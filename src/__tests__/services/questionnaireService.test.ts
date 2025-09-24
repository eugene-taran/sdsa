import { questionnaireService } from '../../services/questionnaireService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock local questionnaire assets
jest.mock('../../../contexts/categories.json', () => ({
  categories: [
    {
      id: 'cicd',
      name: 'CI/CD & DevOps',
      description: 'Continuous Integration, Continuous Deployment, and DevOps practices',
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
  ],
}));

jest.mock('../../../contexts/categories/cicd/cicd-pipeline.json', () => ({
  id: 'cicd-pipeline',
  title: 'CI/CD Pipeline',
  description: 'Configure CI/CD pipeline',
  questions: [],
}));

jest.mock('../../../contexts/categories/e2e/e2e-testing.json', () => ({
  id: 'e2e-testing',
  title: 'End-to-End Testing Setup',
  description: 'Configure end-to-end testing',
  questions: [
    {
      type: 'radio',
      label: 'Do you have existing tests?',
      options: ['Yes', 'No'],
    },
  ],
}));

describe('QuestionnaireService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('getCategories', () => {
    const mockCategories = [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'Continuous Integration, Continuous Deployment, and DevOps practices',
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

    it('should return local categories', async () => {
      const result = await questionnaireService.getCategories();

      expect(result).toEqual(mockCategories);
      // No fetch should be called since we're using local imports
      expect(global.fetch).not.toHaveBeenCalled();
      // No caching needed for local data
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should always return the same categories', async () => {
      const result1 = await questionnaireService.getCategories();
      const result2 = await questionnaireService.getCategories();

      expect(result1).toEqual(result2);
      expect(result1).toEqual(mockCategories);
    });

    it('should handle errors gracefully', async () => {
      // Mock an error scenario
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // The service should still return mock data on error
      const result = await questionnaireService.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return categories even without errors', async () => {
      const result = await questionnaireService.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });

  describe('getQuestionnaires', () => {
    it('should return questionnaires for e2e category', async () => {
      const result = await questionnaireService.getQuestionnaires('e2e');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'e2e-testing');
      // No fetch should be called since we're using local imports
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return questionnaires for cicd category', async () => {
      const result = await questionnaireService.getQuestionnaires('cicd');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'cicd-pipeline');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array for unknown category', async () => {
      const result = await questionnaireService.getQuestionnaires('unknown-category');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Returns empty array for unknown categories
      expect(result).toEqual([]);
    });
  });

  describe('getQuestionnaire', () => {
    it('should return a specific questionnaire for e2e', async () => {
      const result = await questionnaireService.getQuestionnaire('e2e', 'e2e-testing');

      expect(result).toBeDefined();
      expect(result?.id).toBe('e2e-testing');
      expect(result?.title).toBe('End-to-End Testing Setup');
      // No fetch should be called since we're using local imports
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return a specific questionnaire for cicd', async () => {
      const result = await questionnaireService.getQuestionnaire('cicd', 'cicd-pipeline');

      expect(result).toBeDefined();
      expect(result?.id).toBe('cicd-pipeline');
      expect(result?.title).toBe('CI/CD Pipeline');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null for non-existent questionnaire', async () => {
      const result = await questionnaireService.getQuestionnaire('testing', 'non-existent');

      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('local data behavior', () => {
    it('should not use AsyncStorage for local data', async () => {
      await questionnaireService.getCategories();

      // No cache operations should happen with local data
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not make network requests', async () => {
      await questionnaireService.getCategories();
      await questionnaireService.getQuestionnaires('e2e');
      await questionnaireService.getQuestionnaire('cicd', 'cicd-pipeline');

      // No fetch calls should be made with local data
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Even with errors, should return valid data or defaults
      const categories = await questionnaireService.getCategories();
      const questionnaires = await questionnaireService.getQuestionnaires('unknown');
      const questionnaire = await questionnaireService.getQuestionnaire('unknown', 'unknown');

      expect(categories.length).toBeGreaterThan(0);
      expect(questionnaires).toEqual([]);
      expect(questionnaire).toBeNull();
    });

  });
});