import { StyleSheet, View, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function Settings() {
    const { signOut, session } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleLogout = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/login');
                    }
                },
            ]
        );
    };

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title">Settings</ThemedText>
                </View>

                <GlassView intensity={30} style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <ThemedText style={{ fontSize: 32 }}>👤</ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.name}>
                        {session?.user?.user_metadata?.full_name || 'User'}
                    </ThemedText>
                    <ThemedText style={styles.phone}>
                        {session?.user?.email?.replace('@habit.arc', '')}
                    </ThemedText>
                </GlassView>

                <View style={styles.section}>
                    <GlassView intensity={20} style={styles.menuItem}>
                        <View style={styles.menuRow}>
                            <Ionicons name="moon" size={24} color={isDark ? '#fff' : '#000'} />
                            <ThemedText style={styles.menuText}>Dark Mode</ThemedText>
                        </View>
                        <Switch
                            value={isDark}
                            disabled={true} // System controlled for now
                        />
                    </GlassView>

                    <GlassView intensity={20} style={styles.menuItem}>
                        <View style={styles.menuRow}>
                            <Ionicons name="notifications" size={24} color={isDark ? '#fff' : '#000'} />
                            <ThemedText style={styles.menuText}>Notifications</ThemedText>
                        </View>
                        <Switch value={true} />
                    </GlassView>
                </View>

                <Button
                    title="Sign Out"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                    textStyle={{ color: '#EF4444' }}
                    variant="ghost"
                />

                <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    profileCard: {
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        marginBottom: 4,
    },
    phone: {
        opacity: 0.6,
    },
    section: {
        gap: 12,
        marginBottom: 30,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuText: {
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    version: {
        textAlign: 'center',
        marginTop: 20,
        opacity: 0.4,
        fontSize: 12,
    },
});
