import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

export default function GlassView({ children, style, intensity = 50 }) {
    const { colors, isDark } = useTheme();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
                shadowColor: isDark ? '#000' : '#888',
            },
            style
        ]}>
            <BlurView intensity={intensity} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
            <View style={{ zIndex: 1 }}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
});
