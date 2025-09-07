import { useQuestionnaireStore } from '../../store/questionnaireStore';

describe('QuestionnaireStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useQuestionnaireStore.getState().reset();
  });

  describe('addAnswer', () => {
    it('should add a question and answer to the store', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('What is your framework?', 'React Native');
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toContain('What is your framework?');
      expect(state.answers['What is your framework?']).toBe('React Native');
    });

    it('should maintain order of questions in history', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('Question 1', 'Answer 1');
      store.addAnswer('Question 2', 'Answer 2');
      store.addAnswer('Question 3', 'Answer 3');
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toEqual(['Question 1', 'Question 2', 'Question 3']);
    });

    it('should update answer if question already exists', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('Question', 'First Answer');
      store.addAnswer('Question', 'Updated Answer');
      
      const state = useQuestionnaireStore.getState();
      expect(state.answers['Question']).toBe('Updated Answer');
      expect(state.questionnaireHistory.filter(q => q === 'Question').length).toBe(2);
    });
  });

  describe('goBack', () => {
    it('should remove the last question from history and its answer', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('Q1', 'A1');
      store.addAnswer('Q2', 'A2');
      store.addAnswer('Q3', 'A3');
      
      store.goBack();
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toEqual(['Q1', 'Q2']);
      expect(state.answers).not.toHaveProperty('Q3');
      expect(state.answers['Q1']).toBe('A1');
      expect(state.answers['Q2']).toBe('A2');
    });

    it('should do nothing if history is empty', () => {
      const store = useQuestionnaireStore.getState();
      
      store.goBack();
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toEqual([]);
      expect(state.answers).toEqual({});
    });
  });

  describe('setContext', () => {
    it('should set context values', () => {
      const store = useQuestionnaireStore.getState();
      
      store.setContext('questionnaire', 'E2E Testing');
      store.setContext('category', 'testing');
      
      const state = useQuestionnaireStore.getState();
      expect(state.context.questionnaire).toBe('E2E Testing');
      expect(state.context.category).toBe('testing');
    });

    it('should handle complex context values', () => {
      const store = useQuestionnaireStore.getState();
      
      store.setContext('config', { framework: 'Jest', timeout: 5000 });
      store.setContext('tags', ['unit', 'integration', 'e2e']);
      
      const state = useQuestionnaireStore.getState();
      expect(state.context.config).toEqual({ framework: 'Jest', timeout: 5000 });
      expect(state.context.tags).toEqual(['unit', 'integration', 'e2e']);
    });
  });

  describe('clearAnswers', () => {
    it('should clear history, answers, and resources but keep context', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('Q1', 'A1');
      store.setContext('category', 'testing');
      store.addResource('resource1');
      
      store.clearAnswers();
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toEqual([]);
      expect(state.answers).toEqual({});
      expect(state.resources).toEqual([]);
      expect(state.context.category).toBe('testing'); // Context should remain
    });
  });

  describe('reset', () => {
    it('should reset entire store to initial state', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addAnswer('Q1', 'A1');
      store.setContext('category', 'testing');
      store.addResource('resource1');
      
      store.reset();
      
      const state = useQuestionnaireStore.getState();
      expect(state.questionnaireHistory).toEqual([]);
      expect(state.answers).toEqual({});
      expect(state.context).toEqual({});
      expect(state.resources).toEqual([]);
      expect(state.currentBlockId).toBe('');
    });
  });

  describe('addResource', () => {
    it('should add resources to the list', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addResource('https://docs.example.com/guide');
      store.addResource('https://api.example.com/reference');
      
      const state = useQuestionnaireStore.getState();
      expect(state.resources).toEqual([
        'https://docs.example.com/guide',
        'https://api.example.com/reference'
      ]);
    });

    it('should allow duplicate resources', () => {
      const store = useQuestionnaireStore.getState();
      
      store.addResource('resource1');
      store.addResource('resource1');
      
      const state = useQuestionnaireStore.getState();
      expect(state.resources).toEqual(['resource1', 'resource1']);
    });
  });

  describe('state persistence', () => {
    it('should maintain state across multiple operations', () => {
      const store = useQuestionnaireStore.getState();
      
      // Simulate a questionnaire flow
      store.setContext('questionnaire', 'Performance Optimization');
      store.setContext('category', 'optimization');
      
      store.addAnswer('What is your current framework?', 'React Native');
      store.addAnswer('Are you using any optimization tools?', 'Yes, React DevTools');
      store.addAnswer('What is your main performance issue?', 'Slow list rendering');
      
      store.addResource('https://reactnative.dev/docs/performance');
      
      const state = useQuestionnaireStore.getState();
      
      // Verify complete state
      expect(state.questionnaireHistory).toHaveLength(3);
      expect(Object.keys(state.answers)).toHaveLength(3);
      expect(state.context.questionnaire).toBe('Performance Optimization');
      expect(state.context.category).toBe('optimization');
      expect(state.resources).toHaveLength(1);
      
      // Go back once
      store.goBack();
      const stateAfterBack = useQuestionnaireStore.getState();
      expect(stateAfterBack.questionnaireHistory).toHaveLength(2);
      expect(Object.keys(stateAfterBack.answers)).toHaveLength(2);
      expect(stateAfterBack.context.questionnaire).toBe('Performance Optimization'); // Context preserved
    });
  });
});