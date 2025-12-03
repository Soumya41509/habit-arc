import { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function HabitDetails() {
    const { id } = useLocalSearchParams();
    const [habit, setHabit] = useState(null);
    const [stats, setStats] = useState({ total: 0, streak: 0 });
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        fetchHabitDetails();
    }, [id]);

    const fetchHabitDetails = async () => {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            Alert.alert('Error', 'Could not fetch habit details');
            router.back();
            return;
        }

        setHabit(data);

        // Fetch stats
        const { count } = await supabase
            .from('habit_logs')
            .select('*', { count: 'exact', head: true })
            .eq('habit_id', id);

        setStats({ total: count || 0, streak: 0 }); // Streak logic can be added later
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Habit',
            'Are you sure you want to delete this habit? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase
                            .from('habits')
                            .delete()
                            .eq('id', id);

                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            router.back();
                        }
                    },
                },
            ]
        );
    };

    if (!habit) return null;

    return (
        <Background>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <ThemedText type="title">Details</ThemedText>
                    <View style={{ width: 24 }} />
                </View>

                <GlassView intensity={30} style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
                        <Ionicons name={habit.icon} size={40} color="#fff" />
                    </View>
                    <ThemedText type="title" style={styles.title}>{habit.title}</ThemedText>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <ThemedText type="title">{stats.total}</ThemedText>
                            <ThemedText style={styles.statLabel}>Completions</ThemedText>
                        </View>
                        <View style={styles.stat}>
                            <ThemedText type="title">0</ThemedText>
                            <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
                        </View>
                    </View>
                </GlassView>

                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Schedule</ThemedText>
                    <GlassView intensity={20} style={styles.scheduleCard}>
                        <View style={styles.daysRow}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <View
                                    key={day}
                                    style={[
                                        styles.dayBadge,
                                        habit.frequency.includes(day) && { backgroundColor: habit.color }
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.dayText,
                                            habit.frequency.includes(day) && { color: '#fff' }
                                        ]}
                                    >
                                        {day[0]}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    </GlassView>
                </View>

                <Button
                    title="Delete Habit"
                    onPress={handleDelete}
                    variant="ghost"
                    style={styles.deleteButton}
                    textStyle={{ color: '#EF4444' }}
                />
            </ScrollView>
        </Background>
    );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    card: {
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    title: {
        marginBottom: 24,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 40,
    },
    stat: {
        alignItems: 'center',
    },
    statLabel: {
        opacity: 0.6,
        fontSize: 12,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    scheduleCard: {
        padding: 20,
        borderRadius: 20,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
});
