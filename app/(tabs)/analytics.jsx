import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { getWeeklyLogs } from '../../lib/db';
import { useColorScheme } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 200;
const CHART_WIDTH = width - 80;

export default function Analytics() {
    const [weeklyData, setWeeklyData] = useState([]);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const fetchAnalytics = async () => {
        try {
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (6 - i));
                return d.toISOString().split('T')[0];
            });

            const logsData = await getWeeklyLogs(last7Days[0], last7Days[6]);

            // Count completions per day
            const counts = last7Days.map(date => ({
                date,
                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                count: (logsData || []).filter(log => log.completed_at === date).length,
            }));

            setWeeklyData(counts);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnalytics();
        }, [])
    );

    const maxCount = Math.max(...weeklyData.map(d => d.count), 5); // Minimum scale of 5

    return (
        <Background>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">Analytics</ThemedText>
                </View>

                <GlassView intensity={30} style={styles.card}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Weekly Overview</ThemedText>
                    <View style={styles.chartContainer}>
                        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
                            {weeklyData.map((data, index) => {
                                const barHeight = (data.count / maxCount) * (CHART_HEIGHT - 40);
                                const barWidth = (CHART_WIDTH / 7) - 10;
                                const x = index * (CHART_WIDTH / 7);
                                const y = CHART_HEIGHT - barHeight - 20;

                                return (
                                    <g key={data.date}>
                                        <Rect
                                            x={x}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={isDark ? Colors.dark.primary : Colors.light.primary}
                                            rx={6}
                                        />
                                        <SvgText
                                            x={x + barWidth / 2}
                                            y={CHART_HEIGHT}
                                            fontSize="12"
                                            fill={isDark ? '#fff' : '#000'}
                                            textAnchor="middle"
                                            opacity={0.6}
                                        >
                                            {data.day}
                                        </SvgText>
                                        {data.count > 0 && (
                                            <SvgText
                                                x={x + barWidth / 2}
                                                y={y - 5}
                                                fontSize="12"
                                                fill={isDark ? '#fff' : '#000'}
                                                textAnchor="middle"
                                                fontWeight="bold"
                                            >
                                                {data.count}
                                            </SvgText>
                                        )}
                                    </g>
                                );
                            })}
                        </Svg>
                    </View>
                </GlassView>

                <View style={styles.statsGrid}>
                    <GlassView intensity={30} style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Total Habits</ThemedText>
                        <ThemedText type="title" style={styles.statValue}>
                            {weeklyData.reduce((acc, curr) => acc + curr.count, 0)}
                        </ThemedText>
                    </GlassView>
                    <GlassView intensity={30} style={styles.statCard}>
                        <ThemedText style={styles.statLabel}>Best Day</ThemedText>
                        <ThemedText type="title" style={styles.statValue}>
                            {weeklyData.sort((a, b) => b.count - a.count)[0]?.day || '-'}
                        </ThemedText>
                    </GlassView>
                </View>
            </ScrollView>
        </Background>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        alignItems: 'center',
    },
    cardTitle: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    chartContainer: {
        height: CHART_HEIGHT,
        width: CHART_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    statLabel: {
        opacity: 0.7,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
    },
});
