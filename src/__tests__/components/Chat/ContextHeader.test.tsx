import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContextHeader } from '../../../components/Chat/ContextHeader';
import { useQuestionnaireStore } from '../../../store/questionnaireStore';
import { useNavigation } from '@react-navigation/native';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock store
jest.mock('../../../store/questionnaireStore');

// Mock theme colors
jest.mock('../../../utils/colors', () => ({
  useThemeColors: () => ({
    card: '#ffffff',
    border: '#e0e0e0',
    text: '#000000',
    secondaryText: '#666666',
    primary: '#007AFF',
  }),
}));

describe('ContextHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  it('should not render when there are no answers', () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {},
      context: {},
    });

    const { queryByText } = render(<ContextHeader />);
    expect(queryByText(/context answer/)).toBeNull();
  });

  it('should render with answers and context', () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'What is your framework?': 'React Native',
        'Do you use TypeScript?': 'Yes',
      },
      context: {
        questionnaire: 'E2E Testing Setup',
        category: 'e2e',
        questionnaireId: 'e2e-testing',
      },
    });

    const { getByText } = render(<ContextHeader />);
    
    expect(getByText('📋 E2E Testing Setup')).toBeTruthy();
    expect(getByText(/2 context answers/)).toBeTruthy();
  });

  it('should expand and show answers when tapped', async () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'What is your framework?': 'React Native',
        'Do you use TypeScript?': 'Yes',
      },
      context: {
        questionnaire: 'E2E Testing Setup',
        category: 'e2e',
        questionnaireId: 'e2e-testing',
      },
    });

    const { getByText, queryByText } = render(<ContextHeader />);
    
    // Initially collapsed
    expect(queryByText('Q: What is your framework?')).toBeNull();
    
    // Tap to expand
    fireEvent.press(getByText('📋 E2E Testing Setup'));
    
    // Wait for animation and check expanded content
    await waitFor(() => {
      expect(getByText('Q: What is your framework?')).toBeTruthy();
      expect(getByText('A: "React Native"')).toBeTruthy();
      expect(getByText('Q: Do you use TypeScript?')).toBeTruthy();
      expect(getByText('A: "Yes"')).toBeTruthy();
      expect(getByText('Edit Answers')).toBeTruthy();
    });
  });

  it('should navigate to Questionnaire with correct params when Edit Answers is pressed', async () => {
    const mockAnswers = {
      'What is your framework?': 'React Native',
    };
    const mockContext = {
      questionnaire: 'E2E Testing Setup',
      category: 'e2e',
      questionnaireId: 'e2e-testing',
    };

    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: mockAnswers,
      context: mockContext,
    });

    const { getByText } = render(<ContextHeader />);
    
    // Expand to show Edit button
    fireEvent.press(getByText('📋 E2E Testing Setup'));
    
    await waitFor(() => {
      expect(getByText('Edit Answers')).toBeTruthy();
    });
    
    // Press Edit Answers button
    fireEvent.press(getByText('Edit Answers'));
    
    // Verify navigation was called with correct params
    expect(mockNavigate).toHaveBeenCalledWith('Questionnaire', {
      categoryPath: 'e2e',
      questionnaireId: 'e2e-testing',
      editMode: true,
    });
  });

  it('should handle missing questionnaireId gracefully', async () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'Some question': 'Some answer',
      },
      context: {
        questionnaire: 'Test Questionnaire',
        category: 'test',
        // Missing questionnaireId
      },
    });

    const { getByText } = render(<ContextHeader />);
    
    // Expand
    fireEvent.press(getByText('📋 Test Questionnaire'));
    
    await waitFor(() => {
      expect(getByText('Edit Answers')).toBeTruthy();
    });
    
    // Press Edit Answers - should not navigate without questionnaireId
    fireEvent.press(getByText('Edit Answers'));
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should display single answer correctly', () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'Only question': 'Only answer',
      },
      context: {
        questionnaire: 'Single Question Test',
      },
    });

    const { getByText } = render(<ContextHeader />);
    
    // Should show "1 context answer" (singular)
    expect(getByText(/1 context answer • Tap to view/)).toBeTruthy();
  });

  it('should toggle between expand and collapse states', async () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'Question': 'Answer',
      },
      context: {
        questionnaire: 'Toggle Test',
      },
    });

    const { getByText, queryByText } = render(<ContextHeader />);
    
    // Initially shows "Tap to view"
    expect(getByText(/Tap to view/)).toBeTruthy();
    
    // Expand
    fireEvent.press(getByText('📋 Toggle Test'));
    
    await waitFor(() => {
      // Should now show "Tap to collapse"
      expect(getByText(/Tap to collapse/)).toBeTruthy();
      expect(getByText('Q: Question')).toBeTruthy();
    });
    
    // Collapse again
    fireEvent.press(getByText('📋 Toggle Test'));
    
    await waitFor(() => {
      // Should show "Tap to view" again
      expect(getByText(/Tap to view/)).toBeTruthy();
      expect(queryByText('Q: Question')).toBeNull();
    });
  });

  it('should handle skipped answers (empty/null values)', async () => {
    (useQuestionnaireStore as unknown as jest.Mock).mockReturnValue({
      answers: {
        'Required question': 'Answered',
        'Optional question': '',
        'Another optional': null,
      },
      context: {
        questionnaire: 'Mixed Answers Test',
      },
    });

    const { getByText, getAllByText } = render(<ContextHeader />);
    
    // Expand
    fireEvent.press(getByText('📋 Mixed Answers Test'));
    
    await waitFor(() => {
      expect(getByText('A: "Answered"')).toBeTruthy();
      // Empty and null answers should show as (skipped) - there should be 2 of them
      const skippedAnswers = getAllByText('A: (skipped)');
      expect(skippedAnswers).toHaveLength(2);
    });
  });
});