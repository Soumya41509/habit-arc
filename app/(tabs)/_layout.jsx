import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="add" options={{ title: 'Add' }} />
            <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
    );
}
