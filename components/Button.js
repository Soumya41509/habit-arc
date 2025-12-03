import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { GlassView } from './GlassView';

export function Button({ title, onPress, variant = 'primary', loading = false, style, textStyle }) {
    const content = (
        <>
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={[styles.text, textStyle]}>{title}</Text>
            )}
        </>
    );

    if (variant === 'primary') {
        return (
            <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.container, style]}>
                <LinearGradient
                    colors={['#6366F1', '#818CF8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.container, style]}>
            <GlassView intensity={30} style={styles.glass}>
                {content}
            </GlassView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        height: 56,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glass: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
