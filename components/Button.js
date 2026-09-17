import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function Button({
    title,
    onPress,
    variant = 'primary', // 'primary' | 'secondary' | 'ghost'
    icon,
    loading = false,
    style,
    textStyle,
    children,
}) {
    const { isDark, colors } = useTheme();

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={loading}
                activeOpacity={0.88}
                style={[styles.basePill, styles.primaryShadow, style]}
            >
                <LinearGradient
                    colors={
                        isDark
                            ? ['#9B8AFB', '#7C67EE']
                            : ['#9B8AFB', '#6A9CFD']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientContent}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <View style={styles.row}>
                            {children ? (
                                children
                            ) : (
                                <>
                                    <Text style={[styles.primaryText, textStyle]}>{title}</Text>
                                    {icon && (
                                        typeof icon === 'string' ? (
                                            <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.icon} />
                                        ) : (
                                            icon
                                        )
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    if (variant === 'secondary') {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={loading}
                activeOpacity={0.85}
                style={[
                    styles.basePill,
                    {
                        backgroundColor: isDark ? colors.surfaceContainerLow : colors.surfaceContainerLow,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 26, 36, 0.06)',
                        borderWidth: 1,
                    },
                    style,
                ]}
            >
                <View style={styles.gradientContent}>
                    {loading ? (
                        <ActivityIndicator color={colors.onSurface} />
                    ) : (
                        <View style={styles.row}>
                            {children ? (
                                children
                            ) : (
                                <>
                                    <Text style={[styles.secondaryText, { color: colors.onSurface }, textStyle]}>
                                        {title}
                                    </Text>
                                    {icon && (
                                        typeof icon === 'string' ? (
                                            <Ionicons name={icon} size={20} color={colors.onSurface} style={styles.icon} />
                                        ) : (
                                            icon
                                        )
                                    )}
                                </>
                            )}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    // Ghost variant
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
            style={[styles.ghostButton, style]}
        >
            <View style={styles.row}>
                {loading ? (
                    <ActivityIndicator color={colors.subtext} />
                ) : (
                    <>
                        <Text style={[styles.ghostText, { color: colors.subtext }, textStyle]}>
                            {title}
                        </Text>
                        {icon}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    basePill: {
        borderRadius: 9999,
        overflow: 'hidden',
        height: 54,
    },
    primaryShadow: {
        shadowColor: '#9B8AFB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 12,
        elevation: 6,
    },
    gradientContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: 8,
    },
    primaryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    secondaryText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    ghostButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 9999,
    },
    ghostText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
