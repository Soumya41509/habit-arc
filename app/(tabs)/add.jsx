import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../../components/Background';
import { GlassView } from '../../components/GlassView';
import { ThemedText } from '../../components/ThemedText';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

const ICONS = ['star', 'fitness', 'water', 'book', 'moon', 'sunny', 'heart', 'bicycle', 'walk', 'nutrition'];
const COLORS = ['#6366F1', '#EF4444', '#34D399', '#F59E0B', '#EC4899', '#8B5CF6'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AddHabit() {
    const [title, setTitle] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('star');
    const [selectedColor, setSelectedColor] = useState('#6366F1');
    const [frequency, setFrequency] = useState(DAYS);
    const [loading, setLoading] = useState(false);

    const { session } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const toggleDay = (day) => {
        if (frequency.includes(day)) {
            setFrequency(frequency.filter(d => d !== day));
        } else {
            setFrequency([...frequency, day]);
        }
    };

    const handleSave = async () => {
        if (!title) {
            Alert.alert('Error', 'Please enter a habit title');
            return;
        }

        if (frequency.length === 0) {
            Alert.alert('Error', 'Please select at least one day');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('habits')
            .insert({
                user_id: session.user.id,
                title,
                icon: selectedIcon,
                color: selectedColor,
                frequency: frequency,
            });

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Habit created successfully!');
            router.back();
        }
    };

    return (
        <Background>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText type="title">New Habit</ThemedText>
                </View>

                <GlassView intensity={30} style={styles.form}>
                    <Input
                        label="Habit Title"
                        placeholder="e.g. Drink Water"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Icon</ThemedText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                            {ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconButton,
                                        selectedIcon === icon && { backgroundColor: selectedColor }
                                    ]}
                                >
                                    <Ionicons
                                        name={icon}
                                        size={24}
                                        color={selectedIcon === icon ? '#fff' : (isDark ? '#fff' : '#000')}
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Color</ThemedText>
                        <View style={styles.colorRow}>
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorButton,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <ThemedText style={styles.label}>Frequency</ThemedText>
                        <View style={styles.daysRow}>
                            {DAYS.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => toggleDay(day)}
                                    style={[
                                        styles.dayButton,
                                        frequency.includes(day) && { backgroundColor: selectedColor }
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            styles.dayText,
                                            frequency.includes(day) && { color: '#fff' }
                                        ]}
                                    >
                                        {day[0]}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Button
                        title="Create Habit"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.button}
                    />
                </GlassView>
            </ScrollView>
        </Background>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 30,
    },
    form: {
        padding: 24,
        borderRadius: 24,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        marginBottom: 12,
        marginLeft: 4,
        fontSize: 14,
        opacity: 0.8,
    },
    iconScroll: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#fff',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
    },
    button: {
        marginTop: 16,
    },
});
