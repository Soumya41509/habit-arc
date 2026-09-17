import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../components/Background';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { GlassView } from '../components/GlassView';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        tag: 'Mindful Flow',
        title: 'Small habits.\nBig changes.',
        subtitle:
            'Turn everyday actions into lasting progress. Your rhythm builds where your attention flows.',
        ritualBadge: '21-Day Ritual',
        pillars: [
            {
                icon: 'flash-outline',
                iconColor: '#9B8AFB',
                tag: 'Instant',
                title: 'Zero Friction',
                desc: 'No accounts, passwords, or cloud sync required.',
            },
            {
                icon: 'leaf-outline',
                iconColor: '#2DAC92',
                tag: 'Mindful',
                title: 'Gentle Cadence',
                desc: 'No anxiety over broken streaks; celebrate showing up.',
            },
            {
                icon: 'shield-checkmark-outline',
                iconColor: '#6A9CFD',
                tag: 'Offline First',
                title: '100% Private',
                desc: 'All habit logs stay strictly on your local device.',
            },
        ],
    },
    {
        id: '2',
        tag: 'Visual Rhythm',
        title: 'Visual arcs.\nLiving progress.',
        subtitle:
            'Experience your daily momentum as a rising arc rather than cold numbers and rigid spreadsheets.',
        ritualBadge: 'Natural Cadence',
        pillars: [
            {
                icon: 'analytics-outline',
                iconColor: '#9B8AFB',
                tag: 'Visual',
                title: 'Arc Momentum',
                desc: 'Watch your arc fill with smooth gradient milestones.',
            },
            {
                icon: 'flame-outline',
                iconColor: '#FFB38A',
                tag: 'Streak',
                title: 'Gentle Streaks',
                desc: 'Nurture consistency at your own comfortable pace.',
            },
            {
                icon: 'color-palette-outline',
                iconColor: '#F38BB8',
                tag: 'Custom',
                title: 'Vibrant Accents',
                desc: 'Personalize each habit with custom colors and icons.',
            },
        ],
    },
    {
        id: '3',
        tag: 'Pure Simplicity',
        title: 'Ready to build\nyour rhythm?',
        subtitle:
            'Start fresh today with zero cognitive load. Track your first habit in just a single tap.',
        ritualBadge: 'Local Database',
        pillars: [
            {
                icon: 'server-outline',
                iconColor: '#2DAC92',
                tag: 'SQLite',
                title: 'Local SQLite DB',
                desc: 'Lightning fast response times with zero network lag.',
            },
            {
                icon: 'moon-outline',
                iconColor: '#9B8AFB',
                tag: 'Themes',
                title: 'Dark & Light Mode',
                desc: 'Tailored for soothing daytime focus and night relaxation.',
            },
            {
                icon: 'checkmark-done-circle-outline',
                iconColor: '#6A9CFD',
                tag: 'Free',
                title: 'Always Yours',
                desc: 'No subscriptions, no popups, no tracking cookies.',
            },
        ],
    },
];

