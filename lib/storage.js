import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    HABITS: 'habits',
    LOGS: 'logs',
    USER_SETTINGS: 'user_settings',
};

// Habits
export const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getHabits = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.HABITS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading habits', e);
        return [];
    }
};

export const saveHabit = async (habit) => {
    try {
        const habits = await getHabits();
        const newHabits = [...habits, { ...habit, id: habit.id || Date.now().toString(), createdAt: new Date().toISOString() }];
        await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(newHabits));
        return newHabits;
    } catch (e) {
        console.error('Error saving habit', e);
    }
};

export const updateHabit = async (updatedHabit) => {
    try {
        const habits = await getHabits();
        const newHabits = habits.map(h => h.id === updatedHabit.id ? updatedHabit : h);
        await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(newHabits));
        return newHabits;
    } catch (e) {
        console.error('Error updating habit', e);
    }
};

export const deleteHabit = async (id) => {
    try {
        const habits = await getHabits();
        const newHabits = habits.filter(h => h.id !== id);
        await AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(newHabits));
        return newHabits;
    } catch (e) {
        console.error('Error deleting habit', e);
    }
};

// Logs (Completions)
export const getLogs = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(KEYS.LOGS);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error('Error reading logs', e);
        return {};
    }
};

export const logHabitCompletion = async (habitId, date) => {
    try {
        const logs = await getLogs();
        const dateKey = date || new Date().toISOString().split('T')[0];

        if (!logs[dateKey]) {
            logs[dateKey] = [];
        }

        if (!logs[dateKey].includes(habitId)) {
            logs[dateKey].push(habitId);
            await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
        }
        return logs;
    } catch (e) {
        console.error('Error logging completion', e);
    }
};

export const removeHabitCompletion = async (habitId, date) => {
    try {
        const logs = await getLogs();
        const dateKey = date || new Date().toISOString().split('T')[0];

        if (logs[dateKey]) {
            logs[dateKey] = logs[dateKey].filter(id => id !== habitId);
            await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
        }
        return logs;
    } catch (e) {
        console.error('Error removing completion', e);
    }
};

export const getTodayLogs = async () => {
    const logs = await getLogs();
    const today = getLocalDate();
    return logs[today] || [];
}

