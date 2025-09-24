import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ContextValue = string | number | boolean | string[] | Record<string, unknown>;

export interface QuestionnaireState {
  currentBlockId: string;
  questionnaireHistory: string[];
  answers: Record<string, string>;
  context: Record<string, ContextValue>;
  resources: string[];
}

interface QuestionnaireStore extends QuestionnaireState {
  // Actions
  addAnswer: (question: string, answer: string) => void;
  goBack: () => void;
  reset: () => void;
  clearAnswers: () => void;
  setContext: (key: string, value: ContextValue) => void;
  addResource: (resource: string) => void;
  // Persistence
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

const initialState: QuestionnaireState = {
  currentBlockId: '',
  questionnaireHistory: [],
  answers: {},
  context: {},
  resources: [],
};

export const useQuestionnaireStore = create<QuestionnaireStore>((set) => ({
  ...initialState,

  addAnswer: (question, answer) =>
    set((state) => ({
      questionnaireHistory: [...state.questionnaireHistory, question],
      answers: { ...state.answers, [question]: answer },
    })),

  goBack: () =>
    set((state) => {
      const newHistory = state.questionnaireHistory.slice(0, -1);
      const lastQuestion = state.questionnaireHistory[state.questionnaireHistory.length - 1];
      const newAnswers = { ...state.answers };
      if (lastQuestion) {
        delete newAnswers[lastQuestion];
      }
      return {
        questionnaireHistory: newHistory,
        answers: newAnswers,
      };
    }),

  reset: () => set(initialState),

  clearAnswers: () =>
    set(() => ({
      questionnaireHistory: [],
      answers: {},
      resources: [],
    })),

  setContext: (key, value) =>
    set((state) => ({
      context: { ...state.context, [key]: value },
    })),

  addResource: (resource) =>
    set((state) => ({
      resources: [...state.resources, resource],
    })),

  saveState: async () => {
    const state = useQuestionnaireStore.getState();
    const dataToSave = {
      questionnaireHistory: state.questionnaireHistory,
      answers: state.answers,
      context: state.context,
      resources: state.resources,
      currentBlockId: state.currentBlockId,
    };
    
    try {
      const key = state.context.questionnaireId 
        ? `questionnaire_${state.context.category}_${state.context.questionnaireId}`
        : 'questionnaire_current';
      
      await AsyncStorage.setItem(key, JSON.stringify({
        ...dataToSave,
        lastModified: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving questionnaire state:', error);
    }
  },

  loadState: async () => {
    try {
      const state = useQuestionnaireStore.getState();
      const key = state.context.questionnaireId 
        ? `questionnaire_${state.context.category}_${state.context.questionnaireId}`
        : 'questionnaire_current';
      
      const savedData = await AsyncStorage.getItem(key);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        set({
          questionnaireHistory: parsed.questionnaireHistory || [],
          answers: parsed.answers || {},
          context: parsed.context || {},
          resources: parsed.resources || [],
          currentBlockId: parsed.currentBlockId || '',
        });
      }
    } catch (error) {
      console.error('Error loading questionnaire state:', error);
    }
  },
}));
