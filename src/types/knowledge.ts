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

export interface JourneyState {
  currentBlockId: string;
  path: string[];
  answers: Record<string, string>;
  context: Record<string, ContextValue>;
  resources: string[];
}
