import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { GlassView } from './GlassView';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function TabBar({ state, descriptors, navigation }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const activeColor = isDark ? Colors.dark.tint : Colors.light.tint;
    const inactiveColor = isDark ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault;

    return (
        <View style={styles.container}>
            <GlassView intensity={80} style={styles.glass}>
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
                                    style={styles.addButton}
                                >
                                    <View style={[styles.addIcon, { backgroundColor: activeColor }]}>
                                        <Ionicons name="add" size={32} color="#fff" />
                                    </View>
                                </TouchableOpacity>
                            )
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
                            >
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? activeColor : inactiveColor}
                                />
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
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    glass: {
        borderRadius: 35,
        height: 70,
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    addButton: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
