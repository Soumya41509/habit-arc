import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import {
    getHabits, getTodayLogs, logHabitCompletion, removeHabitCompletion, getOverallStats,
    getTodayTasks, saveTask, updateTask, deleteTask, saveHabit, deleteHabit,
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
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('');
    const [showTaskTimePicker, setShowTaskTimePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(6);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [userName, setUserName] = useState('');
    const [editName, setEditName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [showManageHabits, setShowManageHabits] = useState(false);
    const [showAddHabitForm, setShowAddHabitForm] = useState(false);
    const [allHabits, setAllHabits] = useState([]);
    const [habitTitle, setHabitTitle] = useState('');
    const [habitTime, setHabitTime] = useState('');
    const [habitIcon, setHabitIcon] = useState('fitness');
    const [habitFrequency, setHabitFrequency] = useState('Daily');

    const [showHabitTimePicker, setShowHabitTimePicker] = useState(false);
    const [habitHour, setHabitHour] = useState(12);
    const [habitMinute, setHabitMinute] = useState(0);
    const [habitPeriod, setHabitPeriod] = useState('AM');

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);


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
                notes: newTaskNotes,
                duration: newTaskDuration,
                priority: 'medium',
            });
            setNewTaskTitle('');
            setNewTaskTime('');
            setNewTaskNotes('');
            setNewTaskDuration('');
            setShowAddTask(false);
            loadData();
        }
    };

    const handleTaskTimeConfirm = () => {
        const formattedTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
        setNewTaskTime(formattedTime);
        setShowTaskTimePicker(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleMinuteSelect = (minute) => {
        setSelectedMinute(minute);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handlePeriodSelect = (period) => {
        setSelectedPeriod(period);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

    const handleOpenManageHabits = async () => {
        const loadedHabits = await getHabits();
        setAllHabits(loadedHabits);
        setShowManageHabits(true);
    };

    const handleSaveHabit = async () => {
        if (!habitTitle.trim()) {
            Alert.alert('Error', 'Please enter a habit title');
            return;
        }

        await saveHabit({
            title: habitTitle.trim(),
            time: habitTime,
            icon: habitIcon,
            frequency: habitFrequency,
        });

        // Reset form
        setHabitTitle('');
        setHabitTime('');
        setHabitIcon('fitness');
        setHabitFrequency('Daily');
        setShowAddHabitForm(false);

        // Reload habits
        const loadedHabits = await getHabits();
        setAllHabits(loadedHabits);
        await loadData();
    };

    const confirmDeleteHabit = (habitId) => {
        setHabitToDelete(habitId);
        setShowDeleteConfirm(true);
    };

    const proceedDeleteHabit = async () => {
        if (habitToDelete) {
            await deleteHabit(habitToDelete);
            const loadedHabits = await getHabits();
            setAllHabits(loadedHabits);
            await loadData();
        }
        setShowDeleteConfirm(false);
        setHabitToDelete(null);
    };

    const handleHabitTimeConfirm = () => {
        const formattedTime = `${habitHour}:${habitMinute.toString().padStart(2, '0')} ${habitPeriod}`;
        setHabitTime(formattedTime);
        setShowHabitTimePicker(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleHabitHourSelect = (hour) => {
        setHabitHour(hour);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleHabitMinuteSelect = (minute) => {
        setHabitMinute(minute);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleHabitPeriodSelect = (period) => {
        setHabitPeriod(period);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const getEndTime = (startTime, duration) => {
        if (!startTime || !duration) return null;
        try {
            const [time, period] = startTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes + parseInt(duration));

            let endHours = date.getHours();
            const endMinutes = date.getMinutes();
            const endPeriod = endHours >= 12 ? 'PM' : 'AM';

            if (endHours > 12) endHours -= 12;
            if (endHours === 0) endHours = 12;

            return `${endHours}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
        } catch (e) {
            return null;
        }
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

                {/* HabitArc Panel */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0, marginTop: 0, color: colors.text }]}>HabitArc</Text>
                    <TouchableOpacity onPress={handleOpenManageHabits}>
                        <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>Manage</Text>
                    </TouchableOpacity>
                </View>
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
                    {habits.map(habit => {
                        const isCompleted = logs.includes(habit.id);
                        return (
                            <TouchableOpacity
                                key={habit.id}
                                onPress={() => toggleHabit(habit.id)}
                                onLongPress={() => confirmDeleteHabit(habit.id)}
                                delayLongPress={500}
                                style={styles.miniHabitCard}
                            >
                                <View style={[styles.habitIcon, { backgroundColor: isCompleted ? '#10B98120' : colors.primary + '20' }]}>
                                    <Ionicons name={habit.icon || 'star'} size={20} color={isCompleted ? '#10B981' : colors.primary} />
                                </View>
                                <Text style={[
                                    styles.habitTitle,
                                    {
                                        color: isCompleted ? '#10B981' : colors.text,
                                        textDecorationLine: isCompleted ? 'line-through' : 'none'
                                    }
                                ]}>{habit.title}</Text>
                                <Ionicons
                                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                                    size={22}
                                    color={isCompleted ? '#10B981' : colors.subtext}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </GlassView>


                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB - Add Habit Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={async () => {
                    const loadedHabits = await getHabits();
                    setAllHabits(loadedHabits);
                    setShowManageHabits(true);
                    setShowAddHabitForm(true);
                }}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>


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

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddTask(true)}
            >
                <GlassView style={styles.fabIcon}>
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                </GlassView>
            </TouchableOpacity>

            {/* Add Task Modal */}
            <Modal visible={showAddTask} animationType="slide" transparent onRequestClose={() => setShowAddTask(false)}>
                <View style={[styles.newTaskModalOverlay, { backgroundColor: colors.background }]}>
                    <View style={styles.newTaskHeader}>
                        <TouchableOpacity onPress={() => setShowAddTask(false)} style={styles.newTaskCloseBtn}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.newTaskHeaderTitle, { color: colors.text }]}>New Task</Text>
                    </View>

                    <ScrollView style={styles.newTaskBody} showsVerticalScrollIndicator={false}>
                        {/* What? Section */}
                        <Text style={[styles.newTaskLabel, { color: colors.subtext }]}>What?</Text>
                        <View style={styles.newTaskInputContainer}>
                            <Ionicons name="create-outline" size={24} color={colors.primary} style={styles.newTaskInputIcon} />
                            <TextInput
                                style={[styles.newTaskInput, { color: colors.text, borderBottomColor: colors.primary }]}
                                placeholder="Task title"
                                placeholderTextColor={colors.subtext}
                                value={newTaskTitle}
                                onChangeText={setNewTaskTitle}
                                autoFocus
                            />
                        </View>

                        {/* Time & Duration Picker */}
                        <TouchableOpacity
                            onPress={() => setShowTaskTimePicker(true)}
                            style={[styles.newTaskTimeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                            <View style={styles.newTaskTimeInfo}>
                                <Text style={[styles.newTaskTimeText, { color: colors.text }]}>
                                    {newTaskTime || 'Select time'}
                                </Text>
                                {newTaskDuration && (
                                    <Text style={[styles.newTaskDurationText, { color: colors.subtext }]}>
                                        ({newTaskDuration}m)
                                    </Text>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
                        </TouchableOpacity>

                        {/* Duration Input */}
                        <View style={[styles.newTaskTimeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder, marginTop: 12 }]}>
                            <Ionicons name="hourglass-outline" size={20} color={colors.primary} />
                            <TextInput
                                style={[styles.newTaskDurationInput, { color: colors.text }]}
                                placeholder="Duration (minutes)"
                                placeholderTextColor={colors.subtext}
                                value={newTaskDuration}
                                onChangeText={setNewTaskDuration}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Recent/Suggested Tasks */}
                        {tasks.length > 0 && (
                            <>
                                <Text style={[styles.newTaskSectionLabel, { color: colors.subtext }]}>Recent Tasks</Text>
                                {tasks.slice(0, 5).map((task, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[styles.suggestedTaskCard, { backgroundColor: colors.glass + '80', borderColor: colors.glassBorder }]}
                                        onPress={() => {
                                            setNewTaskTitle(task.title);
                                            setNewTaskTime(task.time);
                                            setNewTaskDuration(task.duration?.toString() || '');
                                        }}
                                    >
                                        <View style={[styles.suggestedTaskIcon, { backgroundColor: colors.primary + '20' }]}>
                                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                        </View>
                                        <View style={styles.suggestedTaskInfo}>
                                            {task.time && task.duration && getEndTime(task.time, task.duration) && (
                                                <Text style={[styles.suggestedTaskTime, { color: colors.subtext }]}>
                                                    {task.time} - {getEndTime(task.time, task.duration)} ({task.duration}m)
                                                </Text>
                                            )}
                                            <Text style={[styles.suggestedTaskTitle, { color: colors.text }]}>
                                                {task.title}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}

                        <View style={{ height: 120 }} />
                    </ScrollView>

                    {/* Continue Button */}
                    <View style={[styles.newTaskFooter, { backgroundColor: colors.background }]}>
                        <TouchableOpacity
                            style={[styles.newTaskContinueBtn, { backgroundColor: colors.primary }]}
                            onPress={handleAddTask}
                        >
                            <Text style={styles.newTaskContinueText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal visible={showTaskTimePicker} animationType="slide" transparent onRequestClose={() => setShowTaskTimePicker(false)}>
                <View style={styles.modalOverlay}>
                    <GlassView style={[styles.timePickerModal, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTaskTimePicker(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pickerContainer}>
                            {/* Hours */}
                            <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                                {[...Array(12).keys()].map(i => {
                                    const hour = i + 1;
                                    return (
                                        <TouchableOpacity
                                            key={hour}
                                            style={[styles.pickerItem, selectedHour === hour && styles.selectedPickerItem]}
                                            onPress={() => handleHourSelect(hour)}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                { color: colors.subtext },
                                                selectedHour === hour && { color: colors.primary, fontWeight: 'bold' }
                                            ]}>{hour}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <Text style={{ color: colors.text, fontSize: 24, alignSelf: 'center' }}>:</Text>

                            {/* Minutes */}
                            <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                                {[...Array(60).keys()].map(i => {
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.pickerItem, selectedMinute === i && styles.selectedPickerItem]}
                                            onPress={() => handleMinuteSelect(i)}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                { color: colors.subtext },
                                                selectedMinute === i && { color: colors.primary, fontWeight: 'bold' }
                                            ]}>{i.toString().padStart(2, '0')}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Period */}
                            <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                                {['AM', 'PM'].map(period => (
                                    <TouchableOpacity
                                        key={period}
                                        style={[styles.pickerItem, selectedPeriod === period && styles.selectedPickerItem]}
                                        onPress={() => handlePeriodSelect(period)}
                                    >
                                        <Text style={[
                                            styles.pickerItemText,
                                            { color: colors.subtext },
                                            selectedPeriod === period && { color: colors.primary, fontWeight: 'bold' }
                                        ]}>{period}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={handleTaskTimeConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Set Time</Text>
                        </TouchableOpacity>
                    </GlassView>
                </View>
            </Modal>

            {/* Task Details Modal */}
            <Modal visible={showTaskDetails} animationType="fade" transparent onRequestClose={() => setShowTaskDetails(false)}>
                <View style={styles.detailsOverlay}>
                    <TouchableOpacity style={styles.detailsOverlayTouch} activeOpacity={1} onPress={() => setShowTaskDetails(false)} />
                    <View style={[styles.detailsCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
                        <View style={styles.detailsHeader}>
                            <View style={[styles.detailsIconContainer, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="document-text" size={28} color={colors.primary} />
                            </View>
                            <TouchableOpacity onPress={() => setShowTaskDetails(false)} style={[styles.detailsCloseButton, { backgroundColor: colors.glass }]}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedTask && (
                            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailsContent}>
                                <Text style={[styles.detailsTitle, { color: colors.text }]}>{selectedTask.title}</Text>

                                <View style={styles.detailsRow}>
                                    <View style={[styles.detailsTag, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="time" size={16} color={colors.primary} />
                                        <Text style={{ color: colors.primary, fontWeight: '600' }}>{selectedTask.time}</Text>
                                    </View>
                                    <View style={[styles.detailsTag, { backgroundColor: getPriorityColor(selectedTask.priority) + '15' }]}>
                                        <Ionicons name="flag" size={16} color={getPriorityColor(selectedTask.priority)} />
                                        <Text style={{ color: getPriorityColor(selectedTask.priority), fontWeight: '600' }}>
                                            {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)} Priority
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.detailsSection}>
                                    <View style={styles.detailsSectionHeader}>
                                        <Ionicons name="checkbox" size={20} color={selectedTask.completed ? colors.accent : colors.subtext} />
                                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Status</Text>
                                    </View>
                                    <Text style={{ color: selectedTask.completed ? colors.accent : colors.subtext, fontSize: 15, paddingLeft: 28 }}>
                                        {selectedTask.completed ? 'Completed' : 'Pending'}
                                    </Text>
                                </View>

                                {selectedTask.notes && (
                                    <View style={styles.detailsSection}>
                                        <View style={styles.detailsSectionHeader}>
                                            <Ionicons name="text" size={20} color={colors.text} />
                                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Notes</Text>
                                        </View>
                                        <View style={[styles.detailsNotesBox, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                                            <Text style={[styles.detailsNotes, { color: colors.text }]}>{selectedTask.notes}</Text>
                                        </View>
                                    </View>
                                )}

                                {selectedTask.duration && (
                                    <View style={styles.detailsSection}>
                                        <View style={styles.detailsSectionHeader}>
                                            <Ionicons name="hourglass" size={20} color={colors.text} />
                                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Duration</Text>
                                        </View>
                                        <Text style={{ color: colors.subtext, fontSize: 15, paddingLeft: 28 }}>
                                            {selectedTask.duration} minutes
                                        </Text>
                                        <Text style={{ color: colors.primary, fontSize: 14, paddingLeft: 28, marginTop: 4, fontWeight: '500' }}>
                                            {selectedTask.time} - {getEndTime(selectedTask.time, selectedTask.duration)}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Manage Habits Modal */}
            <Modal visible={showManageHabits} animationType="slide" transparent onRequestClose={() => setShowManageHabits(false)}>
                <View style={[styles.manageHabitsModal, { backgroundColor: colors.background }]}>
                    <View style={styles.manageHabitsHeader}>
                        <TouchableOpacity onPress={() => setShowManageHabits(false)}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.manageHabitsModalTitle, { color: colors.text }]}>Manage Habits</Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {!showAddHabitForm ? (
                        <ScrollView style={styles.habitsListContainer} showsVerticalScrollIndicator={false}>
                            {allHabits.length === 0 ? (
                                <View style={styles.emptyHabitsContainer}>
                                    <Ionicons name="star-outline" size={64} color={colors.subtext} style={{ opacity: 0.5 }} />
                                    <Text style={[styles.emptyHabitsText, { color: colors.subtext }]}>No habits yet</Text>
                                    <Text style={[styles.emptyHabitsSubtext, { color: colors.subtext }]}>Tap the + button to create your first habit</Text>
                                </View>
                            ) : (
                                allHabits.map((habit) => (
                                    <GlassView key={habit.id} style={[styles.habitListItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder, alignItems: 'flex-start' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                            <View style={{ alignItems: 'flex-start', maxWidth: '70%' }}>
                                                <View style={[styles.habitListIcon, { backgroundColor: colors.primary + '20', marginRight: 0, marginBottom: 12 }]}>
                                                    <Ionicons name={habit.icon || 'star'} size={24} color={colors.primary} />
                                                </View>

                                                <Text style={[styles.habitListTitle, { color: colors.text, marginBottom: 4 }]}>{habit.title}</Text>
                                                {habit.time && (
                                                    <Text style={[styles.habitListTime, { color: colors.subtext, marginBottom: 2 }]}>
                                                        <Ionicons name="time-outline" size={12} color={colors.subtext} /> {habit.time}
                                                    </Text>
                                                )}
                                                {habit.frequency && (
                                                    <Text style={[styles.habitListFrequency, { color: colors.subtext }]}>{habit.frequency}</Text>
                                                )}
                                            </View>

                                            <View style={{ flex: 1 }} />

                                            <TouchableOpacity
                                                onPress={() => confirmDeleteHabit(habit.id)}
                                                style={[styles.habitDeleteBtn, { backgroundColor: colors.danger + '20', marginTop: 4 }]}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </GlassView>
                                ))
                            )}
                            <View style={{ height: 150 }} />
                        </ScrollView>
                    ) : (
                        <ScrollView style={styles.addHabitForm} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.habitFormLabel, { color: colors.subtext }]}>NAME</Text>
                            <GlassView style={styles.habitInputContainer}>
                                <TextInput
                                    style={[styles.habitInput, { color: colors.text }]}
                                    placeholder="e.g., Morning Walk"
                                    placeholderTextColor={colors.subtext}
                                    value={habitTitle}
                                    onChangeText={setHabitTitle}
                                    autoFocus
                                />
                            </GlassView>

                            <Text style={[styles.habitFormLabel, { color: colors.subtext }]}>TIME</Text>
                            <TouchableOpacity onPress={() => setShowHabitTimePicker(true)}>
                                <GlassView style={styles.habitInputContainer}>
                                    <View style={styles.habitTimeRow}>
                                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                                        <Text style={[styles.habitInput, {
                                            color: habitTime ? colors.text : colors.subtext,
                                            flex: 1,
                                            marginLeft: 8
                                        }]}>
                                            {habitTime || 'Select time'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color={colors.subtext} />
                                    </View>
                                </GlassView>
                            </TouchableOpacity>

                            <Text style={[styles.habitFormLabel, { color: colors.subtext }]}>ICON</Text>
                            <View style={styles.habitIconGrid}>
                                {['fitness', 'water', 'book', 'moon', 'sunny', 'bicycle', 'walk', 'nutrition', 'medkit', 'leaf'].map(icon => (
                                    <TouchableOpacity key={icon} onPress={() => setHabitIcon(icon)}>
                                        <GlassView
                                            style={[
                                                styles.habitIconOption,
                                                habitIcon === icon && { borderColor: colors.primary, backgroundColor: colors.glass }
                                            ]}
                                        >
                                            <Ionicons
                                                name={icon}
                                                size={24}
                                                color={habitIcon === icon ? colors.primary : colors.subtext}
                                            />
                                        </GlassView>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.habitFormLabel, { color: colors.subtext }]}>FREQUENCY</Text>
                            <View style={styles.habitFreqRow}>
                                {['Daily', 'Weekly', 'Monthly'].map(freq => (
                                    <TouchableOpacity key={freq} onPress={() => setHabitFrequency(freq)} style={{ flex: 1 }}>
                                        <GlassView
                                            style={[
                                                styles.habitFreqButton,
                                                habitFrequency === freq && { backgroundColor: colors.primary }
                                            ]}
                                        >
                                            <Text style={[
                                                styles.habitFreqText,
                                                { color: habitFrequency === freq ? '#ffffff' : colors.subtext }
                                            ]}>
                                                {freq}
                                            </Text>
                                        </GlassView>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={{ height: 150 }} />
                        </ScrollView>
                    )}

                    {/* Bottom Buttons */}
                    <View style={[styles.manageHabitsFooter, { backgroundColor: colors.background, borderTopColor: colors.glassBorder }]}>
                        {!showAddHabitForm ? (
                            <TouchableOpacity
                                style={[styles.addHabitFab, { backgroundColor: colors.primary }]}
                                onPress={() => setShowAddHabitForm(true)}
                            >
                                <Ionicons name="add" size={28} color="#FFFFFF" />
                                <Text style={styles.addHabitFabText}>Add New Habit</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.formFooterButtons}>
                                <TouchableOpacity
                                    style={[styles.formCancelBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                                    onPress={() => {
                                        setShowAddHabitForm(false);
                                        setHabitTitle('');
                                        setHabitTime('');
                                        setHabitIcon('fitness');
                                        setHabitFrequency('Daily');
                                    }}
                                >
                                    <Text style={[styles.formCancelText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.formSaveBtn, { backgroundColor: colors.primary, opacity: habitTitle.trim() ? 1 : 0.5 }]}
                                    onPress={handleSaveHabit}
                                    disabled={!habitTitle.trim()}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.formSaveText}>Save Habit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Habit Time Picker Modal */}
                    <Modal visible={showHabitTimePicker} animationType="slide" transparent>
                        <View style={styles.modalOverlay}>
                            <GlassView style={[styles.timePickerModal, { backgroundColor: colors.background }]}>
                                <View style={styles.timePickerHeader}>
                                    <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                                    <TouchableOpacity onPress={() => setShowHabitTimePicker(false)}>
                                        <Ionicons name="close" size={24} color={colors.subtext} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', height: 200, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                    <ScrollView
                                        style={{ flex: 1, maxHeight: 200 }}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingVertical: 80 }}
                                    >
                                        {[...Array(12)].map((_, i) => {
                                            const hour = i + 1;
                                            return (
                                                <TouchableOpacity
                                                    key={hour}
                                                    onPress={() => handleHabitHourSelect(hour)}
                                                    style={{ padding: 8, alignItems: 'center' }}
                                                >
                                                    <Text style={{
                                                        color: habitHour === hour ? colors.primary : colors.subtext,
                                                        fontSize: habitHour === hour ? 32 : 20,
                                                        fontWeight: habitHour === hour ? '700' : '500',
                                                    }}>
                                                        {hour}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>

                                    <Text style={{ color: colors.text, fontSize: 32, fontWeight: '700' }}>:</Text>

                                    <ScrollView
                                        style={{ flex: 1, maxHeight: 200 }}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingVertical: 80 }}
                                    >
                                        {[...Array(60)].map((_, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => handleHabitMinuteSelect(i)}
                                                style={{ padding: 8, alignItems: 'center' }}
                                            >
                                                <Text style={{
                                                    color: habitMinute === i ? colors.primary : colors.subtext,
                                                    fontSize: habitMinute === i ? 32 : 20,
                                                    fontWeight: habitMinute === i ? '700' : '500',
                                                }}>
                                                    {i.toString().padStart(2, '0')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <ScrollView
                                        style={{ flex: 1, maxHeight: 200 }}
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingVertical: 80 }}
                                    >
                                        {['AM', 'PM'].map((period) => (
                                            <TouchableOpacity
                                                key={period}
                                                onPress={() => handleHabitPeriodSelect(period)}
                                                style={{ padding: 8, alignItems: 'center' }}
                                            >
                                                <Text style={{
                                                    color: habitPeriod === period ? colors.primary : colors.subtext,
                                                    fontSize: habitPeriod === period ? 32 : 20,
                                                    fontWeight: habitPeriod === period ? '700' : '500',
                                                }}>
                                                    {period}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                                    onPress={handleHabitTimeConfirm}
                                >
                                    <Text style={styles.confirmButtonText}>Set Time</Text>
                                </TouchableOpacity>
                            </GlassView>
                        </View>
                    </Modal>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={showDeleteConfirm} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <GlassView style={{ width: '100%', maxWidth: 340, padding: 24, borderRadius: 24, backgroundColor: colors.background }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>Delete Habit?</Text>
                        <Text style={{ fontSize: 15, color: colors.subtext, marginBottom: 24, lineHeight: 22 }}>
                            Are you sure you want to delete this habit? This action cannot be undone.
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowDeleteConfirm(false)}
                                style={{ padding: 12, borderRadius: 12 }}
                            >
                                <Text style={{ color: colors.subtext, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={proceedDeleteHabit}
                                style={{ backgroundColor: colors.danger, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </GlassView>
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

    // Calendar Header
    calendarHeader: {
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    calendarMonth: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    calendarWeek: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    calendarDayColumn: {
        flex: 1,
        alignItems: 'center',
    },
    calendarDayLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    calendarDayNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    calendarDayText: {
        fontSize: 16,
        fontWeight: '600',
    },
    calendarDots: {
        flexDirection: 'row',
        gap: 4,
    },
    calendarDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },

    // Vertical Timeline
    verticalTimelineContainer: {
        padding: 16,
        marginBottom: 24,
    },
    verticalTimelineItem: {
        flexDirection: 'row',
        marginBottom: 0,
        minHeight: 100,
    },
    timelineTimeColumn: {
        width: 65,
        paddingTop: 8,
        paddingRight: 8,
    },
    timelineTimeLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    timelineEndTimeLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    timelineNodeColumn: {
        width: 60,
        alignItems: 'center',
        position: 'relative',
    },
    verticalLine: {
        width: 3,
        flex: 1,
        minHeight: 20,
    },
    timelineCircleNode: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineTaskContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: 8,
        paddingBottom: 16,
    },
    timelineTaskInner: {
        flex: 1,
    },
    timelineTaskHeader: {
        marginBottom: 6,
    },
    timelineTaskTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timelineTaskTime: {
        fontSize: 12,
        fontWeight: '600',
    },
    timelineTaskTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
    },
    timelineTaskNotes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    timelineTaskNotesText: {
        fontSize: 13,
        flex: 1,
    },
    overlapWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    overlapWarningText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    timelineCheckCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        marginTop: 8,
    },
    timelineCheckFill: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },

    // Timeline (old styles for compatibility)
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

    // Additional Styles
    fabIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
    closeButton: { padding: 4 },
    inputContainer: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },

    // New Task Modal Styles
    newTaskModalOverlay: {
        flex: 1,
        paddingTop: 50,
    },
    newTaskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    newTaskCloseBtn: {
        marginRight: 16,
    },
    newTaskHeaderTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    newTaskBody: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    newTaskLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
        marginTop: 8,
    },
    newTaskInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    newTaskInputIcon: {
        marginRight: 12,
    },
    newTaskInput: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 12,
        borderBottomWidth: 2,
    },
    newTaskTimeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
    },
    newTaskTimeInfo: {
        flex: 1,
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    newTaskTimeText: {
        fontSize: 16,
        fontWeight: '500',
    },
    newTaskDurationText: {
        fontSize: 14,
    },
    newTaskDurationInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    newTaskSectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    suggestedTaskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    suggestedTaskIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    suggestedTaskInfo: {
        flex: 1,
    },
    suggestedTaskTime: {
        fontSize: 12,
        marginBottom: 4,
    },
    suggestedTaskTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    newTaskFooter: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    newTaskContinueBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newTaskContinueText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },

    timeDisplayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
    textArea: { height: 100, textAlignVertical: 'top' },

    // Time Picker
    timePickerModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: 400 },
    pickerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 200, marginBottom: 24 },
    pickerColumn: { width: 60, height: 200 },
    pickerItem: { height: 50, justifyContent: 'center', alignItems: 'center' },
    pickerItemText: { fontSize: 20 },
    selectedPickerItem: { backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 8 },
    confirmButton: { padding: 16, borderRadius: 16, alignItems: 'center' },
    confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

    // Task Details
    detailsOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', padding: 20, zIndex: 9999 },
    detailsOverlayTouch: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 },
    detailsCard: { borderRadius: 24, padding: 24, maxHeight: '85%', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15, zIndex: 2 },
    detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    detailsIconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    detailsCloseButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    detailsTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16, lineHeight: 32 },
    detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
    detailsTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    detailsSection: { marginBottom: 20 },
    detailsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    detailsNotesBox: { padding: 16, borderRadius: 16 },
    detailsNotes: { fontSize: 15, lineHeight: 22 },

    // Swipe Actions
    swipeActionsContainer: { flexDirection: 'row', alignItems: 'center' },
    infoAction: { backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' },
    infoText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 4 },
    deleteAction: { backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', width: 80, height: '100%' },
    deleteText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', marginTop: 4 },
    taskNotes: { fontSize: 14, marginTop: 4 },

    // Manage Habits Button
    manageHabitsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginTop: 16,
        marginHorizontal: 16,
    },
    manageHabitsIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    manageHabitsTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    manageHabitsSubtitle: {
        fontSize: 14,
        lineHeight: 20,
    },

    // Manage Habits Modal
    manageHabitsModal: {
        flex: 1,
        paddingTop: 50,
    },
    manageHabitsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    manageHabitsModalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    habitsListContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    emptyHabitsContainer: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyHabitsText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    emptyHabitsSubtext: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    habitListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    habitListIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    habitListTitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    habitListTime: {
        fontSize: 13,
        marginBottom: 2,
    },
    habitListFrequency: {
        fontSize: 12,
    },
    habitDeleteBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addHabitForm: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    habitFormLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 20,
    },
    habitInputContainer: {
        padding: 16,
    },
    habitInput: {
        fontSize: 18,
    },
    habitTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    habitIconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    habitIconOption: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    habitFreqRow: {
        flexDirection: 'row',
        gap: 12,
    },
    habitFreqButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    habitFreqText: {
        fontWeight: '600',
    },
    manageHabitsFooter: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 30,
        borderTopWidth: 1,
    },
    addHabitFab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 10,
    },
    addHabitFabText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    formFooterButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    formCancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    formCancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    formSaveBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    formSaveText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // FAB Button
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
