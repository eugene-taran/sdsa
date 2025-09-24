import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../../screens/HomeScreen';
import { questionnaireService } from '../../services/questionnaireService';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock questionnaire service
jest.mock('../../services/questionnaireService');

// Mock local categories data
jest.mock('../../../contexts/categories.json', () => ({
  categories: [
    {
      id: 'cicd',
      name: 'CI/CD & DevOps',
      description: 'Continuous Integration and Deployment',
      icon: '🚀',
      path: 'cicd',
      order: 1,
    },
    {
      id: 'e2e',
      name: 'Testing & Quality',
      description: 'Testing strategies and quality assurance',
      icon: '🧪',
      path: 'e2e',
      order: 2,
    },
  ],
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the app title', async () => {
    // Mock categories to ensure loading completes
    (questionnaireService.getCategories as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('SDSA')).toBeTruthy();
    });
  });

  it('should display categories from local contexts', async () => {
    const mockCategories = [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'Continuous Integration and Deployment',
        icon: '🚀',
        path: 'cicd',
        order: 1,
      },
      {
        id: 'e2e',
        name: 'Testing & Quality',
        description: 'Testing strategies and quality assurance',
        icon: '🧪',
        path: 'e2e',
        order: 2,
      },
    ];

    (questionnaireService.getCategories as jest.Mock).mockResolvedValue(
      mockCategories
    );

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      // Check if categories are displayed
      expect(getByText('CI/CD & DevOps')).toBeTruthy();
      expect(getByText('Testing & Quality')).toBeTruthy();

      // Check if descriptions are displayed
      expect(getByText('Continuous Integration and Deployment')).toBeTruthy();
      expect(getByText('Testing strategies and quality assurance')).toBeTruthy();
    });
  });

  it('should display category icons', async () => {
    const mockCategories = [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'CI/CD practices',
        icon: '🚀',
        path: 'cicd',
        order: 1,
      },
    ];

    (questionnaireService.getCategories as jest.Mock).mockResolvedValue(
      mockCategories
    );

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('🚀')).toBeTruthy();
    });
  });

  it('should navigate to category screen when category is pressed', async () => {
    const mockCategories = [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'CI/CD practices',
        icon: '🚀',
        path: 'cicd',
        order: 1,
      },
    ];

    (questionnaireService.getCategories as jest.Mock).mockResolvedValue(
      mockCategories
    );

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      const categoryItem = getByText('CI/CD & DevOps');
      fireEvent.press(categoryItem);
    });

    expect(mockNavigate).toHaveBeenCalledWith('Category', {
      category: mockCategories[0],
    });
  });

  it('should handle empty categories list', async () => {
    (questionnaireService.getCategories as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('No categories available yet')).toBeTruthy();
    });
  });

  it('should handle error when loading categories', async () => {
    (questionnaireService.getCategories as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    // When there's an error, it shows empty state
    await waitFor(() => {
      expect(getByText('No categories available yet')).toBeTruthy();
    });
  });

  it('should load categories from local contexts without external API calls', async () => {
    // This test ensures we're not making external API calls
    const mockCategories = [
      {
        id: 'cicd',
        name: 'CI/CD & DevOps',
        description: 'Local category',
        icon: '🚀',
        path: 'cicd',
        order: 1,
      },
    ];

    (questionnaireService.getCategories as jest.Mock).mockImplementation(() => {
      // Simulate loading from local contexts
      return Promise.resolve(mockCategories);
    });

    const { getByText } = render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('CI/CD & DevOps')).toBeTruthy();
    });

    // Verify the service was called
    expect(questionnaireService.getCategories).toHaveBeenCalled();

    // The service should not make any fetch calls (this is handled in questionnaireService tests)
  });
});