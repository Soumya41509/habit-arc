import { useState } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Signup() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSignup = async () => {
        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signUp(phone, password, name);
        setLoading(false);

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            Alert.alert('Success', 'Account created successfully!');
            router.replace('/(tabs)');
        }
    };

    return (
        <Background>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
                        <ThemedText style={styles.subtitle}>Start tracking your habits today</ThemedText>
                    </View>

                    <GlassView intensity={30} style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="1234567890"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <Button
                            title="Sign Up"
                            onPress={handleSignup}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <ThemedText>Already have an account? </ThemedText>
                            <Link href="/login" asChild>
                                <ThemedText type="link">Sign In</ThemedText>
                            </Link>
                        </View>
                    </GlassView>
                </View>
            </KeyboardAvoidingView>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        opacity: 0.7,
        textAlign: 'center',
    },
    form: {
        padding: 24,
        borderRadius: 24,
    },
    button: {
        marginTop: 8,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
