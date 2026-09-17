import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { ArcProgress } from '../../components/ArcProgress';
import { Colors } from '../../constants/Colors';
import { getHabitsWithTodayStatus, toggleHabitCompletion } from '../../lib/db';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function Home() {
    const [habits, setHabits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [todayProgress, setTodayProgress] = useState(0);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const fetchHabits = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const habitsData = await getHabitsWithTodayStatus(today);

            setHabits(habitsData);

            if (habitsData && habitsData.length > 0) {
                const completedCount = habitsData.filter(h => h.completed).length;
                setTodayProgress(completedCount / habitsData.length);
            } else {
                setTodayProgress(0);
            }
        } catch (error) {
            console.error('Error fetching local habits:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHabits();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHabits();
        setRefreshing(false);
    };

    const toggleHabit = async (habit) => {
        const today = new Date().toISOString().split('T')[0];
        const newStatus = await toggleHabitCompletion(habit.id, today, habit.completed);

        setHabits(prev => {
            const updated = prev.map(h => h.id === habit.id ? { ...h, completed: newStatus } : h);
            const completedCount = updated.filter(h => h.completed).length;
            setTodayProgress(updated.length > 0 ? completedCount / updated.length : 0);
            return updated;
        });
    };

    return (
        <Background>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.greeting}>Welcome back</ThemedText>
                        <ThemedText type="title">Your Progress</ThemedText>
                    </View>
                    <GlassView intensity={30} style={styles.avatar}>
                        <ThemedText style={{ fontSize: 20 }}>👤</ThemedText>
                    </GlassView>
                </View>

                <View style={styles.arcContainer}>
                    <ArcProgress progress={todayProgress} size={280}>
                        <View style={styles.progressTextContainer}>
                            <ThemedText type="title" style={styles.percentage}>
                                {Math.round(todayProgress * 100)}%
                            </ThemedText>
                            <ThemedText style={styles.progressLabel}>Daily Goal</ThemedText>
                        </View>
                    </ArcProgress>
                </View>

                <View style={styles.habitsList}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Habits</ThemedText>

                    {habits.length === 0 ? (
                        <GlassView intensity={20} style={styles.emptyState}>
                            <ThemedText style={styles.emptyText}>No habits yet. Tap + to add one!</ThemedText>
                        </GlassView>
                    ) : (
                        habits.map(habit => (
                            <View key={habit.id} style={{ marginBottom: 12 }}>
                                <GlassView
                                    intensity={habit.completed ? 60 : 30}
                                    style={[
                                        styles.habitCard,
                                        habit.completed && { borderColor: Colors.light.accent, backgroundColor: isDark ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.1)' }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.cardContent}
                                        onPress={() => router.push(`/habit/${habit.id}`)}
                                    >
                                        <View style={styles.habitIcon}>
                                            <Ionicons name={habit.icon || 'star'} size={24} color={habit.completed ? Colors.light.accent : (isDark ? '#fff' : '#000')} />
                                        </View>
                                        <View style={styles.habitInfo}>
                                            <ThemedText style={[styles.habitTitle, habit.completed && styles.completedText]}>{habit.title}</ThemedText>
                                            <ThemedText style={styles.habitStreak}>Tap for details</ThemedText>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => toggleHabit(habit)} style={[styles.checkbox, habit.completed && styles.checked]}>
                                        {habit.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
                                    </TouchableOpacity>
                                </GlassView>
                            </View>
                        ))
                    )}
                </View>

                {/* Spacer for TabBar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </Background>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        opacity: 0.7,
        marginBottom: 4,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arcContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    progressTextContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    percentage: {
        fontSize: 48,
        lineHeight: 56,
    },
    progressLabel: {
        opacity: 0.7,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    habitsList: {
        gap: 12,
    },
    emptyState: {
        padding: 30,
        alignItems: 'center',
        borderRadius: 20,
    },
    emptyText: {
        opacity: 0.7,
    },
    habitCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    habitIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    habitInfo: {
        flex: 1,
    },
    habitTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    habitStreak: {
        fontSize: 12,
        opacity: 0.6,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checked: {
        backgroundColor: Colors.light.accent,
        borderColor: Colors.light.accent,
    },
});
