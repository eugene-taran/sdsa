export interface KnowledgeBlock {
  id: string;
  title: string;
  initial_question: string;
  paths: Record<string, Path>;
  context_variables?: string[];
}

export interface Path {
  question?: string;
  options?: string[];
  next?: string;
  resources?: string[];
}

export type ContextValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ContextValue[]
  | { [key: string]: ContextValue };

export interface QuestionnaireState {
  currentBlockId: string;
  questionnaireHistory: string[];
  answers: Record<string, string>;
  context: Record<string, ContextValue>;
  resources: string[];
}

// Keep JourneyState as deprecated alias for backward compatibility
export type JourneyState = QuestionnaireState;