export function OnboardingArcVisual({ badgeText, activeIndex }) {
    const { isDark, colors } = useTheme();

    return (
        <View style={styles.arcVisualContainer}>
            {/* Ambient Radial Halo */}
            <View
                style={[
                    styles.arcHalo,
                    {
                        backgroundColor: isDark
                            ? 'rgba(155, 138, 251, 0.12)'
                            : 'rgba(236, 237, 251, 0.85)',
                    },
                ]}
            />

            {/* Main Interactive SVG Arc */}
            <Svg width={250} height={210} viewBox="0 0 340 300" fill="none" style={styles.svgArc}>
                <Defs>
                    <LinearGradient id="heroArcGlow" x1="40" y1="280" x2="300" y2="60" gradientUnits="userSpaceOnUse">
                        <Stop offset="0%" stopColor="#FFB38A" stopOpacity={0.4} />
                        <Stop offset="25%" stopColor="#F38BB8" stopOpacity={0.65} />
                        <Stop offset="55%" stopColor="#9B8AFB" stopOpacity={0.9} />
                        <Stop offset="80%" stopColor="#6A9CFD" stopOpacity={0.95} />
                        <Stop offset="100%" stopColor="#2DAC92" />
                    </LinearGradient>
                </Defs>

                {/* Baseline Background Track */}
                <Path
                    d="M 60 270 A 150 150 0 1 1 290 190"
                    stroke={isDark ? '#292931' : '#E0E2F0'}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeOpacity={0.6}
                />

                {/* Radiant Milestone Gradient Arc */}
                <Path
                    d="M 60 270 A 150 150 0 0 1 265 95"
                    stroke="url(#heroArcGlow)"
                    strokeWidth={14}
                    strokeLinecap="round"
                />

                {/* Concentric Orbit Track */}
                <Path
                    d="M 85 245 A 115 115 0 0 1 245 115"
                    stroke={isDark ? '#9B8AFB' : '#9B8AFB'}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray="6 8"
                    strokeOpacity={0.35}
                />

                {/* Milestone Node 1 (Sunrise Salmon) */}
                <G transform="translate(60, 270)">
                    <Circle r={14} fill="#FFB38A" fillOpacity={0.25} />
                    <Circle r={8} fill="#FFB38A" />
                    <Circle r={3} fill="#FFFFFF" />
                </G>

                {/* Milestone Node 2 (Blush Pink) */}
                <G transform="translate(85, 175)">
                    <Circle r={15} fill="#F38BB8" fillOpacity={0.25} />
                    <Circle r={9} fill="#F38BB8" />
                    <Circle r={3.5} fill="#FFFFFF" />
                </G>

                {/* Milestone Node 3 (Lavender Catalyst) */}
                <G transform="translate(145, 100)">
                    <Circle r={18} fill="#9B8AFB" fillOpacity={0.28} />
                    <Circle r={11} fill="#9B8AFB" />
                    <Circle r={4} fill="#FFFFFF" />
                </G>

                {/* Milestone Node 4 (Sky Cerulean) */}
                <G transform="translate(210, 80)">
                    <Circle r={15} fill="#6A9CFD" fillOpacity={0.28} />
                    <Circle r={9.5} fill="#6A9CFD" />
                    <Circle r={3.5} fill="#FFFFFF" />
                </G>

                {/* Milestone Target Node (Mint Momentum) */}
                <G transform="translate(265, 95)">
                    <Circle r={20} fill="#2DAC92" fillOpacity={0.22} />
                    <Circle r={13} fill="#2DAC92" />
                    <Circle r={5} fill="#FFFFFF" />
                </G>
            </Svg>

            {/* Center Floating Micro-Badge */}
            <View
                style={[
                    styles.floatingPebble,
                    {
                        backgroundColor: isDark ? 'rgba(26, 27, 34, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(23, 26, 36, 0.06)',
                        shadowColor: isDark ? '#000' : '#9B8AFB',
                    },
                ]}
            >
                <View
                    style={[
                        styles.pebbleIconWrap,
                        { backgroundColor: isDark ? 'rgba(155, 138, 251, 0.2)' : colors.primaryFixed },
                    ]}
                >
                    <Ionicons
                        name="sparkles"
                        size={16}
                        color={isDark ? colors.primary : colors.primary}
                    />
                </View>
                <ThemedText
                    type="label-sm"
                    style={[styles.pebbleText, { color: colors.onSurface }]}
                >
                    {badgeText || '21-Day Ritual'}
                </ThemedText>
            </View>
        </View>
    );
}

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const router = useRouter();
    const { isDark, colors } = useTheme();

    const completeOnboarding = async () => {
        try {
            await SecureStore.setItemAsync('routiva_onboarded_completed', 'true');
            await SecureStore.setItemAsync('habitarc_onboarded_completed', 'true');
        } catch (e) {
            // Ignore error
        }
        router.replace('/(tabs)');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            completeOnboarding();
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.slide}>
            {/* Central Visual Arc */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
                <OnboardingArcVisual badgeText={item.ritualBadge} activeIndex={index} />
            </Animated.View>

            {/* Typography Content */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.textContainer}>
                <ThemedText
                    type="headline-lg"
                    style={[styles.slideTitle, { color: colors.onSurface }]}
                >
                    {item.title}
                </ThemedText>
                <ThemedText
                    type="body-md"
                    style={[styles.slideSubtitle, { color: colors.subtext }]}
                >
                    {item.subtitle}
                </ThemedText>
            </Animated.View>

            {/* Key Pillars */}
            <Animated.View entering={FadeInDown.delay(300)} style={styles.pillarsList}>
                {item.pillars.map((pillar, pIdx) => (
                    <View
                        key={pIdx}
                        style={[
                            styles.pillarCard,
                            {
                                backgroundColor: isDark
                                    ? colors.surfaceContainerLow
                                    : colors.surfaceContainerLow,
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.06)'
                                    : 'rgba(23, 26, 36, 0.04)',
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.pillarIconWrap,
                                {
                                    backgroundColor: isDark
                                        ? colors.surfaceContainer
                                        : colors.surfaceContainerLowest,
                                },
                            ]}
                        >
                            <Ionicons name={pillar.icon} size={20} color={pillar.iconColor} />
                        </View>
                        <View style={styles.pillarContent}>
                            <View style={styles.pillarHeaderRow}>
                                <ThemedText
                                    type="headline-sm"
                                    style={[styles.pillarTitle, { color: colors.onSurface }]}
                                >
                                    {pillar.title}
                                </ThemedText>
                                <View
                                    style={[
                                        styles.pillarTagBadge,
                                        {
                                            backgroundColor: isDark
                                                ? colors.surfaceContainerHigh
                                                : colors.surfaceContainerHigh,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        type="label-sm"
                                        style={{
                                            color: pillar.iconColor,
                                            fontSize: 10,
                                            fontWeight: '700',
                                        }}
                                    >
                                        {pillar.tag}
                                    </ThemedText>
                                </View>
                            </View>
                            <ThemedText
                                type="body-sm"
                                numberOfLines={1}
                                style={[styles.pillarDesc, { color: colors.subtext }]}
                            >
                                {pillar.desc}
                            </ThemedText>
                        </View>
                    </View>
                ))}
            </Animated.View>
        </View>
    );

    return (
        <Background style={styles.container}>
            {/* Top Navigation Bar */}
            <View style={styles.topBar}>
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
                        {SLIDES[currentIndex].tag.toUpperCase()}
                    </ThemedText>
                </View>

                <TouchableOpacity
                    onPress={completeOnboarding}
                    activeOpacity={0.7}
                    style={[
                        styles.skipButton,
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
                    <ThemedText
                        type="label-md"
                        style={[styles.skipText, { color: colors.subtext }]}
                    >
                        Skip
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {/* Slides Carousel */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />

            {/* Footer with Pagination and Primary CTA */}
            <View style={styles.footer}>
                {/* Fluid Pagination Indicator */}
                <View style={styles.paginationRow}>
                    {SLIDES.map((_, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    isActive
                                        ? [
                                              styles.paginationActivePill,
                                              {
                                                  backgroundColor: isDark
                                                      ? colors.primary
                                                      : colors.primaryContainer,
                                                  shadowColor: colors.primaryContainer,
                                              },
                                          ]
                                        : {
                                              backgroundColor: isDark
                                                  ? colors.surfaceContainerHigh
                                                  : colors.surfaceContainerHigh,
                                          },
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Primary Pill Button */}
                <Button
                    title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
                    icon="arrow-forward"
                    variant="primary"
                    onPress={handleNext}
                    style={styles.ctaButton}
                />

                {/* Trust & Privacy Affirmation */}
                <View style={styles.trustAffirmation}>
                    <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color={colors.tertiary}
                        style={{ marginRight: 6 }}
                    />
                    <ThemedText
                        type="label-sm"
                        style={[styles.trustText, { color: colors.subtext }]}
                    >
                        100% private & local. No account or login required.
                    </ThemedText>
                </View>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 56 : 44,
        paddingBottom: 8,
        zIndex: 20,
    },
    topTagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
    },
    statusPulseDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        marginRight: 6,
    },
    topTagText: {
        letterSpacing: 1.1,
        fontWeight: '700',
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderRadius: 9999,
        borderWidth: 1,
    },
    skipText: {
        fontWeight: '600',
    },
    listContainer: {
        alignItems: 'center',
    },
    slide: {
        width,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    arcVisualContainer: {
        position: 'relative',
        width: 260,
        height: 195,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    arcHalo: {
        position: 'absolute',
        width: 210,
        height: 180,
        borderRadius: 100,
    },
    svgArc: {
        transform: [{ rotate: '-8deg' }],
    },
    floatingPebble: {
        position: 'absolute',
        bottom: 4,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
        elevation: 4,
    },
    pebbleIconWrap: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    pebbleText: {
        fontWeight: '600',
        fontSize: 12,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 14,
    },
    slideTitle: {
        textAlign: 'center',
        marginBottom: 6,
        fontSize: 24,
        lineHeight: 30,
    },
    slideSubtitle: {
        textAlign: 'center',
        lineHeight: 19,
        fontSize: 13,
        paddingHorizontal: 12,
    },
    pillarsList: {
        width: '100%',
        gap: 8,
        paddingHorizontal: 4,
    },
    pillarCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 18,
        borderWidth: 1,
    },
    pillarIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    pillarContent: {
        flex: 1,
        minWidth: 0,
    },
    pillarHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    pillarTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    pillarTagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
    },
    pillarDesc: {
        fontSize: 12,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 44 : 28,
        alignItems: 'center',
        width: '100%',
    },
    paginationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    paginationActivePill: {
        width: 28,
        height: 8,
        borderRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 3,
    },
    ctaButton: {
        width: '100%',
        marginBottom: 10,
    },
    trustAffirmation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trustText: {
        fontSize: 11,
        letterSpacing: 0.1,
    },
});
