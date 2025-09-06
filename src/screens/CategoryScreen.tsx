import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Questionnaire } from '../types/questionnaire';
import { Category } from '../types/category';
import { questionnaireService } from '../services/questionnaireService';
import { useThemeColors } from '../utils/colors';

type RootStackParamList = {
  Category: { category: Category };
  Questionnaire: { categoryPath: string; questionnaireId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Category'>;
type CategoryRouteProp = RouteProp<RootStackParamList, 'Category'>;

export const CategoryScreen = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CategoryRouteProp>();
  const colors = useThemeColors();
  const { category } = route.params;

  useEffect(() => {
    loadQuestionnaires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const loadQuestionnaires = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getQuestionnaires(category.path);
      setQuestionnaires(data);
    } catch (error) {
      console.error('Error loading questionnaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnairePress = (questionnaire: Questionnaire) => {
    navigation.navigate('Questionnaire', { 
      categoryPath: category.path, 
      questionnaireId: questionnaire.id 
    });
  };

  const renderQuestionnaire = ({ item }: { item: Questionnaire }) => (
    <TouchableOpacity
      style={[styles.questionnaireCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleQuestionnairePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.questionnaireContent}>
        <Text style={[styles.questionnaireTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.questionnaireDescription, { color: colors.placeholder }]}>
          {item.description}
        </Text>
        {item.metadata && (
          <View style={styles.metadata}>
            {item.metadata.estimatedTime && (
              <View style={[styles.metadataChip, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.metadataText, { color: colors.primary }]}>
                  ⏱ {item.metadata.estimatedTime}
                </Text>
              </View>
            )}
            {item.metadata.difficulty && (
              <View style={[styles.metadataChip, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={[styles.metadataText, { color: colors.secondary }]}>
                  📊 {item.metadata.difficulty}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.arrow}>
        <Text style={[styles.arrowText, { color: colors.placeholder }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.placeholder }]}>Loading questionnaires...</Text>
      </View>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.text }]}>📝</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Questionnaires</Text>
        <Text style={[styles.emptyDescription, { color: colors.placeholder }]}>
          No questionnaires available in this category yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.categoryIcon, { color: colors.text }]}>{category.icon}</Text>
        <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
        <Text style={[styles.categoryDescription, { color: colors.placeholder }]}>
          {category.description}
        </Text>
      </View>
      <FlatList
        data={questionnaires}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestionnaire}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
  },
  questionnaireCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionnaireContent: {
    flex: 1,
  },
  questionnaireTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  questionnaireDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metadataChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrow: {
    marginLeft: 10,
  },
  arrowText: {
    fontSize: 32,
    fontWeight: '300',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});