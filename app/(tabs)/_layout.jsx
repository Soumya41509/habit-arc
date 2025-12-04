import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';

export default function TabLayout() {
    const { colors, isDark } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    elevation: 0,
                    borderTopWidth: 0,
                    backgroundColor: isDark ? '#000000' : '#FFFFFF',
                },
                tabBarBackground: () => (
                    <BlurView
                        intensity={100}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                ),
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.subtext,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
                            <Ionicons name={focused ? "home" : "home-outline"} size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="wellness"
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
                            <Ionicons name={focused ? "heart" : "heart-outline"} size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 10 }}>
                            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    href: null, // Hide from tab bar
                }}
            />
        </Tabs>
    );
}
