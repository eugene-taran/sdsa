import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../utils/colors';
import { geminiService } from '../services/geminiService';

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    const checkExistingKey = async () => {
      if (visible) {
        const storedKey = await geminiService.getStoredApiKey();
        setHasExistingKey(!!storedKey);
        if (storedKey) {
          // Show masked version of existing key
          setApiKey(''); // Keep it empty for security
        }
      }
    };
    checkExistingKey();
  }, [visible]);

  const handleGetApiKey = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }

    setLoading(true);
    try {
      // Store and initialize with the API key
      await geminiService.storeApiKey(apiKey.trim());
      Alert.alert('Success', 'API key saved successfully!');
      onSuccess();
      setApiKey('');
    } catch {
      Alert.alert(
        'Error',
        'Failed to save API key. Please check if it\'s valid and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (hasExistingKey) {
      onClose();
    } else {
      Alert.alert(
        'Skip API Key?',
        'Without an API key, AI features will not work. You can add it later in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip', onPress: onClose },
        ]
      );
    }
  };

  const handleClearKey = () => {
    Alert.alert(
      'Clear API Key?',
      'This will remove your stored API key. You\'ll need to enter it again to use AI features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await geminiService.clearApiKey();
            setHasExistingKey(false);
            setApiKey('');
            Alert.alert('Success', 'API key has been removed');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleSkip}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {hasExistingKey ? 'API Key Settings' : 'Welcome to SDSA! 🚀'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.text }]}>
            {hasExistingKey
              ? 'Your API key is configured. Enter a new key to update it.'
              : 'To use AI features, please enter your Gemini API key'}
          </Text>

          <TouchableOpacity
            onPress={handleGetApiKey}
            style={[styles.linkButton]}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Get your free API key →
            </Text>
          </TouchableOpacity>

          {hasExistingKey && (
            <View style={[styles.statusContainer, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                API Key is configured
              </Text>
            </View>
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder={hasExistingKey ? "Enter new API key to update..." : "Enter your Gemini API key..."}
            placeholderTextColor={colors.text + '60'}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            editable={!loading}
          />

          <View style={styles.buttonContainer}>
            {hasExistingKey ? (
              <TouchableOpacity
                onPress={handleClearKey}
                style={[styles.button, styles.skipButton, { backgroundColor: colors.error + '20' }]}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.error }]}>
                  Clear Key
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSkip}
                style={[styles.button, styles.skipButton]}
                disabled={loading}
              >
                <Text style={[styles.buttonText, { color: colors.text + '80' }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={apiKey.trim() ? handleSave : handleSkip}
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: apiKey.trim() ? colors.primary : colors.card },
              ]}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: apiKey.trim() ? '#FFFFFF' : colors.text }]}>
                {loading ? 'Saving...' : apiKey.trim() ? 'Update Key' : hasExistingKey ? 'Close' : 'Skip'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.note, { color: colors.text + '60' }]}>
            Your API key is stored securely on your device and never sent to our servers.
            {'\n'}Free tier: 15 requests/min, 1M tokens/month
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    pointerEvents: 'box-none',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    pointerEvents: 'auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  linkButton: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  skipButton: {
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});