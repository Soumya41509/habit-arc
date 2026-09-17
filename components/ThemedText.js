import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function ThemedText({
    style,
    color,
    type = 'body-md', // 'display-lg' | 'headline-lg' | 'headline-md' | 'headline-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'label-lg' | 'label-md' | 'label-sm' | 'title' | 'subtitle' | 'default'
    variant = 'primary', // 'primary' | 'subtext' | 'muted' | 'tertiary'
    ...rest
}) {
    const { colors } = useTheme();

    let defaultTextColor = colors.onSurface;
    if (variant === 'subtext') defaultTextColor = colors.subtext;
    if (variant === 'muted') defaultTextColor = colors.muted;
    if (variant === 'tertiary') defaultTextColor = colors.tertiary;

    const textColor = color || defaultTextColor;

    let styleType = styles.bodyMd;
    if (type === 'display-lg') styleType = styles.displayLg;
    else if (type === 'headline-lg' || type === 'title') styleType = styles.headlineLg;
    else if (type === 'headline-md' || type === 'subtitle') styleType = styles.headlineMd;
    else if (type === 'headline-sm') styleType = styles.headlineSm;
    else if (type === 'body-lg') styleType = styles.bodyLg;
    else if (type === 'body-md' || type === 'default') styleType = styles.bodyMd;
    else if (type === 'body-sm') styleType = styles.bodySm;
    else if (type === 'label-lg') styleType = styles.labelLg;
    else if (type === 'label-md') styleType = styles.labelMd;
    else if (type === 'label-sm') styleType = styles.labelSm;

    return (
        <Text
            style={[
                styleType,
                { color: textColor },
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    displayLg: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: '700',
        letterSpacing: -0.8,
    },
    headlineLg: {
        fontSize: 26,
        lineHeight: 34,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headlineMd: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    headlineSm: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    bodyLg: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        letterSpacing: -0.1,
    },
    bodyMd: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
    },
    bodySm: {
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '400',
    },
    labelLg: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    labelMd: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    labelSm: {
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
});
