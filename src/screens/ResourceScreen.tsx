import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { knowledgeService } from '../services/knowledgeService';

interface ResourceScreenProps {
  route: {
    params: {
      resourcePath: string;
    };
  };
}

export const ResourceScreen = ({ route }: ResourceScreenProps) => {
  const { resourcePath } = route.params;
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourcePath]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const resourceContent = await knowledgeService.fetchResource(resourcePath);
      setContent(resourceContent);
    } catch (error) {
      console.error('Error loading resource:', error);
      setContent('# Error\n\nFailed to load resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading resource...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Markdown style={markdownStyles}>{content}</Markdown>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 10,
    marginTop: 20,
    color: '#000',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginBottom: 8,
    marginTop: 16,
    color: '#000',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 6,
    marginTop: 14,
    color: '#000',
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    color: '#d73a49',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f6f8fa',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  fence: {
    backgroundColor: '#f6f8fa',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  list_item: {
    marginVertical: 2,
  },
  bullet_list: {
    marginVertical: 10,
  },
  ordered_list: {
    marginVertical: 10,
  },
  blockquote: {
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    paddingLeft: 10,
    paddingVertical: 5,
    marginVertical: 10,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline' as const,
  },
  hr: {
    backgroundColor: '#e0e0e0',
    height: 1,
    marginVertical: 20,
  },
};
