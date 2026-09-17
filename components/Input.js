import { TextInput, StyleSheet, View } from 'react-native';
import { GlassView } from './GlassView';
import { ThemedText } from './ThemedText';
import { Colors } from '../constants/Colors';

export function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, style }) {
    return (
        <View style={[styles.container, style]}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}
            <GlassView intensity={20} style={styles.inputContainer}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    style={styles.input}
                />
            </GlassView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        marginLeft: 4,
        fontSize: 14,
        opacity: 0.8,
    },
    inputContainer: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
    },
    input: {
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#fff',
        height: '100%',
    },
});
