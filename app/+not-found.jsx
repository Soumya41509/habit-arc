import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Background } from '../components/Background';
import { ThemedText } from '../components/ThemedText';

export default function NotFoundScreen() {
    return (
        <Background>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={styles.container}>
                <ThemedText type="title">Screen not found.</ThemedText>
                <Link href="/(tabs)" style={styles.link}>
                    <ThemedText type="link">Go to home screen</ThemedText>
                </Link>
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
    },
});
