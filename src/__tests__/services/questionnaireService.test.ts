import { questionnaireService } from '../../services/questionnaireService';
import { cacheService } from '../../services/cacheService';

// Mock fetch
global.fetch = jest.fn();

// Mock cacheService
jest.mock('../../services/cacheService', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('QuestionnaireService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (cacheService.get as jest.Mock).mockResolvedValue(null);
    (cacheService.set as jest.Mock).mockResolvedValue(undefined);
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
        json: async () => mockCategories,
      });

      const result = await questionnaireService.getCategories();
      
      expect(result).toEqual(mockCategories);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts/categories.json'
      );
      expect(cacheService.set).toHaveBeenCalledWith('categories', mockCategories);
    });

    it('should return cached categories if available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(mockCategories);

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

  describe('getQuestionnairesForCategory', () => {
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
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockQuestionnaires,
      });

      const result = await questionnaireService.getQuestionnairesForCategory('testing');
      
      expect(result).toEqual(mockQuestionnaires);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/contexts/categories/testing/index.json'
      );
      expect(cacheService.set).toHaveBeenCalledWith('questionnaires_testing', mockQuestionnaires);
    });

    it('should return cached questionnaires if available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(mockQuestionnaires);

      const result = await questionnaireService.getQuestionnairesForCategory('testing');
      
      expect(result).toEqual(mockQuestionnaires);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return mock data on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await questionnaireService.getQuestionnairesForCategory('testing');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
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
      expect(cacheService.set).toHaveBeenCalledWith(
        'questionnaire_testing_e2e-testing',
        mockQuestionnaire
      );
    });

    it('should return cached questionnaire if available', async () => {
      (cacheService.get as jest.Mock).mockResolvedValue(mockQuestionnaire);

      const result = await questionnaireService.getQuestionnaire('testing', 'e2e-testing');
      
      expect(result).toEqual(mockQuestionnaire);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return null on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await questionnaireService.getQuestionnaire('testing', 'e2e-testing');
      
      expect(result).toBeNull();
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
      const cachedData = { cached: true };
      (cacheService.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await questionnaireService.getCategories();
      
      expect(cacheService.get).toHaveBeenCalledBefore(global.fetch as jest.Mock);
      expect(result).toEqual(cachedData);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should update cache after successful fetch', async () => {
      const fetchedData = { fetched: true };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => fetchedData,
      });

      await questionnaireService.getCategories();
      
      expect(cacheService.set).toHaveBeenCalledWith('categories', fetchedData);
    });

    it('should not update cache on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await questionnaireService.getCategories();
      
      expect(cacheService.set).not.toHaveBeenCalled();
    });
  });
});