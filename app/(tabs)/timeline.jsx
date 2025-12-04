import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../context/ThemeContext';
import { getTodayTasks, updateTask, deleteTask, saveTask } from '../../lib/storage';
import GlassView from '../../components/GlassView';

export default function Timeline() {
    const { colors, isDark } = useTheme();

    const [tasks, setTasks] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskTime, setNewTaskTime] = useState('');
    const [newTaskDuration, setNewTaskDuration] = useState('');
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [showTaskTimePicker, setShowTaskTimePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(6);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());


    const loadData = async () => {
        const todayTasks = await getTodayTasks();
        setTasks(todayTasks.sort((a, b) => a.time.localeCompare(b.time)));
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

    const toggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            await updateTask(taskId, { completed: !task.completed });
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
        }
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

    const getPriorityColor = (priority) => {
        if (priority === 'high') return colors.danger;
        if (priority === 'low') return colors.accent;
        return colors.warning;
    };

    const getTaskIcon = (task) => {
        const title = task.title.toLowerCase();
        if (title.includes('wake') || title.includes('rise')) return 'sunny';
        if (title.includes('email') || title.includes('message')) return 'mail';
        if (title.includes('meeting') || title.includes('call')) return 'people';
        if (title.includes('workout') || title.includes('exercise')) return 'barbell';
        if (title.includes('read') || title.includes('study')) return 'book';
        return 'checkmark-done';
    };

    const handleTimePickerConfirm = () => {
        const formattedTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
        setNewTaskTime(formattedTime);
        setShowTaskTimePicker(false);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !newTaskTime) return;

        const newTask = {
            title: newTaskTitle.trim(),
            time: newTaskTime,
            duration: newTaskDuration || null,
            notes: newTaskNotes.trim() || null,
            priority: 'medium',
            completed: false,
        };

        await saveTask(newTask);
        await loadData();

        // Reset form
        setNewTaskTitle('');
        setNewTaskTime('');
        setNewTaskDuration('');
        setNewTaskNotes('');
        setShowAddTask(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Large Calendar Header */}
                <View style={styles.largeCalendarHeader}>
                    <View style={styles.calendarTitleRow}>
                        <Text style={[styles.largeCalendarMonth, { color: colors.text }]}>
                            {selectedDate.toLocaleDateString('en-US', { month: 'long' })} <Text style={{ color: colors.primary }}>{selectedDate.getFullYear()}</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.calendarIconBtn, { backgroundColor: colors.primary + '20' }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.largeCalendarWeek}>
                        {['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'].map((day, idx) => (
                            <View key={idx} style={styles.largeCalendarDay}>
                                <Text style={[styles.largeCalendarDayLabel, { color: colors.subtext }]}>{day}</Text>
                                <View style={[
                                    styles.largeCalendarDayCircle,
                                    idx === 1 && { backgroundColor: '#FFFFFF' }
                                ]}>
                                    <Text style={[
                                        styles.largeCalendarDayNumber,
                                        { color: idx === 1 ? '#000000' : colors.text }
                                    ]}>
                                        {idx + 2}
                                    </Text>
                                </View>
                                <View style={styles.largeCalendarDots}>
                                    <View style={[styles.largeCalendarDot, { backgroundColor: '#EF4444' }]} />
                                    <View style={[styles.largeCalendarDot, { backgroundColor: '#3B82F6' }]} />
                                    {idx % 2 === 0 && <View style={[styles.largeCalendarDot, { backgroundColor: '#F59E0B' }]} />}
                                    {idx === 2 && <View style={[styles.largeCalendarDot, { backgroundColor: '#10B981' }]} />}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Vertical Timeline */}
                <GlassView style={styles.timelineContainer}>
                    {tasks.length === 0 ? (
                        <View style={styles.emptyTimeline}>
                            <Ionicons name="today-outline" size={50} color={colors.subtext} style={{ opacity: 0.5 }} />
                            <Text style={[styles.emptyText, { color: colors.subtext }]}>No tasks scheduled</Text>
                            <Text style={[styles.emptySubtext, { color: colors.subtext }]}>Add your first task to get started</Text>
                        </View>
                    ) : (
                        tasks.map((task, index) => {
                            const renderActions = () => (
                                <View style={styles.swipeActionsContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedTask(task);
                                            setShowTaskDetails(true);
                                        }}
                                        style={styles.infoAction}
                                    >
                                        <Ionicons name="information-circle" size={24} color="#FFFFFF" />
                                        <Text style={styles.infoText}>Details</Text>
                                    </TouchableOpacity>
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
                                </View>
                            );

                            return (
                                <View key={task.id} style={styles.timelineItem}>
                                    {/* Time Column */}
                                    <View style={styles.timeColumn}>
                                        <Text style={[styles.timeLabel, { color: colors.subtext }]}>
                                            {task.time}
                                        </Text>
                                        {task.duration && getEndTime(task.time, task.duration) && (
                                            <Text style={[styles.endTimeLabel, { color: colors.subtext }]}>
                                                {getEndTime(task.time, task.duration)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Node & Line Column */}
                                    <View style={styles.nodeColumn}>
                                        {index !== 0 && (
                                            <View style={[styles.connectionLine, { backgroundColor: colors.primary + '40' }]} />
                                        )}
                                        <View style={[styles.taskNode, {
                                            backgroundColor: task.completed ? colors.accent : colors.primary,
                                            borderColor: task.completed ? colors.accent : colors.primary
                                        }]}>
                                            <Ionicons name={getTaskIcon(task)} size={26} color="#FFFFFF" />
                                        </View>
                                        {index !== tasks.length - 1 && (
                                            <View style={[styles.connectionLine, { backgroundColor: colors.primary + '40' }]} />
                                        )}
                                    </View>

                                    {/* Task Card Column */}
                                    <Swipeable
                                        renderRightActions={renderActions}
                                        renderLeftActions={renderActions}
                                        overshootRight={false}
                                        overshootLeft={false}
                                    >
                                        <View style={styles.taskCardWrapper}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setSelectedTask(task);
                                                    setShowTaskDetails(true);
                                                }}
                                                style={styles.taskCard}
                                            >
                                                <View style={styles.taskHeader}>
                                                    <Text style={[styles.taskTime, { color: colors.subtext }]}>
                                                        {task.time}
                                                    </Text>
                                                    {task.duration && (
                                                        <Ionicons name="repeat-outline" size={14} color={colors.subtext} />
                                                    )}
                                                </View>
                                                <Text style={[
                                                    styles.taskTitle,
                                                    { color: colors.text, textDecorationLine: task.completed ? 'line-through' : 'none' }
                                                ]}>
                                                    {task.title}
                                                </Text>
                                                {task.notes && task.notes.trim() && (
                                                    <View style={styles.taskNotes}>
                                                        <Ionicons name="list-outline" size={14} color={colors.subtext} />
                                                        <Text style={[styles.taskNotesText, { color: colors.subtext }]} numberOfLines={1}>
                                                            {task.notes}
                                                        </Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => toggleTask(task.id)}
                                                style={[styles.checkCircle, {
                                                    borderColor: task.completed ? colors.accent : colors.subtext
                                                }]}
                                            >
                                                {task.completed && (
                                                    <View style={[styles.checkFill, { backgroundColor: colors.accent }]} />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </Swipeable>
                                </View>
                            );
                        })
                    )}
                </GlassView>

                <View style={{ height: 100 }} />
            </ScrollView >

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
            </Modal >

            {/* FAB - Add Task Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddTask(true)}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Add New Task Modal */}
            <Modal visible={showAddTask} animationType="slide" transparent onRequestClose={() => setShowAddTask(false)}>
                <View style={[styles.newTaskModalOverlay, { backgroundColor: colors.background }]}>
                    <View style={styles.newTaskHeader}>
                        <TouchableOpacity onPress={() => setShowAddTask(false)} style={styles.newTaskCloseBtn}>
                            <Ionicons name="close" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.newTaskHeaderTitle, { color: colors.text }]}>New Task</Text>
                    </View>

                    <ScrollView style={styles.newTaskBody} showsVerticalScrollIndicator={false}>
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

                        <TouchableOpacity
                            onPress={() => setShowTaskTimePicker(true)}
                            style={[styles.newTaskTimeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                            <View style={styles.newTaskTimeInfo}>
                                <Text style={[styles.newTaskTimeText, { color: colors.text }]}>
                                    {newTaskTime || 'Select time'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
                        </TouchableOpacity>

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

                        <View style={{ height: 120 }} />
                    </ScrollView>

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
                <View style={styles.timePickerOverlay}>
                    <View style={[styles.timePickerCard, { backgroundColor: colors.background }]}>
                        <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                        <View style={styles.timePickerRow}>
                            <Picker
                                selectedValue={selectedHour}
                                onValueChange={setSelectedHour}
                                style={[styles.picker, { color: colors.text }]}
                            >
                                {[...Array(12)].map((_, i) => (
                                    <Picker.Item key={i} label={`${i + 1}`} value={i + 1} />
                                ))}
                            </Picker>
                            <Text style={[styles.pickerSeparator, { color: colors.text }]}>:</Text>
                            <Picker
                                selectedValue={selectedMinute}
                                onValueChange={setSelectedMinute}
                                style={[styles.picker, { color: colors.text }]}
                            >
                                {[0, 15, 30, 45].map((min) => (
                                    <Picker.Item key={min} label={min.toString().padStart(2, '0')} value={min} />
                                ))}
                            </Picker>
                            <Picker
                                selectedValue={selectedPeriod}
                                onValueChange={setSelectedPeriod}
                                style={[styles.picker, { color: colors.text }]}
                            >
                                <Picker.Item label="AM" value="AM" />
                                <Picker.Item label="PM" value="PM" />
                            </Picker>
                        </View>
                        <View style={styles.timePickerButtons}>
                            <TouchableOpacity
                                onPress={() => setShowTaskTimePicker(false)}
                                style={[styles.timePickerBtn, { backgroundColor: colors.glass }]}
                            >
                                <Text style={{ color: colors.text }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleTimePickerConfirm}
                                style={[styles.timePickerBtn, { backgroundColor: colors.primary }]}
                            >
                                <Text style={{ color: '#FFFFFF' }}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >

            {/* Date Picker Modal */}
            <Modal visible={showDatePicker} animationType="slide" transparent onRequestClose={() => setShowDatePicker(false)}>
                <View style={styles.datePickerOverlay}>
                    <View style={[styles.datePickerCard, { backgroundColor: colors.background }]}>
                        <View style={styles.datePickerHeader}>
                            <Text style={[styles.datePickerTitle, { color: colors.text }]}>Select Date</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.datePickerMonthRow}>
                            <TouchableOpacity
                                style={[styles.datePickerNavBtn, { backgroundColor: colors.glass }]}
                                onPress={() => {
                                    const newDate = new Date(selectedDate);
                                    newDate.setMonth(newDate.getMonth() - 1);
                                    setSelectedDate(newDate);
                                }}
                            >
                                <Ionicons name="chevron-back" size={24} color={colors.primary} />
                            </TouchableOpacity>

                            <Text style={[styles.datePickerMonthText, { color: colors.text }]}>
                                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </Text>

                            <TouchableOpacity
                                style={[styles.datePickerNavBtn, { backgroundColor: colors.glass }]}
                                onPress={() => {
                                    const newDate = new Date(selectedDate);
                                    newDate.setMonth(newDate.getMonth() + 1);
                                    setSelectedDate(newDate);
                                }}
                            >
                                <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.datePickerWeekDays}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                <Text key={idx} style={[styles.datePickerWeekDay, { color: colors.subtext }]}>{day}</Text>
                            ))}
                        </View>

                        <View style={styles.datePickerDaysGrid}>
                            {(() => {
                                const year = selectedDate.getFullYear();
                                const month = selectedDate.getMonth();
                                const firstDay = new Date(year, month, 1).getDay();
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const days = [];

                                // Empty cells for days before month starts
                                for (let i = 0; i < firstDay; i++) {
                                    days.push(<View key={`empty-${i}`} style={styles.datePickerDayCell} />);
                                }

                                // Actual days
                                for (let day = 1; day <= daysInMonth; day++) {
                                    const isToday = day === new Date().getDate() &&
                                        month === new Date().getMonth() &&
                                        year === new Date().getFullYear();

                                    const isSelected = day === selectedDate.getDate() &&
                                        month === selectedDate.getMonth() &&
                                        year === selectedDate.getFullYear();

                                    days.push(
                                        <TouchableOpacity
                                            key={day}
                                            style={[
                                                styles.datePickerDayCell,
                                                isToday && { backgroundColor: '#1F2937' },
                                                isSelected && { backgroundColor: colors.primary }
                                            ]}
                                            onPress={() => {
                                                const newDate = new Date(year, month, day);
                                                setSelectedDate(newDate);
                                                setShowDatePicker(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.datePickerDayText,
                                                { color: (isSelected || isToday) ? '#FFFFFF' : colors.text }
                                            ]}>
                                                {day}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }

                                return days;
                            })()}
                        </View>

                        <View style={styles.datePickerFooter}>
                            <TouchableOpacity
                                style={[styles.datePickerTodayBtn, { backgroundColor: colors.glass }]}
                                onPress={() => {
                                    setSelectedDate(new Date());
                                    setShowDatePicker(false);
                                }}
                            >
                                <Text style={[styles.datePickerTodayText, { color: colors.text }]}>Today</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingTop: 20, paddingHorizontal: 20 },

    // Large Calendar Header
    largeCalendarHeader: {
        marginBottom: 32,
        paddingVertical: 20,
    },
    calendarTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    largeCalendarMonth: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    calendarIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeCalendarWeek: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    largeCalendarDay: {
        flex: 1,
        alignItems: 'center',
    },
    largeCalendarDayLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        opacity: 0.7,
    },
    largeCalendarDayCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    largeCalendarDayNumber: {
        fontSize: 18,
        fontWeight: '700',
    },
    largeCalendarDots: {
        flexDirection: 'row',
        gap: 4,
        justifyContent: 'center',
    },
    largeCalendarDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },

    // Timeline
    timelineContainer: {
        padding: 20,
        marginBottom: 24,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 0,
        minHeight: 100,
    },
    timeColumn: {
        width: 70,
        paddingTop: 10,
        paddingRight: 10,
    },
    timeLabel: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 3,
    },
    endTimeLabel: {
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.6,
    },
    nodeColumn: {
        width: 64,
        alignItems: 'center',
    },
    connectionLine: {
        width: 3,
        flex: 1,
        minHeight: 24,
    },
    taskNode: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    taskCardWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: 10,
        paddingBottom: 20,
    },
    taskCard: {
        flex: 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    taskTime: {
        fontSize: 12,
        fontWeight: '600',
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    taskNotes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    taskNotesText: {
        fontSize: 13,
        flex: 1,
    },
    checkCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 14,
        marginTop: 10,
    },
    checkFill: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },

    // Empty State
    emptyTimeline: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.7,
    },

    // Swipe Actions
    swipeActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoAction: {
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 20,
        borderRadius: 16,
        marginRight: 8,
    },
    infoText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    deleteAction: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        marginBottom: 20,
        borderRadius: 16,
    },
    deleteText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },

    // Details Modal
    detailsOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailsOverlayTouch: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    detailsCard: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailsIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsCloseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsContent: {
        flex: 1,
    },
    detailsTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    detailsTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    detailsNotesBox: {
        padding: 16,
        borderRadius: 12,
        marginLeft: 28,
    },
    detailsNotes: {
        fontSize: 15,
        lineHeight: 22,
    },

    // FAB
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

    // New Task Modal
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
    },
    newTaskTimeText: {
        fontSize: 16,
        fontWeight: '500',
    },
    newTaskDurationInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
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
    },
    newTaskContinueText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },

    // Time Picker
    timePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    timePickerCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
    },
    timePickerTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    timePickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    picker: {
        width: 80,
        height: 150,
    },
    pickerSeparator: {
        fontSize: 24,
        fontWeight: '700',
        marginHorizontal: 8,
    },
    timePickerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    timePickerBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },

    // Date Picker
    datePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    datePickerCard: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 20,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    datePickerMonthRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePickerNavBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerMonthText: {
        fontSize: 18,
        fontWeight: '600',
    },
    datePickerWeekDays: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    datePickerWeekDay: {
        width: 40,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    datePickerDaysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    datePickerDayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    datePickerDayText: {
        fontSize: 16,
        fontWeight: '500',
    },
    datePickerFooter: {
        alignItems: 'center',
    },
    datePickerTodayBtn: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
    },
    datePickerTodayText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