// Streak Calculation
export const calculateStreak = async (habitId) => {
    try {
        const logs = await getLogs();
        const dates = Object.keys(logs)
            .filter(date => logs[date].includes(habitId))
            .sort()
            .reverse();

        if (dates.length === 0) return { current: 0, longest: 0 };

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date().toISOString().split('T')[0];

        // Calculate current streak
        for (let i = 0; i < dates.length; i++) {
            if (i === 0) {
                const daysDiff = getDaysDifference(dates[i], today);
                if (daysDiff <= 1) {
                    currentStreak = 1;
                    tempStreak = 1;
                } else {
                    break;
                }
            } else {
                const daysDiff = getDaysDifference(dates[i], dates[i - 1]);
                if (daysDiff === 1) {
                    currentStreak++;
                    tempStreak++;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        tempStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
            const daysDiff = getDaysDifference(dates[i + 1], dates[i]);
            if (daysDiff === 1) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

        return { current: currentStreak, longest: longestStreak };
    } catch (e) {
        console.error('Error calculating streak', e);
        return { current: 0, longest: 0 };
    }
};

// Helper function to get days difference
const getDaysDifference = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get Habit Statistics
export const getHabitStats = async (habitId) => {
    try {
        const logs = await getLogs();
        const completions = Object.keys(logs).filter(date => logs[date].includes(habitId));
        const streak = await calculateStreak(habitId);

        // Calculate completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const recentCompletions = completions.filter(date => date >= thirtyDaysAgoStr);
        const completionRate = (recentCompletions.length / 30) * 100;

        return {
            totalCompletions: completions.length,
            currentStreak: streak.current,
            longestStreak: streak.longest,
            completionRate: Math.round(completionRate),
            lastCompletion: completions.length > 0 ? completions[completions.length - 1] : null,
        };
    } catch (e) {
        console.error('Error getting habit stats', e);
        return {
            totalCompletions: 0,
            currentStreak: 0,
            longestStreak: 0,
            completionRate: 0,
            lastCompletion: null,
        };
    }
};

// Get Overall Statistics
export const getOverallStats = async () => {
    try {
        const habits = await getHabits();
        const logs = await getLogs();
        const todayLogs = await getTodayLogs();

        let totalStreaks = 0;
        let longestStreak = 0;

        for (const habit of habits) {
            const streak = await calculateStreak(habit.id);
            totalStreaks += streak.current;
            longestStreak = Math.max(longestStreak, streak.longest);
        }

        return {
            totalHabits: habits.length,
            completedToday: todayLogs.length,
            todayPercentage: habits.length > 0 ? Math.round((todayLogs.length / habits.length) * 100) : 0,
            totalCompletions: Object.values(logs).flat().length,
            longestStreak,
        };
    } catch (e) {
        console.error('Error getting overall stats', e);
        return {
            totalHabits: 0,
            completedToday: 0,
            todayPercentage: 0,
            totalCompletions: 0,
            longestStreak: 0,
        };
    }
};

// =======================
// WELLNESS TRACKING
// =======================

// Water Tracking
export const getWaterLogs = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('water_logs_final');
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error('Error reading water logs', e);
        return {};
    }
};

export const logWater = async (amount, date) => {
    try {
        const logs = await getWaterLogs();
        const dateKey = date || getLocalDate();

        if (!logs[dateKey]) {
            logs[dateKey] = [];
        }

        logs[dateKey].push({
            amount,
            timestamp: new Date().toISOString(),
        });

        await AsyncStorage.setItem('water_logs_final', JSON.stringify(logs));
        return logs;
    } catch (e) {
        console.error('Error logging water', e);
    }
};

export const getWaterGoal = async () => {
    try {
        const goal = await AsyncStorage.getItem('water_goal');
        return goal ? parseInt(goal) : 3000; // 3000ml default
    } catch (e) {
        console.error('Error reading water goal', e);
        return 3000;
    }
};

export const setWaterGoal = async (goal) => {
    try {
        await AsyncStorage.setItem('water_goal', goal.toString());
    } catch (e) {
        console.error('Error setting water goal', e);
    }
};

// Sleep Tracking
export const getSleepSessions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('sleep_sessions');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading sleep sessions', e);
        return [];
    }
};

export const startSleep = async () => {
    try {
        const sessions = await getSleepSessions();
        const newSession = {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
        };
        sessions.push(newSession);
        await AsyncStorage.setItem('sleep_sessions', JSON.stringify(sessions));
        return newSession;
    } catch (e) {
        console.error('Error starting sleep', e);
    }
};

export const endSleep = async (sessionId) => {
    try {
        const sessions = await getSleepSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.endTime = new Date().toISOString();
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            session.duration = (end - start) / 1000 / 60; // minutes
            await AsyncStorage.setItem('sleep_sessions', JSON.stringify(sessions));
            return session;
        }
    } catch (e) {
        console.error('Error ending sleep', e);
    }
};

// Fasting Tracking
export const getFastingSessions = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('fasting_sessions');
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading fasting sessions', e);
        return [];
    }
};

export const startFasting = async () => {
    try {
        const sessions = await getFastingSessions();
        const newSession = {
            id: Date.now().toString(),
            startTime: new Date().toISOString(),
            endTime: null,
            duration: null,
            targetDuration: 16 * 60, // 16 hours in minutes
        };
        sessions.push(newSession);
        await AsyncStorage.setItem('fasting_sessions', JSON.stringify(sessions));
        return newSession;
    } catch (e) {
        console.error('Error starting fasting', e);
    }
};

export const endFasting = async (sessionId) => {
    try {
        const sessions = await getFastingSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            session.endTime = new Date().toISOString();
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            session.duration = (end - start) / 1000 / 60; // minutes
            await AsyncStorage.setItem('fasting_sessions', JSON.stringify(sessions));
            return session;
        }
    } catch (e) {
        console.error('Error ending fasting', e);
    }
};

// Mood Journal
export const getMoodEntries = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('mood_entries');
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error('Error reading mood entries', e);
        return {};
    }
};

