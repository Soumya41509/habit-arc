import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassView from '../../components/GlassView';
import {
    getOverallStats,
    getHabits,
    getLogs,
    getWaterLogs,
    getSleepSessions,
    getFastingSessions,
    getTasks
} from '../../lib/storage';

export default function Analytics() {
    const { colors } = useTheme();
    const [stats, setStats] = useState(null);
    const [monthlyStats, setMonthlyStats] = useState(null);

    const [dailyStats, setDailyStats] = useState([]);
    const [dayHabits, setDayHabits] = useState([]);
    const [dailyWellness, setDailyWellness] = useState({ water: 0, sleep: 0, fasting: 0 });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [selectedDate])
    );

    const loadStats = async () => {
        const overallStats = await getOverallStats();
        setStats(overallStats);

        const monthly = await getMonthlyStats();
        setMonthlyStats(monthly);



        const daily = await getDailyStats();
        setDailyStats(daily);

        await getDayDetails();
    };

    const getDayDetails = async () => {
        const habits = await getHabits();
        const logs = await getLogs();

        // Construct local date string YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // 1. Habits & Tasks
        const completedIds = logs[dateStr] || [];
        const habitsList = habits.map(habit => ({
            ...habit,
            type: 'habit',
            completed: completedIds.includes(habit.id)
        }));

        const allTasks = await getTasks();
        const dailyTasks = allTasks[dateStr] || [];
        const tasksList = dailyTasks.map(task => ({
            ...task,
            type: 'task',
            icon: 'checkbox-outline', // differentiate icon
            // Tasks object already has 'completed' boolean
        }));

        // Combine and sort (completed at bottom?)
        const combinedItems = [...habitsList, ...tasksList];

        setDayHabits(combinedItems);

        // 2. Wellness Stats
        // Water
        const waterLogs = await getWaterLogs();
        const dayWaterLogs = waterLogs[dateStr] || [];
        const totalWater = dayWaterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);

        // Sleep (Sessions starting on this day)
        const sleepSessions = await getSleepSessions();
        const totalSleep = sleepSessions.reduce((sum, session) => {
            if (session.startTime && session.startTime.startsWith(dateStr) && session.duration) {
                return sum + session.duration; // in minutes
            }
            return sum;
        }, 0);

        // Fasting (Sessions starting on this day)
        const fastingSessions = await getFastingSessions();
        const totalFasting = fastingSessions.reduce((sum, session) => {
            if (session.startTime && session.startTime.startsWith(dateStr) && session.duration) {
                return sum + session.duration; // in minutes
            }
            return sum;
        }, 0);

        setDailyWellness({
            water: totalWater,
            sleep: Math.round(totalSleep),
            fasting: Math.round(totalFasting)
        });
    };

    const getDailyStats = async () => {
        const logs = await getLogs();
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const stats = new Array(daysInMonth).fill(0);

        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

        Object.entries(logs).forEach(([date, habitIds]) => {
            if (date.startsWith(prefix)) {
                const day = parseInt(date.split('-')[2]);
                if (day >= 1 && day <= daysInMonth) {
                    stats[day - 1] = habitIds.length;
                }
            }
        });
        return stats;
    };

    const getMonthlyStats = async () => {
        const logs = await getLogs();
        const currentMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;

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



    const getMonthName = (date = new Date()) => {
        return date.toLocaleDateString('en-US', { month: 'long' });
    };

    const getYear = (date = new Date()) => {
        return date.getFullYear();
    };

    const generateCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const completionRate = monthlyStats ? Math.round((monthlyStats.activeDays / new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()) * 100) : 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
                        <Text style={{ fontSize: 14, color: colors.subtext, marginTop: 4 }}>
                            Track your progress
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{ padding: 12, backgroundColor: colors.primary + '20', borderRadius: 16 }}
                    >
                        <Ionicons name="calendar" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                    <GlassView style={{ flex: 1, padding: 16, borderRadius: 20 }}>
                        <Ionicons name="flame" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
                            {stats?.totalHabits || 0}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.subtext, fontWeight: '500' }}>Total Habits</Text>
                    </GlassView>

                    <GlassView style={{ flex: 1, padding: 16, borderRadius: 20 }}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 2 }}>
                            {stats?.totalCompletions || 0}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.subtext, fontWeight: '500' }}>All Time</Text>
                    </GlassView>
                </View>

                {/* Month Selector */}
                <GlassView style={{ padding: 20, marginBottom: 20, borderRadius: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <TouchableOpacity
                            onPress={() => changeMonth(-1)}
                            style={{ padding: 10, backgroundColor: colors.background + '60', borderRadius: 12 }}
                        >
                            <Ionicons name="chevron-back" size={22} color={colors.text} />
                        </TouchableOpacity>

                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>
                                {getMonthName(selectedDate)}
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.subtext, marginTop: 2 }}>
                                {getYear(selectedDate)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => changeMonth(1)}
                            style={{ padding: 10, backgroundColor: colors.background + '60', borderRadius: 12 }}
                        >
                            <Ionicons name="chevron-forward" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <View style={{ flex: 1, padding: 14, backgroundColor: colors.primary + '15', borderRadius: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                                {monthlyStats?.activeDays || 0}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.text, marginTop: 2, opacity: 0.7 }}>
                                Active Days
                            </Text>
                        </View>
                        <View style={{ flex: 1, padding: 14, backgroundColor: colors.accent + '15', borderRadius: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.accent }}>
                                {monthlyStats?.completions || 0}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.text, marginTop: 2, opacity: 0.7 }}>
                                Completions
                            </Text>
                        </View>
                        <View style={{ flex: 1, padding: 14, backgroundColor: colors.secondary + '15', borderRadius: 16 }}>
                            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.secondary }}>
                                {completionRate}%
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.text, marginTop: 2, opacity: 0.7 }}>
                                Rate
                            </Text>
                        </View>
                    </View>
                </GlassView>

                {/* Activity Heatmap */}
                <GlassView style={{ padding: 18, marginBottom: 20, borderRadius: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 }}>
                                Activity Heatmap
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.subtext }}>
                                {dailyStats.filter(c => c > 0).length} days active • {Math.max(...dailyStats, 0)} max
                            </Text>
                        </View>
                        <View style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            backgroundColor: colors.primary + '15',
                            borderRadius: 8
                        }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
                                This Month
                            </Text>
                        </View>
                    </View>

                    {/* Calendar Container with Standardized Width - Medium Size */}
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ maxWidth: 340, width: '100%' }}>
                            <View style={{ flexDirection: 'row', marginBottom: 12, paddingHorizontal: 4 }}>
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                    <Text key={i} style={{
                                        flex: 1,
                                        textAlign: 'center',
                                        color: colors.subtext,
                                        fontSize: 11,
                                        fontWeight: '600',
                                        opacity: 0.6
                                    }}>
                                        {day}
                                    </Text>
                                ))}
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {generateCalendar().map((date, index) => {
                                    if (!date) {
                                        return <View key={index} style={{ width: '14.28%', aspectRatio: 1 }} />;
                                    }

                                    const day = date.getDate();
                                    const count = dailyStats[day - 1] || 0;
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    const isSelected = selectedDate.toDateString() === date.toDateString();

                                    let bgColor = colors.background + '30';
                                    let borderColor = 'transparent';
                                    let borderWidth = 0;
                                    let textColor = colors.text;
                                    let textWeight = '500';

                                    if (count > 0) {
                                        if (count >= 5) {
                                            bgColor = colors.primary;
                                            textColor = '#FFFFFF';
                                            textWeight = '700';
                                        } else if (count >= 3) {
                                            bgColor = colors.primary + 'CC';
                                            textColor = '#FFFFFF';
                                            textWeight = '700';
                                        } else if (count >= 2) {
                                            bgColor = colors.primary + '80';
                                            textColor = '#FFFFFF';
                                            textWeight = '600';
                                        } else {
                                            bgColor = colors.primary + '40';
                                            textColor = colors.primary;
                                            textWeight = '600';
                                        }
                                    }

                                    if (isSelected) {
                                        borderColor = colors.text;
                                        borderWidth = 2;
                                    } else if (isToday) {
                                        borderColor = colors.accent;
                                        borderWidth = 2;
                                    }

                                    const totalHabits = stats?.totalHabits || 0;
                                    const isAllCompleted = totalHabits > 0 && count >= totalHabits;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setSelectedDate(date)}
                                            style={{ width: '14.28%', aspectRatio: 1, padding: 3 }}
                                        >
                                            <View style={{
                                                flex: 1,
                                                borderRadius: 10,
                                                backgroundColor: bgColor,
                                                borderWidth: borderWidth,
                                                borderColor: borderColor,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                shadowColor: count > 0 ? colors.primary : 'transparent',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: count >= 3 ? 0.25 : 0,
                                                shadowRadius: 3,
                                                elevation: count >= 3 ? 2 : 0
                                            }}>
                                                {isAllCompleted ? (
                                                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                                                ) : (
                                                    <Text style={{
                                                        color: textColor,
                                                        fontWeight: textWeight,
                                                        fontSize: 12
                                                    }}>
                                                        {day}
                                                    </Text>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 14,
                        paddingTop: 14,
                        borderTopWidth: 1,
                        borderTopColor: colors.glassBorder,
                        gap: 5
                    }}>
                        <Text style={{ fontSize: 10, color: colors.subtext, marginRight: 4 }}>Less</Text>
                        {[
                            colors.background + '30',
                            colors.primary + '40',
                            colors.primary + '80',
                            colors.primary + 'CC',
                            colors.primary
                        ].map((color, i) => (
                            <View key={i} style={{
                                width: 14,
                                height: 14,
                                borderRadius: 4,
                                backgroundColor: color
                            }} />
                        ))}
                        <Text style={{ fontSize: 10, color: colors.subtext, marginLeft: 4 }}>More</Text>
                    </View>
                </GlassView>

                {/* Daily Details Section */}
                <GlassView style={{ padding: 20, marginBottom: 20, borderRadius: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </Text>
                        <View style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: colors.primary + '20',
                            borderRadius: 12
                        }}>
                            <Text style={{
                                color: colors.primary,
                                fontWeight: '700',
                                fontSize: 12
                            }}>
                                {dayHabits.filter(h => h.completed).length} / {dayHabits.length} Habits
                            </Text>
                        </View>
                    </View>

                    {/* Wellness Stats Row */}
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                        <View style={{ flex: 1, padding: 12, backgroundColor: colors.primary + '10', borderRadius: 16, alignItems: 'center' }}>
                            <Ionicons name="water" size={20} color="#3B82F6" style={{ marginBottom: 6 }} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                                {dailyWellness.water >= 1000
                                    ? (dailyWellness.water / 1000).toFixed(1) + 'L'
                                    : dailyWellness.water + 'ml'}
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.subtext }}>Drink</Text>
                        </View>
                        <View style={{ flex: 1, padding: 12, backgroundColor: colors.accent + '10', borderRadius: 16, alignItems: 'center' }}>
                            <Ionicons name="moon" size={20} color="#8B5CF6" style={{ marginBottom: 6 }} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                                {Math.floor(dailyWellness.sleep / 60)}h {dailyWellness.sleep % 60}m
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.subtext }}>Sleep</Text>
                        </View>
                        <View style={{ flex: 1, padding: 12, backgroundColor: colors.secondary + '10', borderRadius: 16, alignItems: 'center' }}>
                            <Ionicons name="hourglass" size={20} color="#F59E0B" style={{ marginBottom: 6 }} />
                            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                                {Math.floor(dailyWellness.fasting / 60)}h {dailyWellness.fasting % 60}m
                            </Text>
                            <Text style={{ fontSize: 11, color: colors.subtext }}>Fasting</Text>
                        </View>
                    </View>

                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.subtext, marginBottom: 12, marginLeft: 4 }}>
                        Habits & Tasks
                    </Text>

                    <View style={{ gap: 10 }}>
                        {dayHabits.length > 0 ? (
                            dayHabits.map((habit) => (
                                <View key={habit.id} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 12,
                                    backgroundColor: habit.completed ? colors.primary + '10' : colors.card,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: habit.completed ? colors.primary + '30' : 'transparent'
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                        <View style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 12,
                                            backgroundColor: habit.completed ? colors.primary + '25' : colors.glass,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12
                                        }}>
                                            <Ionicons
                                                name={habit.icon || 'star'}
                                                size={18}
                                                color={habit.completed ? colors.primary : colors.subtext}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 15,
                                                fontWeight: '600',
                                                color: habit.completed ? colors.text : colors.subtext,
                                                textDecorationLine: habit.completed ? 'none' : 'none'
                                            }}>
                                                {habit.title}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons
                                        name={habit.completed ? "checkmark-circle" : "ellipse-outline"}
                                        size={24}
                                        color={habit.completed ? colors.primary : colors.glassBorder}
                                    />
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: colors.subtext, textAlign: 'center', fontStyle: 'italic', padding: 10 }}>
                                No habits found for this day.
                            </Text>
                        )}
                    </View>
                </GlassView>



                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
                        onPress={() => setShowDatePicker(false)}
                        activeOpacity={1}
                    />
                    <GlassView style={{ width: '100%', maxWidth: 340, padding: 24, borderRadius: 28 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <TouchableOpacity onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
                                <Ionicons name="chevron-back" size={26} color={colors.text} />
                            </TouchableOpacity>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                                    {getMonthName(selectedDate)}
                                </Text>
                                <Text style={{ fontSize: 14, color: colors.subtext, marginTop: 2 }}>
                                    {getYear(selectedDate)}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => changeMonth(1)} style={{ padding: 8 }}>
                                <Ionicons name="chevron-forward" size={26} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <Text key={day} style={{ flex: 1, textAlign: 'center', color: colors.subtext, fontSize: 12, fontWeight: '600' }}>
                                    {day}
                                </Text>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {generateCalendar().map((date, index) => (
                                <View key={index} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
                                    {date && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedDate(date);
                                                setShowDatePicker(false);
                                            }}
                                            style={{
                                                flex: 1,
                                                borderRadius: 12,
                                                backgroundColor: date.toDateString() === selectedDate.toDateString()
                                                    ? colors.primary
                                                    : 'transparent',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Text style={{
                                                color: date.toDateString() === selectedDate.toDateString() ? '#FFF' : colors.text,
                                                fontWeight: date.toDateString() === selectedDate.toDateString() ? '700' : '500',
                                                fontSize: 14
                                            }}>
                                                {date.getDate()}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                padding: 14,
                                backgroundColor: colors.primary,
                                borderRadius: 16,
                                alignItems: 'center'
                            }}
                            onPress={() => {
                                setSelectedDate(new Date());
                                setShowDatePicker(false);
                            }}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 15 }}>Today</Text>
                        </TouchableOpacity>
                    </GlassView>
                </View>
            </Modal>
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
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5
    },
});
