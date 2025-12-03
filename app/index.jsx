import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../components/Background';
import { ArcLogo } from '../components/ArcLogo';
import { useAuth } from '../hooks/useAuth';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

export default function Index() {
    const { session, loading } = useAuth();
    const router = useRouter();
    const [isSplashFinished, setIsSplashFinished] = useState(false);

    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.8);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 1000 });
        scale.value = withTiming(1, { duration: 1000 });

        const timer = setTimeout(() => {
            setIsSplashFinished(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isSplashFinished && !loading) {
            if (session) {
                router.replace('/(tabs)');
            } else {
                router.replace('/onboarding');
            }
        }
    }, [isSplashFinished, loading, session]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    if (!isSplashFinished || loading) {
        return (
            <Background style={styles.container}>
                <Animated.View style={animatedStyle}>
                    <ArcLogo width={150} height={150} />
                </Animated.View>
            </Background>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
