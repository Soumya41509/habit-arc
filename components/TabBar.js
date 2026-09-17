import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { GlassView } from './GlassView';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function TabBar({ state, descriptors, navigation }) {
    const { isDark, colors } = useTheme();
    const activeColor = isDark ? colors.primary : colors.primary;
    const inactiveColor = colors.subtext;

    return (
        <View style={styles.container}>
            <GlassView intensity={85} style={styles.glass}>
                <View style={styles.content}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        let iconName;
                        if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                        else if (route.name === 'analytics') iconName = isFocused ? 'bar-chart' : 'bar-chart-outline';
                        else if (route.name === 'settings') iconName = isFocused ? 'settings' : 'settings-outline';
                        else if (route.name === 'add') iconName = 'add';

                        if (route.name === 'add') {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={onPress}
                                    activeOpacity={0.88}
                                    style={styles.addButton}
                                >
                                    <LinearGradient
                                        colors={
                                            isDark
                                                ? ['#9B8AFB', '#7C67EE']
                                                : ['#9B8AFB', '#6A9CFD']
                                        }
                                        style={styles.addIcon}
                                    >
                                        <Ionicons name="add" size={30} color="#FFFFFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                accessibilityRole="button"
                                accessibilityState={isFocused ? { selected: true } : {}}
                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                testID={options.tabBarTestID}
                                onPress={onPress}
                                style={styles.tab}
                                activeOpacity={0.7}
                            >
                                <View
                                    style={[
                                        styles.tabIconWrap,
                                        isFocused && {
                                            backgroundColor: isDark
                                                ? 'rgba(155, 138, 251, 0.15)'
                                                : 'rgba(95, 77, 186, 0.1)',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name={iconName}
                                        size={22}
                                        color={isFocused ? activeColor : inactiveColor}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </GlassView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 26 : 16,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    glass: {
        borderRadius: 9999,
        height: 64,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 12,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        top: -16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#9B8AFB',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
});
