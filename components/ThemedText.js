import { Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function ThemedText({ style, lightColor, darkColor, type = 'default', ...rest }) {
    const colorScheme = useColorScheme();
    const color = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;

    return (
        <Text
            style={[
                { color: lightColor && darkColor ? (colorScheme === 'dark' ? darkColor : lightColor) : color },
                type === 'default' ? styles.default : undefined,
                type === 'title' ? styles.title : undefined,
                type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
                type === 'subtitle' ? styles.subtitle : undefined,
                type === 'link' ? styles.link : undefined,
                style,
            ]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
        lineHeight: 24,
    },
    defaultSemiBold: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '600',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        lineHeight: 30,
        fontSize: 16,
        color: '#0a7ea4',
    },
});
