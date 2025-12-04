import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../context/ThemeContext';
import {
    getHabits, getTodayLogs, logHabitCompletion, removeHabitCompletion, getOverallStats,
    getTodayTasks, saveTask, updateTask, deleteTask,
    getWaterLogs, getWaterGoal, logWater, getMoodEntries, getSleepSessions,
    clearAllData
} from '../../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlassView from '../../components/GlassView';
import ArcProgress from '../../components/ArcProgress';

export default function Home() {
    const { colors, theme, toggleTheme, isDark } = useTheme();
    const router = useRouter();

    // State
    const [habits, setHabits] = useState([]);
    const [logs, setLogs] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState(null);
    const [waterToday, setWaterToday] = useState(0);
    const [waterGoal, setWaterGoal] = useState(2000);
    const [moodToday, setMoodToday] = useState(null);
    const [sleepHours, setSleepHours] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [userName, setUserName] = useState('');
    const [editName, setEditName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    const loadData = async () => {
        // Habits
        const loadedHabits = await getHabits();
        const todayLogs = await getTodayLogs();
        const overallStats = await getOverallStats();
        setHabits(loadedHabits.slice(0, 3));
        setLogs(todayLogs);
        setStats(overallStats);

        // Tasks
        const todayTasks = await getTodayTasks();
        setTasks(todayTasks.sort((a, b) => a.time.localeCompare(b.time)));

        // Wellness
        const waterLogs = await getWaterLogs();
        const today = new Date().toISOString().split('T')[0];
        const todayWater = waterLogs[today] || [];
        const total = todayWater.reduce((sum, log) => sum + log.amount, 0);
        setWaterToday(total);

        const goal = await getWaterGoal();
        setWaterGoal(goal);

        const moodEntries = await getMoodEntries();
        const todayMood = moodEntries[today];
        if (todayMood) setMoodToday(todayMood.mood);

        const sleepSessions = await getSleepSessions();
        const lastSleep = sleepSessions.filter(s => s.endTime).slice(-1)[0];
        if (lastSleep) setSleepHours((lastSleep.duration / 60).toFixed(1));

        // Load user name
        const savedName = await AsyncStorage.getItem('user_name');
        if (savedName) {
            setUserName(savedName);
            setEditName(savedName);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const toggleHabit = async (id) => {
        if (logs.includes(id)) {
            await removeHabitCompletion(id);
            setLogs(prev => prev.filter(l => l !== id));
        } else {
            await logHabitCompletion(id);
            setLogs(prev => [...prev, id]);
        }
        const overallStats = await getOverallStats();
        setStats(overallStats);
    };

    const toggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            await updateTask(taskId, { completed: !task.completed });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
        }
    };

    const handleAddTask = async () => {
        if (newTaskTitle.trim() && newTaskTime) {
            await saveTask({
                title: newTaskTitle,
                time: newTaskTime,
                priority: 'medium',
            });
            setNewTaskTitle('');
            setNewTaskTime('');
            setShowAddTask(false);
            loadData();
        }
    };

    const handleResetData = async () => {
        Alert.alert(
            'Reset All Data',
            'Are you sure? This will delete all your data!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        loadData();
                        setShowProfile(false);
                    }
                }
            ]
        );
    };

    const handleSaveName = async () => {
        await AsyncStorage.setItem('user_name', editName);
        setUserName(editName);
        setIsEditingName(false);
    };

    const addWater = async (amount) => {
        await logWater(amount);
        setWaterToday(waterToday + amount);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'GOOD MORNING';
        if (hour < 18) return 'GOOD AFTERNOON';
        return 'GOOD EVENING';
    };

    const getGreetingEmoji = () => {
        const hour = new Date().getHours();
        if (hour < 12) return '☀️';
        if (hour < 18) return '🌤️';
        return '🌙';
    };

    const getFormattedDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString('en-US', options);
    };

    const getPriorityColor = (priority) => {
        if (priority === 'high') return colors.danger;
        if (priority === 'low') return colors.accent;
        return colors.warning;
    };

    const progress = habits.length > 0 ? logs.length / habits.length : 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.greetingContainer}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.greetingEmoji]}>{getGreetingEmoji()}</Text>
                            <Text style={[styles.greetingLabel, { color: colors.primary }]}>{getGreeting()}</Text>
                        </View>
                        {userName ? (
                            <Text style={[styles.userName, {
                                color: colors.text,
                                textShadowColor: colors.primary + '30',
                                textShadowOffset: { width: 0, height: 2 },
                                textShadowRadius: 8
                            }]}>{userName}</Text>
                        ) : (
                            <Text style={[styles.userName, { color: colors.text }]}>Welcome Back</Text>
                        )}
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={14} color={colors.accent} />
                            <Text style={[styles.dateText, { color: colors.subtext }]}>{getFormattedDate()}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setShowProfile(true)}>
                        <GlassView style={[styles.profileButton, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                        </GlassView>
                    </TouchableOpacity>
                </View>

                {/* Timeline */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Timeline</Text>
                <GlassView style={styles.timelineContainer}>
                    {tasks.length === 0 ? (
                        <View style={styles.emptyTimeline}>
                            <Ionicons name="calendar-outline" size={40} color={colors.subtext} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: colors.subtext }]}>No tasks scheduled</Text>
                        </View>
                    ) : (
                        tasks.map((task) => {
                            const renderRightActions = () => (
                                <TouchableOpacity
                                    onPress={async () => {
                                        await deleteTask(task.id);
                                        setTasks(tasks.filter(t => t.id !== task.id));
                                    }}
                                    style={styles.deleteAction}
                                >
                                    <Ionicons name="trash" size={24} color="#FFFFFF" />
                                    <Text style={styles.deleteText}>Delete</Text>
                                </TouchableOpacity>
                            );

                            return (
                                <Swipeable
                                    key={task.id}
                                    renderRightActions={renderRightActions}
                                    overshootRight={false}
                                >
                                    <TouchableOpacity
                                        onPress={() => toggleTask(task.id)}
                                        style={[styles.taskCard, {
                                            borderLeftColor: getPriorityColor(task.priority),
                                            opacity: task.completed ? 0.6 : 1,
                                        }]}
                                    >
                                        <View style={styles.taskTime}>
                                            <Text style={[styles.timeText, { color: colors.primary }]}>{task.time}</Text>
                                        </View>
                                        <View style={styles.taskInfo}>
                                            <Text style={[
                                                styles.taskTitle,
                                                { color: colors.text, textDecorationLine: task.completed ? 'line-through' : 'none' }
                                            ]}>
                                                {task.title}
                                            </Text>
                                            {task.duration && (
                                                <Text style={[styles.taskDuration, { color: colors.subtext }]}>
                                                    {task.duration} min
                                                </Text>
                                            )}
                                        </View>
                                        <Ionicons
                                            name={task.completed ? "checkmark-circle" : "ellipse-outline"}
                                            size={24}
                                            color={task.completed ? colors.accent : colors.subtext}
                                        />
                                    </TouchableOpacity>
                                </Swipeable>
                            );
                        })
                    )}
                </GlassView>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity onPress={() => setShowAddTask(true)} style={styles.quickButton}>
                        <GlassView style={styles.quickButtonInner}>
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </GlassView>
                        <Text style={[styles.quickLabel, { color: colors.subtext }]}>Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => addWater(300)} style={styles.quickButton}>
                        <GlassView style={styles.quickButtonInner}>
                            <Ionicons name="water" size={24} color={colors.accent} />
                        </GlassView>
                        <Text style={[styles.quickLabel, { color: colors.subtext }]}>Water</Text>
                    </TouchableOpacity>
                </View>

                {/* HabitArc Panel */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>HabitArc</Text>
                <GlassView style={styles.habitPanel}>
                    <View style={styles.habitArc}>
                        <ArcProgress size={140} progress={progress}>
                            <View style={styles.arcContent}>
                                <Text style={[styles.arcPercentage, { color: colors.text }]}>
                                    {Math.round(progress * 100)}%
                                </Text>
                                <Text style={[styles.arcLabel, { color: colors.subtext }]}>Done</Text>
                            </View>
                        </ArcProgress>
                    </View>
                    {habits.map(habit => (
                        <TouchableOpacity
                            key={habit.id}
                            onPress={() => toggleHabit(habit.id)}
                            style={styles.miniHabitCard}
                        >
                            <View style={[styles.habitIcon, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name={habit.icon || 'star'} size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.title}</Text>
                            <Ionicons
                                name={logs.includes(habit.id) ? "checkmark-circle" : "ellipse-outline"}
                                size={22}
                                color={logs.includes(habit.id) ? colors.accent : colors.subtext}
                            />
                        </TouchableOpacity>
                    ))}
                </GlassView>


                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddTask(true)}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add Task Modal */}
            <Modal visible={showAddTask} animationType="slide" transparent onRequestClose={() => setShowAddTask(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Task</Text>
                            <TouchableOpacity onPress={() => setShowAddTask(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.glass, color: colors.text, borderColor: colors.glassBorder }]}
                                placeholder="Task title"
                                placeholderTextColor={colors.subtext}
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.glass, color: colors.text, borderColor: colors.glassBorder }]}
                                placeholder="Time (e.g., 14:00)"
                                placeholderTextColor={colors.subtext}
                                value={newTaskTime}
                                onChangeText={setNewTaskTime}
                            />
                            <TouchableOpacity
                                style={[styles.addButton, { backgroundColor: colors.primary }]}
                                onPress={handleAddTask}
                            >
                                <Text style={styles.addButtonText}>Add Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Profile Modal */}
            <Modal visible={showProfile} animationType="slide" transparent onRequestClose={() => setShowProfile(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Profile</Text>
                            <TouchableOpacity onPress={() => setShowProfile(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {/* Name Section */}
                            <GlassView style={styles.settingSection}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>Your Name</Text>
                                <View style={styles.nameInputContainer}>
                                    <TextInput
                                        style={[styles.nameInput, {
                                            backgroundColor: colors.glass,
                                            color: colors.text,
                                            borderColor: colors.glassBorder
                                        }]}
                                        placeholder="Enter your name"
                                        placeholderTextColor={colors.subtext}
                                        value={editName}
                                        onChangeText={setEditName}
                                        editable={isEditingName}
                                    />
                                    {!isEditingName ? (
                                        <TouchableOpacity
                                            onPress={() => setIsEditingName(true)}
                                            style={[styles.editNameBtn, { backgroundColor: colors.primary + '20' }]}
                                        >
                                            <Ionicons name="pencil" size={20} color={colors.primary} />
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={handleSaveName}
                                            style={[styles.editNameBtn, { backgroundColor: colors.accent + '20' }]}
                                        >
                                            <Ionicons name="checkmark" size={20} color={colors.accent} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </GlassView>

                            {/* Add Habit Button */}
                            <GlassView style={styles.settingSection}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>Manage Habits</Text>
                                <TouchableOpacity
                                    style={[styles.addHabitBtn, { backgroundColor: colors.secondary + '20' }]}
                                    onPress={() => {
                                        setShowProfile(false);
                                        router.push('/add-habit');
                                    }}
                                >
                                    <Ionicons name="star" size={24} color={colors.secondary} />
                                    <Text style={[styles.addHabitText, { color: colors.secondary }]}>Add New Habit</Text>
                                </TouchableOpacity>
                            </GlassView>

                            {/* Theme Section */}
                            <GlassView style={styles.settingSection}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>Appearance</Text>
                                <View style={styles.themeButtons}>
                                    <TouchableOpacity
                                        onPress={() => toggleTheme('light')}
                                        style={[styles.themeButton, { backgroundColor: theme === 'light' ? colors.primary + '30' : colors.glass }]}
                                    >
                                        <Ionicons name="sunny" size={24} color={colors.text} />
                                        <Text style={[styles.themeText, { color: colors.text }]}>Light</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => toggleTheme('dark')}
                                        style={[styles.themeButton, { backgroundColor: theme === 'dark' ? colors.primary + '30' : colors.glass }]}
                                    >
                                        <Ionicons name="moon" size={24} color={colors.text} />
                                        <Text style={[styles.themeText, { color: colors.text }]}>Dark</Text>
                                    </TouchableOpacity>
                                </View>
                            </GlassView>

                            <GlassView style={styles.settingSection}>
                                <Text style={[styles.settingTitle, { color: colors.text }]}>About</Text>
                                <Text style={[styles.appInfo, { color: colors.subtext }]}>
                                    HabitArc v1.0.0{'\n'}
                                    Your Personal Life OS{'\n'}
                                    100% Offline & Private
                                </Text>
                            </GlassView>

                            <GlassView style={styles.settingSection}>
                                <Text style={[styles.settingTitle, { color: colors.danger }]}>Danger Zone</Text>
                                <TouchableOpacity
                                    style={[styles.dangerButton, { backgroundColor: colors.danger + '20' }]}
                                    onPress={handleResetData}
                                >
                                    <Ionicons name="trash" size={20} color={colors.danger} />
                                    <Text style={[styles.dangerText, { color: colors.danger }]}>Reset All Data</Text>
                                </TouchableOpacity>
                            </GlassView>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 60, paddingHorizontal: 20 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
    greetingContainer: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    greetingEmoji: { fontSize: 14, marginRight: 6 },
    greetingLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        opacity: 0.9
    },
    userName: {
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: 10,
        lineHeight: 40
    },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 13, fontWeight: '500', opacity: 0.7 },
    profileButton: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

    // Sections
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, marginTop: 8 },

    // Timeline
    timelineContainer: { padding: 16, marginBottom: 24 },
    taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, marginBottom: 12, borderLeftWidth: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
    taskTime: { marginRight: 16 },
    timeText: { fontSize: 14, fontWeight: '600' },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    taskDuration: { fontSize: 12 },
    emptyTimeline: { alignItems: 'center', padding: 40 },
    emptyText: { marginTop: 12, fontSize: 14 },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 12,
        borderRadius: 16,
        marginLeft: 8,
    },
    deleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 4 },

    // Quick Actions
    quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
    quickButton: { alignItems: 'center' },
    quickButtonInner: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    quickLabel: { fontSize: 12 },

    // HabitArc Panel
    habitPanel: { padding: 20, marginBottom: 24 },
    habitArc: { alignItems: 'center', marginBottom: 20 },
    arcContent: { alignItems: 'center' },
    arcPercentage: { fontSize: 32, fontWeight: 'bold' },
    arcLabel: { fontSize: 12, marginTop: 4 },
    miniHabitCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
    habitIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    habitTitle: { flex: 1, fontSize: 15, fontWeight: '500' },

    // Summary
    summaryCard: { padding: 20, marginBottom: 24 },
    summaryTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
    summaryItem: { alignItems: 'center' },
    summaryValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    summaryLabel: { fontSize: 12 },

    // FAB
    fab: { position: 'absolute', right: 20, bottom: 100, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, minHeight: '50%', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
    modalTitle: { fontSize: 24, fontWeight: 'bold' },
    modalBody: { padding: 20 },
    input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 16 },
    addButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
    addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

    // Settings
    settingSection: { padding: 20, marginBottom: 16 },
    settingTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
    nameInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    nameInput: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16 },
    editNameBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    addHabitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: 20, gap: 12 },
    addHabitText: { fontSize: 18, fontWeight: '600' },
    themeButtons: { flexDirection: 'row', gap: 12 },
    themeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
    themeText: { fontSize: 16, fontWeight: '600' },
    appInfo: { fontSize: 14, lineHeight: 24 },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
    dangerText: { fontSize: 16, fontWeight: '600' },
});
