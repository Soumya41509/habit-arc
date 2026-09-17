import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from './GlassView';
import { useTheme } from '../context/ThemeContext';

export default function StatsCard({ icon, label, value, color }) {
    const { colors } = useTheme();

    return (
        <GlassView style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
            </View>
        </GlassView>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        margin: 6,
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    content: {
        alignItems: 'center',
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
    },
});
