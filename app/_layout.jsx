import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
    const [loaded] = useFonts({
        // Custom fonts if any
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [loaded]);

    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}

function RootLayoutContent() {
    const { isDark, colors } = useTheme();

    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'fade',
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="habit/[id]" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
    );
}
