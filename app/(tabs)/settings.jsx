import React from 'react';
import { StyleSheet, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function Settings() {
    const router = useRouter();
    const { isDark, toggleTheme, colors } = useTheme();

    const handleReplayOnboarding = async () => {
        try {
            await SecureStore.deleteItemAsync('habitarc_onboarded_completed');
        } catch (e) {}
        router.replace('/onboarding');
    };

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="headline-lg">Settings</ThemedText>
                </View>

                {/* Profile Card */}
                <GlassView intensity={35} style={styles.profileCard}>
                    <View
                        style={[
                            styles.avatar,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(155, 138, 251, 0.15)'
                                    : 'rgba(95, 77, 186, 0.1)',
                            },
                        ]}
                    >
                        <Ionicons
                            name="sparkles"
                            size={34}
                            color={isDark ? colors.primary : colors.primary}
                        />
                    </View>
                    <ThemedText type="headline-md" style={styles.name}>
                        HabitArc User
                    </ThemedText>
                    <ThemedText type="body-sm" style={[styles.phone, { color: colors.subtext }]}>
                        Local Personal Profile • Private
                    </ThemedText>
                </GlassView>

                {/* Settings Section */}
                <View style={styles.section}>
                    {/* Dark Mode Toggle */}
                    <GlassView intensity={25} style={styles.menuItem}>
                        <View style={styles.menuRow}>
                            <View
                                style={[
                                    styles.iconBox,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(155, 138, 251, 0.15)'
                                            : 'rgba(95, 77, 186, 0.1)',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={isDark ? 'moon' : 'sunny'}
                                    size={20}
                                    color={isDark ? colors.primary : colors.primary}
                                />
                            </View>
                            <View>
                                <ThemedText type="body-lg" style={styles.menuText}>
                                    Dark Mode
                                </ThemedText>
                                <ThemedText type="body-sm" style={{ color: colors.subtext }}>
                                    {isDark ? 'Calm Arc Dark' : 'Calm Arc Light'}
                                </ThemedText>
                            </View>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: colors.primaryContainer }}
                            thumbColor={isDark ? colors.primary : '#F4F3F4'}
                        />
                    </GlassView>

                    {/* Replay Onboarding */}
                    <TouchableOpacity onPress={handleReplayOnboarding} activeOpacity={0.7}>
                        <GlassView intensity={25} style={styles.menuItem}>
                            <View style={styles.menuRow}>
                                <View
                                    style={[
                                        styles.iconBox,
                                        {
                                            backgroundColor: isDark
                                                ? 'rgba(101, 218, 190, 0.15)'
                                                : 'rgba(0, 107, 89, 0.1)',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name="compass-outline"
                                        size={20}
                                        color={colors.tertiary}
                                    />
                                </View>
                                <View>
                                    <ThemedText type="body-lg" style={styles.menuText}>
                                        View Welcome Walkthrough
                                    </ThemedText>
                                    <ThemedText type="body-sm" style={{ color: colors.subtext }}>
                                        Replay initiation intro
                                    </ThemedText>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
                        </GlassView>
                    </TouchableOpacity>

                    {/* Offline First Guarantee */}
                    <GlassView intensity={25} style={styles.menuItem}>
                        <View style={styles.menuRow}>
                            <View
                                style={[
                                    styles.iconBox,
                                    {
                                        backgroundColor: isDark
                                            ? 'rgba(106, 156, 253, 0.15)'
                                            : 'rgba(30, 91, 184, 0.1)',
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="shield-checkmark-outline"
                                    size={20}
                                    color={colors.secondary}
                                />
                            </View>
                            <View>
                                <ThemedText type="body-lg" style={styles.menuText}>
                                    Local-First Storage
                                </ThemedText>
                                <ThemedText type="body-sm" style={{ color: colors.subtext }}>
                                    SQLite On-Device Database
                                </ThemedText>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color={colors.tertiary} />
                    </GlassView>
                </View>

                <ThemedText type="label-sm" style={[styles.version, { color: colors.muted }]}>
                    HabitArc v1.0.0 • Calm Arc Design System
                </ThemedText>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 24,
    },
    profileCard: {
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    name: {
        marginBottom: 4,
    },
    phone: {
        letterSpacing: 0.1,
    },
    section: {
        gap: 12,
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontWeight: '600',
    },
    version: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 80,
    },
});
