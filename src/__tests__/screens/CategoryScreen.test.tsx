import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { CategoryScreen } from '../../screens/CategoryScreen';
import { questionnaireService } from '../../services/questionnaireService';

// Mock the navigation
const mockNavigate = jest.fn();
const mockRoute = {
  params: {
    category: {
      id: 'cicd',
      name: 'CI/CD & DevOps',
      path: 'cicd',
    },
  },
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => mockRoute,
}));

// Mock the questionnaire service
jest.mock('../../services/questionnaireService');

describe('CategoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render category name in header', async () => {
    // Mock with at least one questionnaire to see the header
    (questionnaireService.getQuestionnaires as jest.Mock).mockResolvedValue([
      {
        id: 'test',
        title: 'Test Questionnaire',
        description: 'Test',
        questions: [],
      }
    ]);

    const { getByText } = render(
      <NavigationContainer>
        <CategoryScreen />
      </NavigationContainer>
    );

    // Wait for loading to complete and category name to be displayed
    await waitFor(() => {
      expect(getByText('CI/CD & DevOps')).toBeTruthy();
    });
  });

  it('should display questionnaires from the category', async () => {
    const mockQuestionnaires = [
      {
        id: 'cicd-pipeline',
        title: 'CI/CD Pipeline Configuration',
        description: 'Set up your continuous integration and deployment pipeline',
        questions: [],
      },
    ];

    (questionnaireService.getQuestionnaires as jest.Mock).mockResolvedValue(
      mockQuestionnaires
    );

    const { getByText } = render(
      <NavigationContainer>
        <CategoryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('CI/CD Pipeline Configuration')).toBeTruthy();
      expect(getByText('Set up your continuous integration and deployment pipeline')).toBeTruthy();
    });
  });

  it('should navigate to questionnaire when item is pressed', async () => {
    const mockQuestionnaires = [
      {
        id: 'cicd-pipeline',
        title: 'CI/CD Pipeline Configuration',
        description: 'Set up your CI/CD pipeline',
        questions: [],
      },
    ];

    (questionnaireService.getQuestionnaires as jest.Mock).mockResolvedValue(
      mockQuestionnaires
    );

    const { getByText } = render(
      <NavigationContainer>
        <CategoryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      const questionnaireItem = getByText('CI/CD Pipeline Configuration');
      fireEvent.press(questionnaireItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('Questionnaire', {
      categoryPath: 'cicd',
      questionnaireId: 'cicd-pipeline',
    });
  });

  it('should handle empty questionnaire list', async () => {
    (questionnaireService.getQuestionnaires as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <NavigationContainer>
        <CategoryScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('No Questionnaires')).toBeTruthy();
    });
  });

  it('should handle error when loading questionnaires', async () => {
    (questionnaireService.getQuestionnaires as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    const { getByText } = render(
      <NavigationContainer>
        <CategoryScreen />
      </NavigationContainer>
    );

    // When there's an error, it shows the empty state
    await waitFor(() => {
      expect(getByText('No Questionnaires')).toBeTruthy();
    });
  });
});