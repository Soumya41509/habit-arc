import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getHabits, deleteHabit, getLogs, removeHabitCompletion, getHabitStats } from '../../lib/storage';
import GlassView from '../../components/GlassView';
import StatsCard from '../../components/StatsCard';

export default function HabitDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const [habit, setHabit] = useState(null);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadHabit();
    }, [id]);

    const loadHabit = async () => {
        const habits = await getHabits();
        const found = habits.find(h => h.id === id);
        if (found) {
            setHabit(found);
            // Load history
            const logs = await getLogs();
            const habitLogs = Object.entries(logs)
                .filter(([date, habitIds]) => habitIds.includes(id))
                .map(([date]) => date)
                .sort((a, b) => new Date(b) - new Date(a))
                .slice(0, 30); // Last 30 completions
            setHistory(habitLogs);

            // Load stats
            const habitStats = await getHabitStats(id);
            setStats(habitStats);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Habit",
            "Are you sure you want to delete this habit?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteHabit(id);
                        router.back();
                    }
                }
            ]
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    if (!habit) return <View style={[styles.container, { backgroundColor: colors.background }]} />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.iconContainer}>
                    <GlassView style={styles.iconGlass}>
                        <Ionicons name={habit.icon || 'star'} size={64} color={colors.primary} />
                    </GlassView>
                    <Text style={[styles.title, { color: colors.text }]}>{habit.title}</Text>
                    <Text style={[styles.subtitle, { color: colors.subtext }]}>{habit.frequency || 'Daily'}</Text>
                </View>

                {/* Statistics Cards */}
                {stats && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <StatsCard
                                icon="flame"
                                label="Current Streak"
                                value={stats.currentStreak}
                                color="#FF9500"
                            />
                            <StatsCard
                                icon="trophy"
                                label="Best Streak"
                                value={stats.longestStreak}
                                color={colors.primary}
                            />
                        </View>
                        <View style={styles.statsRow}>
                            <StatsCard
                                icon="checkmark-circle"
                                label="Total Completions"
                                value={stats.totalCompletions}
                                color={colors.accent}
                            />
                            <StatsCard
                                icon="analytics"
                                label="30-Day Rate"
                                value={`${stats.completionRate}%`}
                                color={colors.secondary}
                            />
                        </View>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent History</Text>
                <GlassView style={styles.historyCard}>
                    {history.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Ionicons name="calendar-outline" size={48} color={colors.subtext} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: colors.subtext }]}>
                                No completions yet.{'\n'}Start tracking today!
                            </Text>
                        </View>
                    ) : (
                        history.map((date, index) => (
                            <View key={date} style={[
                                styles.historyRow,
                                index < history.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder }
                            ]}>
                                <View style={styles.historyLeft}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                    <Text style={[styles.historyDate, { color: colors.text }]}>
                                        {formatDate(date)}
                                    </Text>
                                </View>
                                <Text style={[styles.daysAgo, { color: colors.subtext }]}>
                                    {getDaysAgo(date)}
                                </Text>
                            </View>
                        ))
                    )}
                </GlassView>
            </ScrollView>
        </View>
    );
}

const getDaysAgo = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    content: {
        padding: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconGlass: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: -6,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
    },
    historyCard: {
        padding: 16,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyDate: {
        fontSize: 16,
        fontWeight: '500',
    },
    daysAgo: {
        fontSize: 14,
    },
    emptyHistory: {
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
