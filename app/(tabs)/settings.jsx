import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import GlassView from '../../components/GlassView';
import { clearAllData } from '../../lib/storage';
import { useRouter } from 'expo-router';

export default function Settings() {
    const { colors, toggleTheme, theme, isDark } = useTheme();
    const router = useRouter();

    const handleReset = () => {
        Alert.alert(
            "Reset Data",
            "Are you sure you want to delete all habits and history? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await clearAllData();
                        router.replace('/(tabs)/home');
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

            <GlassView style={styles.section}>
                <View style={styles.row}>
                    <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={(val) => toggleTheme(val ? 'dark' : 'light')}
                        trackColor={{ false: '#767577', true: colors.primary }}
                    />
                </View>
            </GlassView>

            <TouchableOpacity onPress={handleReset}>
                <GlassView style={[styles.section, { borderColor: '#ef4444' }]}>
                    <Text style={[styles.dangerText, { color: '#ef4444' }]}>Reset All Data</Text>
                </GlassView>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={[styles.version, { color: colors.subtext }]}>HabitArc v1.0.0 (Offline)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        padding: 16,
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    dangerText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingBottom: 20,
    },
    version: {
        fontSize: 12,
    },
});
