import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassView from './GlassView';
import { useTheme } from '../context/ThemeContext';
import { calculateStreak } from '../lib/storage';

export default function HabitCard({ habit, isCompleted, onToggle, onPress }) {
    const { colors } = useTheme();
    const [streak, setStreak] = useState({ current: 0, longest: 0 });

    useEffect(() => {
        loadStreak();
    }, [habit.id]);

    const loadStreak = async () => {
        const streakData = await calculateStreak(habit.id);
        setStreak(streakData);
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <GlassView style={[
                styles.card,
                isCompleted && { borderColor: colors.accent, borderWidth: 2 }
            ]}>
                <View style={styles.row}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isCompleted ? colors.accent : colors.glass }
                    ]}>
                        <Ionicons
                            name={habit.icon || 'star'}
                            size={24}
                            color={isCompleted ? '#fff' : colors.primary}
                        />
                    </View>
                    <View style={styles.info}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {habit.title}
                        </Text>
                        <View style={styles.statsRow}>
                            {streak.current > 0 && (
                                <View style={styles.streakBadge}>
                                    <Text style={styles.fireEmoji}>🔥</Text>
                                    <Text style={[styles.streakText, { color: colors.primary }]}>
                                        {streak.current} day{streak.current !== 1 ? 's' : ''}
                                    </Text>
                                </View>
                            )}
                            <Text style={[styles.subtitle, { color: colors.subtext }]}>
                                {habit.frequency || 'Daily'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onToggle} style={styles.checkButton}>
                        <Ionicons
                            name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                            size={32}
                            color={isCompleted ? colors.accent : colors.subtext}
                        />
                    </TouchableOpacity>
                </View>
            </GlassView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    fireEmoji: {
        fontSize: 14,
        marginRight: 4,
    },
    streakText: {
        fontSize: 12,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
    },
    checkButton: {
        padding: 4,
    },
});
