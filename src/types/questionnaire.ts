/**
 * Questionnaire type definitions
 */

export interface Option {
  value: string;
  label: string;
  hasTextInput?: boolean;
  textInputPlaceholder?: string;
}

export interface Question {
  type: 'radio' | 'checkbox' | 'text' | 'textarea';
  label: string;
  placeholder?: string;
  options?: Option[];
}

export interface LLMConfig {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface QuestionnaireMetadata {
  author?: string;
  version?: string;
  estimatedTime?: string;
  difficulty?: string;
  tags?: string[];
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  llmConfig: LLMConfig;
  metadata?: QuestionnaireMetadata;
}

export interface Answer {
  questionIndex: number;
  type: string;
  value: string | string[];
  customText?: string;
}

export interface QuestionnaireSession {
  questionnaireId: string;
  categoryId: string;
  answers: Answer[];
  startedAt: Date;
  completedAt?: Date;
}