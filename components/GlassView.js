import { BlurView } from 'expo-blur';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function GlassView({ children, style, intensity = 50, ...props }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, style]} {...props}>
            <BlurView
                intensity={intensity}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <View style={[
                styles.overlay,
                { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.4)' }
            ]} />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});
