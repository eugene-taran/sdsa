import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJourneyStore } from '../store/journeyStore';
import { JourneyScreenNavigationProp } from '../types/navigation';

export const JourneyScreen = () => {
  const navigation = useNavigation<JourneyScreenNavigationProp>();
  const { addAnswer, setContext } = useJourneyStore();
  const [currentQuestion, setCurrentQuestion] = useState({
    text: 'Do you have an existing test system?',
    options: ['Yes', 'No'],
  });
  const [journey, setJourney] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (answer: string) => {
    const newJourney = [...journey, answer];
    setJourney(newJourney);

    // Store in global state
    addAnswer(currentQuestion.text, answer);
    setContext('currentTopic', 'E2E Testing');

    // This will be replaced with actual knowledge block navigation
    if (newJourney.length >= 3) {
      // Journey complete, show options
      setIsComplete(true);
    } else if (answer === 'Yes') {
      setCurrentQuestion({
        text: 'Which framework are you using?',
        options: ['Cypress', 'Playwright', 'Selenium', 'Other'],
      });
    } else {
      setCurrentQuestion({
        text: "What's your primary application type?",
        options: ['Web', 'Mobile', 'Desktop'],
      });
    }
  };

  const handleBack = () => {
    if (journey.length > 0) {
      const newJourney = journey.slice(0, -1);
      setJourney(newJourney);
      // Reset to appropriate question based on journey
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(journey.length + 1) * 20}%` }]} />
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {journey.length > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      <View style={styles.journeyPath}>
        <Text style={styles.pathTitle}>Your Journey:</Text>
        {journey.map((step, index) => (
          <Text key={index} style={styles.pathStep}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>

      {isComplete && (
        <View style={styles.completionContainer}>
          <Text style={styles.completionTitle}>Journey Complete!</Text>
          <Text style={styles.completionText}>
            Based on your answers, here are your next steps:
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('Resource', {
                resourcePath: 'getting-started-with-e2e.md',
              })
            }
          >
            <Text style={styles.actionButtonText}>📚 View Resources</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.actionButtonText}>💬 Chat with AI Assistant</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  questionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  backButton: {
    marginHorizontal: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  journeyPath: {
    padding: 20,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  pathStep: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginBottom: 5,
  },
  completionContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
