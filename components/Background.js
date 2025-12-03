import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export function Background({ children, style }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={[styles.container, style]}>
            <LinearGradient
                colors={isDark ? ['#0B1120', '#1e1b4b'] : ['#F4F7FE', '#e0e7ff']}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
