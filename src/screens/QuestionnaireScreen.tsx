import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, useColorScheme } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useJourneyStore } from '../store/journeyStore';
import { JourneyScreenNavigationProp } from '../types/navigation';
import { questionnaireService } from '../services/questionnaireService';
import { Questionnaire, Question } from '../types/questionnaire';
import { useThemeColors } from '../utils/colors';

type RootStackParamList = {
  Questionnaire: { categoryPath: string; questionnaireId: string };
};

type QuestionnaireRouteProp = RouteProp<RootStackParamList, 'Questionnaire'>;

export const QuestionnaireScreen = () => {
  const navigation = useNavigation<JourneyScreenNavigationProp>();
  const route = useRoute<QuestionnaireRouteProp>();
  const { categoryPath, questionnaireId } = route.params;
  const { addAnswer, setContext, clearAnswers } = useJourneyStore();
  const colors = useThemeColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [journey, setJourney] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestionnaire();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryPath, questionnaireId]);

  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      setError(null);
      clearAnswers();
      const data = await questionnaireService.getQuestionnaire(categoryPath, questionnaireId);
      if (data) {
        setQuestionnaire(data);
        setContext('questionnaire', data.title);
        setContext('category', categoryPath);
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

  const handleAnswer = (answer: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const newJourney = [...journey, answer];
    setJourney(newJourney);

    // Store in global state
    addAnswer(currentQuestion.label, answer);

    // Check if journey is complete
    if (currentQuestionIndex >= (questionnaire?.questions.length || 0) - 1) {
      setIsComplete(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      const newJourney = journey.slice(0, -1);
      setJourney(newJourney);
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressBar, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {!isComplete && currentQuestion && (
        <View style={[styles.questionContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.questionNumber, { color: colors.secondaryText }]}>
            Question {currentQuestionIndex + 1} of {questionnaire.questions.length}
          </Text>
          <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.label}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: isDark ? '#2c2c2e' : '#f0f0f0' }]}
                onPress={() => handleAnswer(typeof option === 'string' ? option : option.label)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {typeof option === 'string' ? option : option.label}
                </Text>
                {typeof option !== 'string' && option.hasTextInput && (
                  <Text style={[styles.optionDescription, { color: colors.secondaryText }]}>
                    {option.textInputPlaceholder || 'Additional details'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {currentQuestionIndex > 0 && !isComplete && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
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
          <Text style={[styles.completionTitle, { color: colors.success }]}>🎉 Questionnaire Complete!</Text>
          <Text style={[styles.completionText, { color: colors.text }]}>
            Great job completing the {questionnaire.title} questionnaire!
          </Text>
          <Text style={[styles.completionSubtext, { color: colors.secondaryText }]}>
            Based on your answers, I can now provide personalized guidance.
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.actionButtonText}>💬 Start Personalized Chat</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
