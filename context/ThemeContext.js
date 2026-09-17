import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as _useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Colors } from '../constants/Colors';

const ThemeContext = createContext({
    theme: 'system',
    isDark: false,
    colors: Colors.light,
    setTheme: () => {},
    toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'routiva_user_theme_preference';
const OLD_THEME_STORAGE_KEY = 'habitarc_user_theme_preference';

export function ThemeProvider({ children }) {
    const systemColorScheme = _useColorScheme();
    const [themePreference, setThemePreference] = useState('system');

    useEffect(() => {
        // Load saved theme preference (with migration fallback)
        (async () => {
            try {
                let saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
                if (!saved) {
                    saved = await SecureStore.getItemAsync(OLD_THEME_STORAGE_KEY);
                }
                if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                    setThemePreference(saved);
                }
            } catch (e) {
                // SecureStore unavailable in some web environments, fallback to state
            }
        })();
    }, []);

    const isDark =
        themePreference === 'dark' ||
        (themePreference === 'system' && systemColorScheme === 'dark');

    const colors = isDark ? Colors.dark : Colors.light;

    const setTheme = async (newTheme) => {
        setThemePreference(newTheme);
        try {
            await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
        } catch (e) {
            // Ignore error
        }
    };

    const toggleTheme = () => {
        const next = isDark ? 'light' : 'dark';
        setTheme(next);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme: themePreference,
                isDark,
                colors,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
