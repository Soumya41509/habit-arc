import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <LayoutContent />
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

function LayoutContent() {
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="add-habit" options={{ presentation: 'modal' }} />
                <Stack.Screen name="habit/[id]" options={{ presentation: 'card' }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
