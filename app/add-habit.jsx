import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { saveHabit } from '../lib/storage';
import GlassView from '../components/GlassView';

const ICONS = ['fitness', 'water', 'book', 'moon', 'sunny', 'bicycle', 'walk', 'nutrition', 'medkit', 'leaf'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly'];

export default function AddHabit() {
    const { colors } = useTheme();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [frequency, setFrequency] = useState('Daily');

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a habit title');
            return;
        }

        await saveHabit({
            title,
            icon: selectedIcon,
            frequency,
        });
        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>New Habit</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
                </TouchableOpacity>
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
            </ScrollView>
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
    saveText: {
        fontSize: 16,
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
});
