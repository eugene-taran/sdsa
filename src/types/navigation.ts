import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Questionnaire: { 
    categoryPath: string;
    questionnaireId: string;
    editMode?: boolean;
  };
  Resource: { resourcePath: string };
  Chat: { 
    contextUpdated?: boolean;
  } | undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type QuestionnaireScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Questionnaire'>;
export type QuestionnaireScreenRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;

// Keep deprecated aliases for backward compatibility
export type JourneyScreenNavigationProp = QuestionnaireScreenNavigationProp;
export type JourneyScreenRouteProp = QuestionnaireScreenRouteProp;
export type ResourceScreenRouteProp = RouteProp<RootStackParamList, 'Resource'>;
export type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
