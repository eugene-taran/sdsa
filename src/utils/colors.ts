/**
 * Color theme utilities for dark mode support
 */

import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    secondaryText: '#666666',
    background: '#FFFFFF',
    card: '#F5F5F5',
    border: '#E0E0E0',
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    placeholder: '#999999',
    disabled: '#CCCCCC',
    link: '#007AFF',
    shadow: '#000000',
  },
  dark: {
    text: '#FFFFFF',
    secondaryText: '#999999',
    background: '#000000',
    card: '#1C1C1E',
    border: '#38383A',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    success: '#32D74B',
    warning: '#FF9F0A',
    error: '#FF453A',
    placeholder: '#8E8E93',
    disabled: '#48484A',
    link: '#0A84FF',
    shadow: '#000000',
  },
};

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme === 'dark' ? 'dark' : 'light'];
}

export function useIsDarkMode() {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark';
}