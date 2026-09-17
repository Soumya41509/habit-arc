import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
  const [activeScheme, setActiveScheme] = useState(systemScheme);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      setActiveScheme(systemScheme);
    } else {
      setActiveScheme(theme);
    }
  }, [theme, systemScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme', error);
    }
  };

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    await AsyncStorage.setItem('app_theme', newTheme);
  };

  const colors = {
    light: {
      // Backgrounds
      background: '#F4F7FE',
      card: '#FFFFFF',

      // Glass effects
      glass: 'rgba(255, 255, 255, 0.7)',
      glassBorder: 'rgba(255, 255, 255, 0.9)',

      // Brand colors
      primary: '#6366F1',
      secondary: '#A78BFA',
      accent: '#34D399',
      danger: '#EF4444',
      warning: '#F59E0B',

      // Text
      text: '#0F172A',
      subtext: '#64748B',

      // Gradients
      gradientStart: '#6366F1',
      gradientEnd: '#A78BFA',
    },
    dark: {
      // Backgrounds - FULL BLACK
      background: '#000000',
      card: '#0A0A0A',

      // Glass effects - dark frosted
      glass: 'rgba(10, 10, 10, 0.8)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',

      // Brand colors - brighter for dark mode
      primary: '#818CF8',
      secondary: '#A78BFA',
      accent: '#6366F1',
      danger: '#EF4444',
      warning: '#F59E0B',

      // Text
      text: '#FFFFFF',
      subtext: '#94A3B8',

      // Gradients
      gradientStart: '#818CF8',
      gradientEnd: '#A78BFA',
    },
  };

  const themeColors = activeScheme === 'dark' ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      colors: themeColors,
      isDark: activeScheme === 'dark'
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
