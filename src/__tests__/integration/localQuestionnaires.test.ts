import { questionnaireService } from '../../services/questionnaireService';
import categoriesData from '../../../contexts/categories.json';
import cicdPipeline from '../../../contexts/categories/cicd/cicd-pipeline.json';
import e2eTesting from '../../../contexts/categories/e2e/e2e-testing.json';

describe('Local Questionnaires Integration', () => {
  it('should load categories from local contexts/categories.json', async () => {
    const categories = await questionnaireService.getCategories();

    expect(categories).toBeDefined();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);

    // Verify categories match local data
    expect(categories).toEqual(categoriesData.categories);
  });

  it('should have correct structure for categories', async () => {
    const categories = await questionnaireService.getCategories();

    categories.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('path');
      expect(category).toHaveProperty('order');
    });
  });

  it('should load CICD questionnaires from local files', async () => {
    const questionnaires = await questionnaireService.getQuestionnaires('cicd');

    expect(questionnaires).toBeDefined();
    expect(Array.isArray(questionnaires)).toBe(true);
    expect(questionnaires.length).toBeGreaterThan(0);

    // Should include cicd-pipeline
    const cicdQuestionnaire = questionnaires.find(q => q.id === 'cicd-pipeline');
    expect(cicdQuestionnaire).toBeDefined();
    expect(cicdQuestionnaire).toEqual(cicdPipeline);
  });

  it('should load E2E questionnaires from local files', async () => {
    const questionnaires = await questionnaireService.getQuestionnaires('e2e');

    expect(questionnaires).toBeDefined();
    expect(Array.isArray(questionnaires)).toBe(true);
    expect(questionnaires.length).toBeGreaterThan(0);

    // Should include e2e-testing
    const e2eQuestionnaire = questionnaires.find(q => q.id === 'e2e-testing');
    expect(e2eQuestionnaire).toBeDefined();
    expect(e2eQuestionnaire).toEqual(e2eTesting);
  });

  it('should load specific questionnaire by ID', async () => {
    const questionnaire = await questionnaireService.getQuestionnaire('cicd', 'cicd-pipeline');

    expect(questionnaire).toBeDefined();
    expect(questionnaire).toEqual(cicdPipeline);
    expect(questionnaire?.id).toBe('cicd-pipeline');
    expect(questionnaire?.title).toBe('CI/CD Pipeline Setup');
  });

  it('should have correct questionnaire structure', async () => {
    const questionnaire = await questionnaireService.getQuestionnaire('e2e', 'e2e-testing');

    expect(questionnaire).toBeDefined();
    expect(questionnaire).toHaveProperty('id');
    expect(questionnaire).toHaveProperty('title');
    expect(questionnaire).toHaveProperty('description');
    expect(questionnaire).toHaveProperty('questions');
    expect(questionnaire).toHaveProperty('llmConfig');

    // Verify questions structure
    expect(Array.isArray(questionnaire?.questions)).toBe(true);
    if (questionnaire?.questions.length > 0) {
      const firstQuestion = questionnaire.questions[0];
      expect(firstQuestion).toHaveProperty('type');
      expect(firstQuestion).toHaveProperty('label');
    }

    // Verify LLM config
    expect(questionnaire?.llmConfig).toHaveProperty('systemPrompt');
    expect(questionnaire?.llmConfig).toHaveProperty('temperature');
    expect(questionnaire?.llmConfig).toHaveProperty('maxTokens');
  });

  it('should return empty array for non-existent category', async () => {
    const questionnaires = await questionnaireService.getQuestionnaires('non-existent');

    expect(questionnaires).toBeDefined();
    expect(Array.isArray(questionnaires)).toBe(true);
    expect(questionnaires.length).toBe(0);
  });

  it('should return null for non-existent questionnaire', async () => {
    const questionnaire = await questionnaireService.getQuestionnaire('cicd', 'non-existent');

    expect(questionnaire).toBeNull();
  });

  it('should not make any external API calls', async () => {
    // Mock fetch to ensure it's never called
    const originalFetch = global.fetch;
    global.fetch = jest.fn();

    // Load categories
    await questionnaireService.getCategories();

    // Load questionnaires
    await questionnaireService.getQuestionnaires('cicd');
    await questionnaireService.getQuestionnaire('e2e', 'e2e-testing');

    // Verify fetch was never called
    expect(global.fetch).not.toHaveBeenCalled();

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should handle all questionnaire question types', async () => {
    const questionnaires = await questionnaireService.getQuestionnaires('e2e');
    const e2eQuestionnaire = questionnaires.find(q => q.id === 'e2e-testing');

    expect(e2eQuestionnaire).toBeDefined();
    const questions = e2eQuestionnaire?.questions || [];

    // Check for different question types
    const questionTypes = new Set(questions.map(q => q.type));

    // E2E testing questionnaire should have various types
    expect(questionTypes.has('radio')).toBe(true);
    expect(questionTypes.has('text')).toBe(true);
  });
});