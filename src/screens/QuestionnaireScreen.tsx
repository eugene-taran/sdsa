import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { QuestionnaireScreenNavigationProp } from '../types/navigation';
import { questionnaireService } from '../services/questionnaireService';
import { Questionnaire, Question } from '../types/questionnaire';
import { useThemeColors } from '../utils/colors';

type RootStackParamList = {
  Questionnaire: { categoryPath: string; questionnaireId: string };
};

type QuestionnaireRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;

export const QuestionnaireScreen = () => {
  const navigation = useNavigation<QuestionnaireScreenNavigationProp>();
  const route = useRoute<QuestionnaireRouteProp>();
  const { categoryPath, questionnaireId } = route.params;
  // Read editMode directly from route params (type-safe check)
  const isEditMode = 'editMode' in route.params && route.params.editMode === true;
  const questionnaireStore = useQuestionnaireStore();
  const { addAnswer, setContext, clearAnswers, answers: existingAnswers, saveState } = questionnaireStore;
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [journey, setJourney] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState<string>('');

  useEffect(() => {
    loadQuestionnaire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryPath, questionnaireId]);

  // Initialize edit mode state when questionnaire loads
  useEffect(() => {
    if (isEditMode && questionnaire && existingAnswers && Object.keys(existingAnswers).length > 0) {
      // Map questions to their corresponding answers to maintain correct order
      const restoredJourney = questionnaire.questions.map(question => 
        existingAnswers[question.label] || ''
      );
      
      // Reset to start of questionnaire for editing
      setJourney(restoredJourney);
      setCurrentQuestionIndex(0);
      setIsComplete(false);
      
      // Pre-fill text input for the first question if it's a text type
      const firstQuestion = questionnaire.questions[0];
      if (firstQuestion && (firstQuestion.type === 'text' || firstQuestion.type === 'textarea')) {
        const firstAnswer = existingAnswers[firstQuestion.label] || '';
        setTextInputValue(firstAnswer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, questionnaire]); // Only depend on editMode and questionnaire loading

  useEffect(() => {
    // Pre-fill text input with previous answer when navigating questions in edit mode
    if (isEditMode && journey.length > 0 && currentQuestionIndex < journey.length) {
      const currentQuestion = questionnaire?.questions[currentQuestionIndex];
      if (currentQuestion && (currentQuestion.type === 'text' || currentQuestion.type === 'textarea')) {
        setTextInputValue(journey[currentQuestionIndex] || '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, isEditMode]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!isEditMode) {
        clearAnswers();
      }
      const data = await questionnaireService.getQuestionnaire(categoryPath, questionnaireId);
      if (data) {
        setQuestionnaire(data);
        setContext('questionnaire', data.title);
        setContext('category', categoryPath);
        setContext('questionnaireId', questionnaireId);
      } else {
        setError('Questionnaire not found');
      }
    } catch (err) {
      console.error('Error loading questionnaire:', err);
      setError('Failed to load questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuestion = (): Question | null => {
    if (!questionnaire || currentQuestionIndex >= questionnaire.questions.length) {
      return null;
    }
    return questionnaire.questions[currentQuestionIndex];
  };

  const handleAnswer = async (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    let newJourney: string[];
    if (isEditMode) {
      // In edit mode, replace the answer at current index
      newJourney = [...journey];
      newJourney[currentQuestionIndex] = answer;
    } else {
      // In normal mode, append the answer
      newJourney = [...journey, answer];
    }
    setJourney(newJourney);

    // Store in global state
    addAnswer(currentQuestion.label, answer);
    
    // Auto-save after each answer
    await saveState();

    // Check if journey is complete
    if (currentQuestionIndex >= (questionnaire?.questions.length || 0) - 1) {
      // In edit mode, don't auto-complete - user needs to explicitly finish
      if (!isEditMode) {
        setIsComplete(true);
      } else {
        // In edit mode, stay on last question until user explicitly completes
        // They can navigate back or press a "Finish Editing" button
        setCurrentQuestionIndex((questionnaire?.questions.length || 1) - 1);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Clear text input for next question if not in edit mode
      if (!isEditMode) {
        setTextInputValue('');
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      if (!isEditMode) {
        // In normal mode, remove the last answer
        const newJourney = journey.slice(0, -1);
        setJourney(newJourney);
      }
      // In edit mode, journey stays intact, just navigate
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setIsComplete(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading questionnaire...</Text>
      </View>
    );
  }

  if (error || !questionnaire) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Questionnaire not found'}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadQuestionnaire}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = ((currentQuestionIndex + 1) / questionnaire.questions.length) * 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressBar, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}>
        <View style={[
          styles.progressFill, 
          { 
            width: `${progress}%`,
            backgroundColor: isEditMode ? colors.warning || '#FFA500' : '#4CAF50'
          }
        ]} />
      </View>
      {isEditMode && (
        <View style={[styles.editModeIndicator, { backgroundColor: colors.warning || '#FFA500' }]}>
          <Text style={styles.editModeText}>✏️ Edit Mode - Update Your Answers</Text>
        </View>
      )}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
      {!isComplete && currentQuestion && (
        <View style={[styles.questionContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.questionNumber, { color: colors.secondaryText }]}>
            {isEditMode ? '✏️ ' : ''}Question {currentQuestionIndex + 1} of {questionnaire.questions.length}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.label}</Text>

          {currentQuestion.type === 'text' || currentQuestion.type === 'textarea' ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  currentQuestion.type === 'textarea' && styles.textArea,
                  { 
                    backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0',
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder={currentQuestion.placeholder || 'Enter your answer'}
                placeholderTextColor={colors.placeholder}
                value={textInputValue}
                onChangeText={setTextInputValue}
                multiline={currentQuestion.type === 'textarea'}
                numberOfLines={currentQuestion.type === 'textarea' ? 4 : 1}
              />
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  handleAnswer(textInputValue.trim() || '');
                  setTextInputValue('');
                }}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => {
                const optionValue = typeof option === 'string' ? option : option.label;
                const isSelected = isEditMode && journey[currentQuestionIndex] === optionValue;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton, 
                      { 
                        backgroundColor: isSelected 
                          ? colors.primary + '20' 
                          : isDark ? '#2c2c2e' : '#f0f0f0',
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? colors.primary : undefined,
                      }
                    ]}
                    onPress={() => handleAnswer(optionValue)}
                  >
                    <Text style={[styles.optionText, { color: colors.text }]}>
                      {optionValue}
                    </Text>
                    {typeof option !== 'string' && option.hasTextInput && (
                      <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>
                        {option.textInputPlaceholder || 'Additional details'}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {currentQuestionIndex > 0 && !isComplete && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
      )}

      {isEditMode && currentQuestionIndex === (questionnaire?.questions.length || 0) - 1 && !isComplete && (
        <TouchableOpacity 
          style={[styles.finishEditButton, { backgroundColor: colors.success }]}
          onPress={() => setIsComplete(true)}
        >
          <Text style={styles.finishEditButtonText}>✅ Finish Editing</Text>
        </TouchableOpacity>
      )}

      {journey.length > 0 && (
        <View style={[styles.journeyPath, { backgroundColor: colors.card }]}>
          <Text style={[styles.pathTitle, { color: colors.text }]}>Your Journey:</Text>
          {journey.map((step, index) => {
            const question = questionnaire.questions[index];
            return (
              <View key={index} style={styles.pathItem}>
                <Text style={[styles.pathQuestion, { color: colors.secondaryText }]}>
                  {question?.label}
                </Text>
                <Text style={[styles.pathAnswer, { color: colors.text }]}>
                  → {step}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {isComplete && (
        <View style={[styles.completionContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.completionTitle, { color: colors.success }]}>
            {isEditMode ? '✅ Context Updated!' : '🎉 Questionnaire Complete!'}
          </Text>
          <Text style={[styles.completionText, { color: colors.text }]}>
            {isEditMode 
              ? `Your answers have been updated for ${questionnaire.title}.`
              : `Great job completing the ${questionnaire.title} questionnaire!`
            }
          </Text>
          <Text style={[styles.completionSubtext, { color: colors.secondaryText }]}>
            {isEditMode
              ? 'Return to chat with your updated context.'
              : 'Based on your answers, I can now provide personalized guidance.'
            }
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Chat', { contextUpdated: !!isEditMode })}
          >
            <Text style={styles.actionButtonText}>
              {isEditMode ? '💬 Resume Chat' : '💬 Start Personalized Chat'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>← Back to Categories</Text>
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  questionContainer: {
    padding: 20,
    margin: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
  },
  textInput: {
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginHorizontal: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  journeyPath: {
    padding: 20,
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pathItem: {
    marginBottom: 12,
  },
  pathQuestion: {
    fontSize: 14,
    marginBottom: 4,
  },
  pathAnswer: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  completionContainer: {
    padding: 24,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 17,
    marginBottom: 8,
    textAlign: 'center',
  },
  completionSubtext: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center',
  },
  actionButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editModeIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  finishEditButton: {
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  finishEditButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
