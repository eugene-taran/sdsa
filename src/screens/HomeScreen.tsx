import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Category } from '../types/category';
import { questionnaireService } from '../services/questionnaireService';
import { useThemeColors } from '../utils/colors';

type RootStackParamList = {
  Home: undefined;
  Category: { category: Category };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export const HomeScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await questionnaireService.getCategories();
      setCategories(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Category', { category });
  };

  const renderCategory = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        isTablet && styles.categoryCardTablet,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryIconContainer}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
      </View>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryTitle, { color: colors.text }]}>
          {category.name}
        </Text>
        <Text style={[styles.categoryDescription, { color: colors.placeholder }]}>
          {category.description}
        </Text>
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
        <Text style={[styles.loadingText, { color: colors.placeholder }]}>
          Loading categories...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primary }]}>SDSA</Text>
        <Text style={[styles.subtitle, { color: colors.placeholder }]}>
          Software Development Smart Assist
        </Text>
        <Text style={[styles.tagline, { color: colors.text }]}>
          🤖 Powered by Gemini AI
        </Text>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Choose a Category
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.placeholder }]}>
          Start your learning journey with guided questionnaires
        </Text>
        
        <View style={[styles.categoriesGrid, isTablet && styles.categoriesGridTablet]}>
          {categories.map(renderCategory)}
        </View>

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.placeholder }]}>📚</Text>
            <Text style={[styles.emptyText, { color: colors.placeholder }]}>
              No categories available yet
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'column',
  },
  categoriesGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryCardTablet: {
    width: '48%',
    marginHorizontal: '1%',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '300',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});