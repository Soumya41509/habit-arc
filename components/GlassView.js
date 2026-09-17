import React from 'react';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function GlassView({ children, style, intensity = 45, ...props }) {
    const { isDark, colors } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 26, 36, 0.06)',
                    backgroundColor: isDark ? 'rgba(26, 27, 34, 0.7)' : 'rgba(255, 255, 255, 0.75)',
                },
                style,
            ]}
            {...props}
        >
            {Platform.OS !== 'web' && (
                <BlurView
                    intensity={intensity}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                />
            )}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 24,
        borderWidth: 1,
    },
});