export const saveMoodEntry = async (mood, note, date) => {
    try {
        const entries = await getMoodEntries();
        const dateKey = date || new Date().toISOString().split('T')[0];

        entries[dateKey] = {
            mood, // emoji string
            note,
            timestamp: new Date().toISOString(),
        };

        await AsyncStorage.setItem('mood_entries', JSON.stringify(entries));
        return entries;
    } catch (e) {
        console.error('Error saving mood entry', e);
    }
};

// =======================
// TASKS & ROUTINES
// =======================

// Tasks
export const getTasks = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('tasks');
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (e) {
        console.error('Error reading tasks', e);
        return {};
    }
};

export const saveTask = async (task) => {
    try {
        const tasks = await getTasks();
        const dateKey = task.date || new Date().toISOString().split('T')[0];

        if (!tasks[dateKey]) {
            tasks[dateKey] = [];
        }

        const newTask = {
            id: task.id || Date.now().toString(),
            title: task.title,
            time: task.time,
            duration: task.duration || 30,
            priority: task.priority || 'medium', // high, medium, low
            completed: false,
            ...task,
        };

        tasks[dateKey].push(newTask);
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        return newTask;
    } catch (e) {
        console.error('Error saving task', e);
    }
};

export const updateTask = async (taskId, updates, date) => {
    try {
        const tasks = await getTasks();
        const dateKey = date || new Date().toISOString().split('T')[0];

        if (tasks[dateKey]) {
            tasks[dateKey] = tasks[dateKey].map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            );
            await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        }
        return tasks;
    } catch (e) {
        console.error('Error updating task', e);
    }
};

export const deleteTask = async (taskId, date) => {
    try {
        const tasks = await getTasks();
        const dateKey = date || new Date().toISOString().split('T')[0];

        if (tasks[dateKey]) {
            tasks[dateKey] = tasks[dateKey].filter(task => task.id !== taskId);
            await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        }
        return tasks;
    } catch (e) {
        console.error('Error deleting task', e);
    }
};

export const getTodayTasks = async () => {
    const tasks = await getTasks();
    const today = new Date().toISOString().split('T')[0];
    return tasks[today] || [];
};

// Routines
export const getRoutineTemplates = () => {
    return [
        {
            id: 'morning',
            title: 'Morning Routine',
            icon: 'sunny',
            color: '#F59E0B',
            tasks: [
                { title: 'Wake up & Stretch', time: '07:00', duration: 15 },
                { title: 'Breakfast', time: '07:30', duration: 30 },
                { title: 'Plan the day', time: '08:00', duration: 15 },
            ],
        },
        {
            id: 'evening',
            title: 'Evening Routine',
            icon: 'moon',
            color: '#818CF8',
            tasks: [
                { title: 'Review the day', time: '20:00', duration: 15 },
                { title: 'Dinner', time: '20:30', duration: 30 },
                { title: 'Wind down', time: '21:30', duration: 30 },
            ],
        },
        {
            id: 'work',
            title: 'Work Routine',
            icon: 'briefcase',
            color: '#6366F1',
            tasks: [
                { title: 'Check emails', time: '09:00', duration: 30 },
                { title: 'Focus work', time: '10:00', duration: 120 },
                { title: 'Lunch break', time: '12:00', duration: 60 },
            ],
        },
        {
            id: 'study',
            title: 'Study Routine',
            icon: 'book',
            color: '#34D399',
            tasks: [
                { title: 'Review notes', time: '16:00', duration: 30 },
                { title: 'Deep study', time: '17:00', duration: 90 },
                { title: 'Practice problems', time: '19:00', duration: 60 },
            ],
        },
    ];
};

export const applyRoutine = async (routineId) => {
    try {
        const templates = getRoutineTemplates();
        const routine = templates.find(r => r.id === routineId);

        if (routine) {
            for (const task of routine.tasks) {
                await saveTask(task);
            }
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error applying routine', e);
        return false;
    }
};

// Clear All Data
export const clearAllData = async () => {
    try {
        await AsyncStorage.clear();
    } catch (e) {
        console.error('Error clearing data', e);
    }
}
