import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Category: {
    category: {
      id: string;
      name: string;
      path: string;
    };
  };
  Questionnaire: {
    categoryPath: string;
    questionnaireId: string;
    editMode?: boolean;
  };
  Chat: {
    contextUpdated?: boolean;
  } | undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type CategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Category'>;
export type CategoryScreenRouteProp = RouteProp<RootStackParamList, 'Category'>;
export type QuestionnaireScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Questionnaire'>;
export type QuestionnaireScreenRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;

// Keep deprecated aliases for backward compatibility
export type JourneyScreenNavigationProp = QuestionnaireScreenNavigationProp;
export type JourneyScreenRouteProp = QuestionnaireScreenRouteProp;
export type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
