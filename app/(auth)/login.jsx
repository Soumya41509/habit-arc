import { useState } from 'react';
import { StyleSheet, View, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        const { error } = await signIn(phone, password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        } else {
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
                        <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
                        <ThemedText style={styles.subtitle}>Sign in to continue your journey</ThemedText>
                    </View>

                    <GlassView intensity={30} style={styles.form}>
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
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.button}
                        />

                        <View style={styles.footer}>
                            <ThemedText>Don't have an account? </ThemedText>
                            <Link href="/signup" asChild>
                                <ThemedText type="link">Sign Up</ThemedText>
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
