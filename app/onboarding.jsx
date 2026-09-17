import { useState, useRef } from 'react';
import { StyleSheet, View, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Background } from '../components/Background';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { GlassView } from '../components/GlassView';
import { ArcLogo } from '../components/ArcLogo';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Track Your Journey',
        description: 'Visualize your habits as a rising arc. Watch your progress grow every day.',
        icon: <ArcLogo width={200} height={200} />,
    },
    {
        id: '2',
        title: 'Stay Consistent',
        description: 'Build streaks and keep the momentum going. Consistency is key to success.',
        icon: <GlassView intensity={30} style={{ width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="title">🔥</ThemedText></GlassView>,
    },
    {
        id: '3',
        title: 'Achieve Goals',
        description: 'Reach your full potential with detailed analytics and insights.',
        icon: <GlassView intensity={30} style={{ width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' }}><ThemedText type="title">🎯</ThemedText></GlassView>,
    },
];

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const router = useRouter();

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            router.replace('/(tabs)');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.iconContainer}>
                {item.icon}
            </Animated.View>
            <View style={styles.textContainer}>
                <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>
                <ThemedText style={styles.description}>{item.description}</ThemedText>
            </View>
        </View>
    );

    return (
        <Background>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? '#6366F1' : 'rgba(255,255,255,0.3)' }
                            ]}
                        />
                    ))}
                </View>
                <Button
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={styles.button}
                />
            </View>
        </Background>
    );
}

const styles = StyleSheet.create({
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        marginBottom: 60,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    footer: {
        padding: 20,
        paddingBottom: 50,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        width: '100%',
    },
});
