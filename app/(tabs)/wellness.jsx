import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassView from '../../components/GlassView';
import ArcProgress from '../../components/ArcProgress';
import {
    getWaterLogs, logWater, getWaterGoal,
    getSleepSessions, startSleep, endSleep,
    getFastingSessions, startFasting, endFasting,
    getMoodEntries, saveMoodEntry,
    getLocalDate
} from '../../lib/storage';

export default function Wellness() {
    const { colors } = useTheme();
    const [waterToday, setWaterToday] = useState(0);
    const [waterGoal, setWaterGoal] = useState(3000);
    const [sleepSession, setSleepSession] = useState(null);
    const [fastingSession, setFastingSession] = useState(null);
    const [moodToday, setMoodToday] = useState(null);
    const [moodNote, setMoodNote] = useState('');
    const [elapsedSleep, setElapsedSleep] = useState('00:00:00');
    const [elapsedFasting, setElapsedFasting] = useState('00:00:00');

    // Timer Logic
    useEffect(() => {
        let interval;
        if (sleepSession || fastingSession) {
            interval = setInterval(() => {
                const now = new Date();

                if (sleepSession) {
                    const start = new Date(sleepSession.startTime);
                    const diff = now - start;
                    setElapsedSleep(formatDuration(diff));
                }

                if (fastingSession) {
                    const start = new Date(fastingSession.startTime);
                    const diff = now - start;
                    setElapsedFasting(formatDuration(diff));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sleepSession, fastingSession]);

    const formatDuration = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)));
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        // Water
        const waterLogs = await getWaterLogs();
        const today = getLocalDate();
        const todayWater = waterLogs[today] || [];
        const total = todayWater.reduce((sum, log) => sum + log.amount, 0);
        setWaterToday(total);

        const goal = await getWaterGoal();
        setWaterGoal(goal);

        // Sleep
        const sleepSessions = await getSleepSessions();
        const activeSleep = sleepSessions.find(s => !s.endTime);
        setSleepSession(activeSleep || null);

        // Fasting
        const fastingSessions = await getFastingSessions();
        const activeFasting = fastingSessions.find(s => !s.endTime);
        setFastingSession(activeFasting || null);

        // Mood
        const moodEntries = await getMoodEntries();
        const todayMood = moodEntries[today];
        if (todayMood) {
            setMoodToday(todayMood.mood);
            setMoodNote(todayMood.note || '');
        }
    };

    const addWater = async (amount) => {
        await logWater(amount);
        setWaterToday(prev => prev + amount);
    };

    const handleSleepToggle = async () => {
        if (sleepSession) {
            await endSleep(sleepSession.id);
            setSleepSession(null);
            Alert.alert('Sleep Ended', 'Good morning! Sleep session recorded.');
        } else {
            const session = await startSleep();
            setSleepSession(session);
        }
    };

    const handleFastingToggle = async () => {
        if (fastingSession) {
            await endFasting(fastingSession.id);
            setFastingSession(null);
            Alert.alert('Fasting Ended', 'Great job completing your fast!');
        } else {
            const session = await startFasting();
            setFastingSession(session);
        }
    };

    const handleMoodSave = async (mood) => {
        await saveMoodEntry(mood, moodNote);
        setMoodToday(mood);
    };

    // Calculate progress: if over 3000ml, show overflow progress
    const waterProgress = waterToday <= waterGoal
        ? waterToday / waterGoal
        : Math.min((waterToday - waterGoal) / waterGoal, 1);

    const isOverLimit = waterToday > waterGoal;

    const moods = ['😊', '😐', '😢', '😡', '😴', '🤩', '😌', '😰'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>Wellness</Text>

                {/* Water Tracking */}
                <GlassView style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="water" size={24} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Water Intake</Text>
                    </View>

                    <View style={styles.waterContainer}>
                        <ArcProgress
                            size={120}
                            progress={waterProgress}
                            customColor={isOverLimit ? colors.danger : null}
                        >
                            <View style={styles.arcContent}>
                                <Text style={[styles.waterAmount, { color: colors.text }]}>
                                    {waterToday}
                                </Text>
                                <Text style={[styles.waterUnit, { color: colors.subtext }]}>ml</Text>
                            </View>
                        </ArcProgress>

                        <View style={styles.waterButtons}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (waterToday >= 300) {
                                        addWater(-300);
                                    }
                                }}
                                style={[styles.waterBtn, { backgroundColor: colors.danger + '20' }]}
                            >
                                <Ionicons name="remove" size={20} color={colors.danger} />
                                <Text style={[styles.waterBtnText, { color: colors.danger }]}>300ml</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => addWater(300)}
                                style={[styles.waterBtn, { backgroundColor: colors.primary + '20' }]}
                            >
                                <Ionicons name="add" size={20} color={colors.primary} />
                                <Text style={[styles.waterBtnText, { color: colors.primary }]}>300ml</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.goalText, { color: colors.subtext }]}>
                        Goal: {waterGoal}ml
                    </Text>
                </GlassView>

                {/* Sleep Tracking */}
                <GlassView style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="moon" size={24} color={colors.secondary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sleep</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleSleepToggle}
                        style={[styles.timerButton, { backgroundColor: sleepSession ? colors.danger + '20' : colors.secondary + '20' }]}
                    >
                        <Ionicons
                            name={sleepSession ? "stop-circle" : "bed"}
                            size={32}
                            color={sleepSession ? colors.danger : colors.secondary}
                        />
                        <Text style={[styles.timerText, { color: colors.text }]}>
                            {sleepSession ? 'End Sleep' : 'Start Sleep'}
                        </Text>
                    </TouchableOpacity>

                    {sleepSession && (
                        <Text style={[styles.statusText, { color: colors.primary, fontSize: 24, fontWeight: '700' }]}>
                            {elapsedSleep}
                        </Text>
                    )}
                </GlassView>

                {/* Fasting Timer */}
                <GlassView style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="timer" size={24} color={colors.warning} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fasting</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleFastingToggle}
                        style={[styles.timerButton, { backgroundColor: fastingSession ? colors.danger + '20' : colors.warning + '20' }]}
                    >
                        <Ionicons
                            name={fastingSession ? "stop-circle" : "hourglass"}
                            size={32}
                            color={fastingSession ? colors.danger : colors.warning}
                        />
                        <Text style={[styles.timerText, { color: colors.text }]}>
                            {fastingSession ? 'Break Fast' : 'Start Fasting'}
                        </Text>
                    </TouchableOpacity>

                    {fastingSession && (
                        <Text style={[styles.statusText, { color: colors.primary, fontSize: 24, fontWeight: '700' }]}>
                            {elapsedFasting}
                        </Text>
                    )}
                </GlassView>

                {/* Mood Journal */}
                <GlassView style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="happy" size={24} color={colors.accent} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Today</Text>
                    </View>

                    <View style={styles.moodGrid}>
                        {moods.map(mood => (
                            <TouchableOpacity
                                key={mood}
                                onPress={() => handleMoodSave(mood)}
                                style={[
                                    styles.moodButton,
                                    { backgroundColor: moodToday === mood ? colors.accent + '30' : colors.glass }
                                ]}
                            >
                                <Text style={styles.moodEmoji}>{mood}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={[styles.noteInput, {
                            backgroundColor: colors.glass,
                            color: colors.text,
                            borderColor: colors.glassBorder
                        }]}
                        placeholder="Add a note about today..."
                        placeholderTextColor={colors.subtext}
                        value={moodNote}
                        onChangeText={setMoodNote}
                        multiline
                        onBlur={() => moodToday && saveMoodEntry(moodToday, moodNote)}
                    />
                </GlassView>

                <View style={{ height: 40 }} />
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
    section: {
        padding: 20,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 12,
    },
    waterContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    arcContent: {
        alignItems: 'center',
    },
    waterAmount: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    waterUnit: {
        fontSize: 14,
        marginTop: 4,
    },
    waterButtons: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    waterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    waterBtnText: {
        fontSize: 16,
        fontWeight: '600',
    },
    goalText: {
        textAlign: 'center',
        fontSize: 14,
    },
    timerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 12,
    },
    timerText: {
        fontSize: 18,
        fontWeight: '600',
    },
    statusText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    moodButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    moodEmoji: {
        fontSize: 32,
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
    },
});
