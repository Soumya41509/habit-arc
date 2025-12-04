import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassView from '../../components/GlassView';
import StatsCard from '../../components/StatsCard';
import { getOverallStats, getHabits, getLogs } from '../../lib/storage';

export default function Analytics() {
    const { colors } = useTheme();
    const [stats, setStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState(null);
    const [habitBreakdown, setHabitBreakdown] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const loadStats = async () => {
        const overallStats = await getOverallStats();
        setStats(overallStats);

        // Get this month's stats
        const monthly = await getMonthlyStats();
        setMonthlyStats(monthly);

        // Get habit breakdown for this month
        const breakdown = await getHabitBreakdown();
        setHabitBreakdown(breakdown);
    };

    const getMonthlyStats = async () => {
        const logs = await getLogs();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let monthlyCompletions = 0;
        let uniqueDays = new Set();

        Object.entries(logs).forEach(([date, habitIds]) => {
            if (date.startsWith(currentMonth)) {
                monthlyCompletions += habitIds.length;
                uniqueDays.add(date);
            }
        });

        return {
            completions: monthlyCompletions,
            activeDays: uniqueDays.size,
        };
    };

    const getHabitBreakdown = async () => {
        const habits = await getHabits();
        const logs = await getLogs();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const breakdown = habits.map(habit => {
            let count = 0;
            Object.entries(logs).forEach(([date, habitIds]) => {
                if (date.startsWith(currentMonth) && habitIds.includes(habit.id)) {
                    count++;
                }
            });
            return { ...habit, monthlyCount: count };
        }).filter(h => h.monthlyCount > 0)
            .sort((a, b) => b.monthlyCount - a.monthlyCount);

        return breakdown;
    };

    const getMonthName = () => {
        const options = { month: 'long', year: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

                {/* Overall Stats */}
                {stats && (
                    <View style={styles.statsGrid}>
                        <StatsCard
                            icon="apps"
                            label="Total Habits"
                            value={stats.totalHabits}
                            color={colors.primary}
                        />
                        <StatsCard
                            icon="checkmark-done"
                            label="All Time"
                            value={stats.totalCompletions}
                            color={colors.accent}
                        />
                    </View>
                )}

                {/* This Month Section */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 {getMonthName()}</Text>

                {monthlyStats && (
                    <View style={styles.statsGrid}>
                        <StatsCard
                            icon="calendar"
                            label="Active Days"
                            value={monthlyStats.activeDays}
                            color={colors.secondary}
                        />
                        <StatsCard
                            icon="checkmark-circle"
                            label="Completions"
                            value={monthlyStats.completions}
                            color={colors.accent}
                        />
                    </View>
                )}

                {/* Habit Breakdown */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Monthly Breakdown</Text>
                {habitBreakdown.length > 0 ? (
                    habitBreakdown.map((habit) => (
                        <GlassView key={habit.id} style={styles.habitCard}>
                            <View style={[styles.habitIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name={habit.icon || 'star'} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.habitInfo}>
                                <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.title}</Text>
                                <Text style={[styles.habitSubtitle, { color: colors.subtext }]}>
                                    {habit.frequency || 'Daily'}
                                </Text>
                            </View>
                            <View style={styles.countBadge}>
                                <Text style={[styles.countValue, { color: colors.primary }]}>
                                    {habit.monthlyCount}
                                </Text>
                                <Text style={[styles.countLabel, { color: colors.subtext }]}>times</Text>
                            </View>
                        </GlassView>
                    ))
                ) : (
                    <GlassView style={styles.emptyCard}>
                        <Ionicons name="bar-chart-outline" size={48} color={colors.subtext} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: colors.subtext }]}>
                            Complete habits this month{'\n'}to see your progress!
                        </Text>
                    </GlassView>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        marginHorizontal: -6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 16,
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    habitIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    habitSubtitle: {
        fontSize: 14,
    },
    countBadge: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderRadius: 16,
    },
    countValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    countLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyCard: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 16,
        lineHeight: 20,
    },
});
