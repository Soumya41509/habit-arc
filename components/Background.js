import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export function Background({ children, style, showGlows = true }) {
    const { isDark, colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }, style]}>
            {/* Base Background Gradient */}
            <LinearGradient
                colors={
                    isDark
                        ? ['#12131A', '#161722', '#12131A']
                        : ['#FAF8FF', '#F2F3FF', '#FAF8FF']
                }
                style={StyleSheet.absoluteFill}
            />

            {/* Ambient Aura Glow Orbs */}
            {showGlows && (
                <>
                    <View
                        style={[
                            styles.glowTop,
                            {
                                backgroundColor: isDark ? 'rgba(155, 138, 251, 0.09)' : 'rgba(229, 222, 255, 0.65)',
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.glowBottom,
                            {
                                backgroundColor: isDark ? 'rgba(101, 218, 190, 0.08)' : 'rgba(131, 247, 218, 0.45)',
                            },
                        ]}
                    />
                </>
            )}

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glowTop: {
        position: 'absolute',
        top: -60,
        left: -60,
        width: 280,
        height: 280,
        borderRadius: 140,
    },
    glowBottom: {
        position: 'absolute',
        bottom: -40,
        right: -40,
        width: 260,
        height: 260,
        borderRadius: 130,
    },
});
