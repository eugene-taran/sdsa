import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useThemeColors } from '../../utils/colors';
import { useNavigation } from '@react-navigation/native';
import { QuestionnaireScreenNavigationProp } from '../../types/navigation';

export const ContextHeader = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animationValue = useState(new Animated.Value(0))[0];
  
  const { answers, context } = useQuestionnaireStore();
  const navigation = useNavigation<QuestionnaireScreenNavigationProp>();
  const colors = useThemeColors();

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.spring(animationValue, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const handleEditAnswers = () => {
    const categoryPath = context.category as string;
    const questionnaireId = context.questionnaireId as string;
    
    if (categoryPath && questionnaireId) {
      navigation.navigate('Questionnaire', {
        topicId: questionnaireId,
        // @ts-ignore - we'll add this param to navigation types
        categoryPath,
        editMode: true,
      });
    }
  };

  const answerCount = Object.keys(answers).length;
  const questionnaireName = String(context.questionnaire || 'Questionnaire');

  if (answerCount === 0) {
    return null; // Don't show header if no context
  }

  const maxHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 400],
  });

  const rotation = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          maxHeight,
        }
      ]}
    >
      <TouchableOpacity 
        onPress={toggleExpanded}
        activeOpacity={0.7}
        style={styles.headerRow}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>
            📋 {questionnaireName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {answerCount} context answer{answerCount !== 1 ? 's' : ''} • Tap to {isExpanded ? 'collapse' : 'view'}
          </Text>
        </View>
        <Animated.Text 
          style={[
            styles.chevron, 
            { 
              color: colors.secondaryText,
              transform: [{ rotate: rotation }]
            }
          ]}
        >
          ▼
        </Animated.Text>
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView 
          style={styles.expandedContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(answers).map(([question, answer], index) => (
            <View key={index} style={styles.answerItem}>
              <Text style={[styles.question, { color: colors.secondaryText }]}>
                Q: {question}
              </Text>
              <Text style={[styles.answer, { color: colors.text }]}>
                A: {answer ? JSON.stringify(answer) : '(skipped)'}
              </Text>
            </View>
          ))}
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={handleEditAnswers}
          >
            <Text style={styles.editButtonText}>Edit Answers</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 60,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 16,
    marginLeft: 8,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 14,
    marginBottom: 4,
  },
  answer: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});