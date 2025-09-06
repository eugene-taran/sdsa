import { create } from 'zustand';
import { JourneyState, ContextValue } from '../types/knowledge';

interface JourneyStore extends JourneyState {
  // Actions
  addAnswer: (question: string, answer: string) => void;
  goBack: () => void;
  reset: () => void;
  clearAnswers: () => void;
  setContext: (key: string, value: ContextValue) => void;
  addResource: (resource: string) => void;
}

const initialState: JourneyState = {
  currentBlockId: '',
  path: [],
  answers: {},
  context: {},
  resources: [],
};

export const useJourneyStore = create<JourneyStore>((set) => ({
  ...initialState,

  addAnswer: (question, answer) =>
    set((state) => ({
      path: [...state.path, question],
      answers: { ...state.answers, [question]: answer },
    })),

  goBack: () =>
    set((state) => {
      const newPath = state.path.slice(0, -1);
      const lastQuestion = state.path[state.path.length - 1];
      const newAnswers = { ...state.answers };
      if (lastQuestion) {
        delete newAnswers[lastQuestion];
      }
      return {
        path: newPath,
        answers: newAnswers,
      };
    }),

  reset: () => set(initialState),

  clearAnswers: () =>
    set((state) => ({
      path: [],
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
}));
