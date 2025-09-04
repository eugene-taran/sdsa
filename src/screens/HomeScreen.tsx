import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../types/navigation';

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const topics = [
    {
      id: 'e2e-testing',
      title: 'End-to-End Testing',
      description: 'Set up comprehensive E2E testing',
    },
    {
      id: 'react-setup',
      title: 'React Project Setup',
      description: 'Configure a new React project',
    },
    { id: 'ci-cd', title: 'CI/CD Pipeline', description: 'Build automated deployment pipelines' },
    { id: 'docker', title: 'Docker Configuration', description: 'Containerize your application' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SDSA</Text>
        <Text style={styles.subtitle}>Software Development Smart Assist</Text>
      </View>

      <View style={styles.topicsContainer}>
        <Text style={styles.sectionTitle}>Choose a Learning Journey</Text>
        {topics.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={styles.topicCard}
            onPress={() => navigation.navigate('Journey', { topicId: topic.id })}
          >
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  topicsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  topicCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
  },
});
