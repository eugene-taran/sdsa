import { questionnaireService } from '../../services/questionnaireService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch
global.fetch = jest.fn();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock local questionnaire assets
jest.mock('../../assets/contexts/categories/cicd/cicd-pipeline.json', () => ({
  id: 'cicd-pipeline',
  title: 'CI/CD Pipeline',
  description: 'Configure CI/CD pipeline',
  questions: [],
}), { virtual: true });

jest.mock('../../assets/contexts/categories/e2e/e2e-testing.json', () => ({
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
}), { virtual: true });

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
        id: 'testing',
        name: 'Testing',
        description: 'Testing tools and strategies',
        icon: '🧪',
      },
      {
        id: 'performance',
        name: 'Performance',
        description: 'Optimization techniques',
        icon: '⚡',
      },
    ];

    it('should fetch categories from GitHub', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ categories: mockCategories }),
      });

      const result = await questionnaireService.getCategories();
      
      expect(result).toEqual(mockCategories);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts/categories.json'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'categories_cache',
        expect.stringContaining(JSON.stringify(mockCategories))
      );
    });

    it('should return cached categories if available', async () => {
      const cachedData = {
        data: { categories: mockCategories },
        timestamp: Date.now()
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await questionnaireService.getCategories();
      
      expect(result).toEqual(mockCategories);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return mock data on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await questionnaireService.getCategories();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should return mock data on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await questionnaireService.getCategories();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getQuestionnaires', () => {
    const mockQuestionnaires = [
      {
        id: 'unit-testing',
        title: 'Unit Testing Setup',
        description: 'Configure unit testing for your project',
      },
      {
        id: 'e2e-testing',
        title: 'E2E Testing',
        description: 'End-to-end testing configuration',
      },
    ];

    it('should fetch questionnaires for a category', async () => {
      // Mock the individual questionnaire fetches for e2e category
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'e2e-testing',
          title: 'E2E Testing',
          description: 'End-to-end testing configuration',
          questions: [],
        }),
      });

      const result = await questionnaireService.getQuestionnaires('e2e');
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'e2e-testing');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts/categories/e2e/e2e-testing.json'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return cached questionnaires if available', async () => {
      const cachedData = {
        data: mockQuestionnaires,
        timestamp: Date.now()
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await questionnaireService.getQuestionnaires('testing');
      
      expect(result).toEqual(mockQuestionnaires);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await questionnaireService.getQuestionnaires('unknown-category');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Returns empty array for unknown categories
      expect(result).toEqual([]);
    });
  });

  describe('getQuestionnaire', () => {
    const mockQuestionnaire = {
      id: 'e2e-testing',
      title: 'E2E Testing Setup',
      description: 'Configure end-to-end testing',
      questions: [
        {
          type: 'radio',
          label: 'Do you have existing tests?',
          options: ['Yes', 'No'],
        },
        {
          type: 'text',
          label: 'What framework are you using?',
          placeholder: 'e.g., Jest, Cypress',
        },
      ],
      llmConfig: {
        systemPrompt: 'You are a testing expert',
        temperature: 0.7,
        maxTokens: 1500,
      },
    };

    it('should fetch specific questionnaire', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuestionnaire,
      });

      const result = await questionnaireService.getQuestionnaire('testing', 'e2e-testing');
      
      expect(result).toEqual(mockQuestionnaire);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts/categories/testing/e2e-testing.json'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should return cached questionnaire if available', async () => {
      const cachedData = {
        data: mockQuestionnaire,
        timestamp: Date.now()
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await questionnaireService.getQuestionnaire('testing', 'e2e-testing');
      
      expect(result).toEqual(mockQuestionnaire);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return local questionnaire on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await questionnaireService.getQuestionnaire('e2e', 'e2e-testing');
      
      // Service returns local fallback on error
      expect(result).toBeDefined();
      expect(result?.id).toBe('e2e-testing');
      expect(result?.title).toBe('End-to-End Testing Setup');
    });

    it('should handle non-ok responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await questionnaireService.getQuestionnaire('testing', 'non-existent');
      
      expect(result).toBeNull();
    });
  });

  describe('caching behavior', () => {
    it('should always try cache first', async () => {
      const cachedData = {
        data: { categories: [{ id: 'cached', name: 'Cached' }] },
        timestamp: Date.now()
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const result = await questionnaireService.getCategories();
      
      // Verify cache was checked first (by not calling fetch when cache exists)
      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(cachedData.data.categories);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should update cache after successful fetch', async () => {
      const fetchedData = { categories: [{ id: 'test', name: 'Test' }] };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => fetchedData,
      });

      await questionnaireService.getCategories();
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'categories_cache',
        expect.stringContaining(JSON.stringify(fetchedData.categories))
      );
    });

    it('should not update cache on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await questionnaireService.getCategories();
      
      // When fetch fails, we shouldn't write to cache (only 1 call from reading attempt)
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
});