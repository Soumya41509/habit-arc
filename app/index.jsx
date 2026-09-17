import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../components/Background';
import { ArcLogo } from '../components/ArcLogo';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();

    // Animations
    const logoScale = useSharedValue(0.88);
    const logoOpacity = useSharedValue(0);
    const textOpacity = useSharedValue(0);
    const textTranslateY = useSharedValue(12);
    const badgeOpacity = useSharedValue(0);

    // Pulse dot animations
    const dot1Scale = useSharedValue(1);
    const dot2Scale = useSharedValue(1);
    const dot3Scale = useSharedValue(1);

    useEffect(() => {
        // Entrance animations
        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
        logoOpacity.value = withTiming(1, { duration: 800 });

        badgeOpacity.value = withDelay(200, withTiming(1, { duration: 700 }));

        textOpacity.value = withDelay(350, withTiming(1, { duration: 800 }));
        textTranslateY.value = withDelay(
            350,
            withTiming(0, { duration: 800, easing: Easing.bezier(0.16, 1, 0.3, 1) })
        );

        // Bouncing dots sequence
        dot1Scale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 400 }),
                withTiming(1, { duration: 400 }),
                withTiming(1, { duration: 600 })
            ),
            -1
        );
        dot2Scale.value = withDelay(
            200,
            withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 400 }),
                    withTiming(1, { duration: 400 }),
                    withTiming(1, { duration: 600 })
                ),
                -1
            )
        );
        dot3Scale.value = withDelay(
            400,
            withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 400 }),
                    withTiming(1, { duration: 400 }),
                    withTiming(1, { duration: 600 })
                ),
                -1
            )
        );

        // Transition timer
        const timer = setTimeout(async () => {
            try {
                const onboarded = (await SecureStore.getItemAsync('routiva_onboarded_completed')) || (await SecureStore.getItemAsync('habitarc_onboarded_completed'));
                if (onboarded === 'true') {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/onboarding');
                }
            } catch (e) {
                router.replace('/onboarding');
            }
        }, 2400);

        return () => clearTimeout(timer);
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
        opacity: textOpacity.value,
        transform: [{ translateY: textTranslateY.value }],
    }));

    const badgeAnimatedStyle = useAnimatedStyle(() => ({
        opacity: badgeOpacity.value,
    }));

    const dot1Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot1Scale.value }],
    }));
    const dot2Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot2Scale.value }],
    }));
    const dot3Style = useAnimatedStyle(() => ({
        transform: [{ scale: dot3Scale.value }],
    }));

    return (
        <Background style={styles.container}>
            <View style={styles.content}>
                {/* Top Subtle Brand Tag */}
                <Animated.View style={[styles.topTagContainer, badgeAnimatedStyle]}>
                    <View
                        style={[
                            styles.topTagPill,
                            {
                                backgroundColor: isDark
                                    ? colors.surfaceContainerLow
                                    : colors.surfaceContainerLow,
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(23, 26, 36, 0.04)',
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusPulseDot,
                                { backgroundColor: colors.tertiaryContainer },
                            ]}
                        />
                        <ThemedText
                            type="label-sm"
                            style={[styles.topTagText, { color: colors.subtext }]}
                        >
                            DAILY BALANCE
                        </ThemedText>
                    </View>
                </Animated.View>

                {/* Centerpiece: Brand Icon & Identity */}
                <View style={styles.centerContainer}>
                    {/* Glowing Logo Card Frame */}
                    <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
                        <View
                            style={[
                                styles.logoHalo,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(155, 138, 251, 0.18)'
                                        : 'rgba(155, 138, 251, 0.22)',
                                },
                            ]}
                        />
                        <View
                            style={[
                                styles.logoCard,
                                {
                                    backgroundColor: isDark
                                        ? colors.surfaceContainerLow
                                        : colors.surfaceContainerLowest,
                                    borderColor: isDark
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                    shadowColor: isDark ? '#000' : '#9B8AFB',
                                },
                            ]}
                        >
                            <ArcLogo size={110} />
                        </View>
                    </Animated.View>

                    {/* Typography */}
                    <Animated.View style={[styles.textBlock, textAnimatedStyle]}>
                        <ThemedText
                            type="display-lg"
                            style={[styles.appName, { color: colors.onSurface }]}
                        >
                            Routiva
                        </ThemedText>
                        <ThemedText
                            type="body-lg"
                            style={[styles.tagline, { color: colors.subtext }]}
                        >
                            Build your rhythm.
                        </ThemedText>
                    </Animated.View>
                </View>

                {/* Bottom Section: Fluid Micro Loading Dots & Trust Stamp */}
                <View style={styles.bottomSection}>
                    <View style={styles.dotsRow}>
                        <Animated.View
                            style={[
                                styles.dot,
                                { backgroundColor: isDark ? colors.primary : colors.primaryContainer },
                                dot1Style,
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(201, 191, 255, 0.6)'
                                        : 'rgba(155, 138, 251, 0.6)',
                                },
                                dot2Style,
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(201, 191, 255, 0.3)'
                                        : 'rgba(155, 138, 251, 0.3)',
                                },
                                dot3Style,
                            ]}
                        />
                    </View>

                    {/* Trust Stamp */}
                    <View
                        style={[
                            styles.trustPill,
                            {
                                backgroundColor: isDark
                                    ? 'rgba(26, 27, 34, 0.85)'
                                    : 'rgba(242, 243, 255, 0.85)',
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.08)'
                                    : 'rgba(23, 26, 36, 0.04)',
                            },
                        ]}
                    >
                        <Ionicons
                            name="lock-closed"
                            size={14}
                            color={colors.tertiary}
                            style={{ marginRight: 6 }}
                        />
                        <ThemedText
                            type="label-sm"
                            style={{ color: colors.subtext, letterSpacing: 0.1 }}
                        >
                            <ThemedText
                                type="label-sm"
                                style={{ color: colors.tertiary, fontWeight: '700' }}
                            >
                                100% private
                            </ThemedText>{' '}
                            • local-first
                        </ThemedText>
                    </View>
                </View>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 48,
    },
    topTagContainer: {
        alignItems: 'center',
    },
    topTagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 9999,
        borderWidth: 1,
    },
    statusPulseDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 8,
    },
    topTagText: {
        letterSpacing: 1.2,
        fontWeight: '700',
    },
    centerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logoWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },
    logoHalo: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
    },
    logoCard: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 8,
    },
    textBlock: {
        alignItems: 'center',
    },
    appName: {
        textAlign: 'center',
        marginBottom: 6,
    },
    tagline: {
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    bottomSection: {
        alignItems: 'center',
        width: '100%',
        gap: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 16,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
    },
    trustPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
    },
});
