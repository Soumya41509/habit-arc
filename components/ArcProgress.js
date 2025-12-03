import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { ThemedText } from './ThemedText';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ArcProgress({ progress = 0, size = 200, strokeWidth = 15, children }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const primary = isDark ? Colors.dark.primary : Colors.light.primary;
    const secondary = isDark ? Colors.dark.secondary : Colors.light.secondary;

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = radius * Math.PI; // Half circle

    const animatedProgress = useSharedValue(0);

    useEffect(() => {
        animatedProgress.value = withDelay(500, withTiming(progress, { duration: 1500 }));
    }, [progress]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - (circumference * animatedProgress.value);
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size / 2 + strokeWidth }]}>
            <Svg width={size} height={size / 2 + strokeWidth}>
                <Defs>
                    <LinearGradient id="arcGrad" x1="0" y1="0" x2="100%" y2="0">
                        <Stop offset="0" stopColor={primary} />
                        <Stop offset="1" stopColor={secondary} />
                    </LinearGradient>
                </Defs>
                {/* Background Arc */}
                <Path
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                />
                {/* Progress Arc */}
                <AnimatedPath
                    d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
                    stroke="url(#arcGrad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                />
            </Svg>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'hidden',
    },
    content: {
        position: 'absolute',
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
});
