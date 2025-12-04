import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { saveHabit } from '../lib/storage';
import GlassView from '../components/GlassView';

const ICONS = ['fitness', 'water', 'book', 'moon', 'sunny', 'bicycle', 'walk', 'nutrition', 'medkit', 'leaf'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

export default function AddHabit() {
    const { colors } = useTheme();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [frequency, setFrequency] = useState('Daily');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedHour, setSelectedHour] = useState(6);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState('AM');

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a habit title');
            return;
        }

        await saveHabit({
            title,
            time,
            icon: selectedIcon,
            frequency,
        });
        router.back();
    };

    const handleTimeConfirm = () => {
        const formattedTime = `${selectedHour}:${selectedMinute.toString().padStart(2, '0')} ${selectedPeriod}`;
        setTime(formattedTime);
        setShowTimePicker(false);
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

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Habit</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.subtext }]}>NAME</Text>
                <GlassView style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="e.g., Drink Water"
                        placeholderTextColor={colors.subtext}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </GlassView>

                <Text style={[styles.label, { color: colors.subtext }]}>TIME</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                    <GlassView style={styles.inputContainer}>
                        <View style={styles.timeInputRow}>
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                            <Text style={[styles.input, {
                                color: time ? colors.text : colors.subtext,
                                flex: 1,
                                marginLeft: 8
                            }]}>
                                {time || 'Select time'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={colors.subtext} />
                        </View>
                    </GlassView>
                </TouchableOpacity>

                <Text style={[styles.label, { color: colors.subtext }]}>ICON</Text>
                <View style={styles.iconGrid}>
                    {ICONS.map(icon => (
                        <TouchableOpacity key={icon} onPress={() => setSelectedIcon(icon)}>
                            <GlassView
                                style={[
                                    styles.iconButton,
                                    selectedIcon === icon && { borderColor: colors.primary, backgroundColor: colors.glass }
                                ]}
                            >
                                <Ionicons
                                    name={icon}
                                    size={24}
                                    color={selectedIcon === icon ? colors.primary : colors.subtext}
                                />
                            </GlassView>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={[styles.label, { color: colors.subtext }]}>FREQUENCY</Text>
                <View style={styles.freqRow}>
                    {FREQUENCIES.map(freq => (
                        <TouchableOpacity key={freq} onPress={() => setFrequency(freq)} style={{ flex: 1 }}>
                            <GlassView
                                style={[
                                    styles.freqButton,
                                    frequency === freq && { backgroundColor: colors.primary }
                                ]}
                            >
                                <Text style={[
                                    styles.freqText,
                                    { color: frequency === freq ? '#fff' : colors.subtext }
                                ]}>
                                    {freq}
                                </Text>
                            </GlassView>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Save Button */}
            <TouchableOpacity
                style={[styles.saveButton, {
                    backgroundColor: colors.primary,
                    opacity: title.trim() ? 1 : 0.5
                }]}
                onPress={handleSave}
                disabled={!title.trim()}
            >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Habit</Text>
            </TouchableOpacity>

            {/* Time Picker Modal */}
            <Modal visible={showTimePicker} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <GlassView style={[styles.timePickerModal, { backgroundColor: colors.background }]}>
                        <View style={styles.timePickerHeader}>
                            <Text style={[styles.timePickerTitle, { color: colors.text }]}>Select Time</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Ionicons name="close" size={24} color={colors.subtext} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.pickerContainer}>
                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.pickerContent}
                            >
                                {[...Array(12)].map((_, i) => {
                                    const hour = i + 1;
                                    return (
                                        <TouchableOpacity
                                            key={hour}
                                            onPress={() => handleHourSelect(hour)}
                                            style={styles.pickerItem}
                                        >
                                            <Text style={[
                                                styles.pickerText,
                                                {
                                                    color: selectedHour === hour ? colors.primary : colors.subtext,
                                                    fontSize: selectedHour === hour ? 32 : 20,
                                                    fontWeight: selectedHour === hour ? '700' : '500',
                                                }
                                            ]}>
                                                {hour}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <Text style={[styles.separator, { color: colors.text }]}>:</Text>

                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.pickerContent}
                            >
                                {[...Array(60)].map((_, i) => (
                                    <TouchableOpacity
                                        key={i}
                                        onPress={() => handleMinuteSelect(i)}
                                        style={styles.pickerItem}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            {
                                                color: selectedMinute === i ? colors.primary : colors.subtext,
                                                fontSize: selectedMinute === i ? 32 : 20,
                                                fontWeight: selectedMinute === i ? '700' : '500',
                                            }
                                        ]}>
                                            {i.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <ScrollView
                                style={styles.picker}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.pickerContent}
                            >
                                {['AM', 'PM'].map((period) => (
                                    <TouchableOpacity
                                        key={period}
                                        onPress={() => handlePeriodSelect(period)}
                                        style={styles.pickerItem}
                                    >
                                        <Text style={[
                                            styles.pickerText,
                                            {
                                                color: selectedPeriod === period ? colors.primary : colors.subtext,
                                                fontSize: selectedPeriod === period ? 32 : 20,
                                                fontWeight: selectedPeriod === period ? '700' : '500',
                                            }
                                        ]}>
                                            {period}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <TouchableOpacity
                            style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                            onPress={handleTimeConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Set Time</Text>
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
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 24,
    },
    inputContainer: {
        padding: 16,
    },
    input: {
        fontSize: 18,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    iconButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    freqRow: {
        flexDirection: 'row',
        gap: 12,
    },
    freqButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    freqText: {
        fontWeight: '600',
    },
    saveButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 20,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    // Time Picker Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    timePickerModal: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        minHeight: 420,
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    timePickerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginBottom: 24,
    },
    picker: {
        flex: 1,
        maxHeight: 200,
    },
    pickerContent: {
        paddingVertical: 80,
    },
    pickerItem: {
        paddingVertical: 8,
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 20,
    },
    separator: {
        fontSize: 32,
        fontWeight: '700',
        marginHorizontal: 8,
    },
    confirmButton: {
        padding: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
});
