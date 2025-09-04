import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Journey: { topicId: string };
  Resource: { resourcePath: string };
  Chat: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type JourneyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Journey'>;
export type JourneyScreenRouteProp = RouteProp<RootStackParamList, 'Journey'>;
export type ResourceScreenRouteProp = RouteProp<RootStackParamList, 'Resource'>;
export type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;
