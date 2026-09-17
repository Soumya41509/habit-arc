import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function ArcLogo({ width = 100, height = 100 }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const primary = isDark ? Colors.dark.primary : Colors.light.primary;
    const secondary = isDark ? Colors.dark.secondary : Colors.light.secondary;

    return (
        <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
            <Defs>
                <LinearGradient id="grad" x1="0" y1="100" x2="100" y2="0">
                    <Stop offset="0" stopColor={primary} />
                    <Stop offset="1" stopColor={secondary} />
                </LinearGradient>
            </Defs>
            <Circle cx="50" cy="50" r="45" stroke="url(#grad)" strokeWidth="8" strokeOpacity="0.3" />
            <Path
                d="M 15 85 A 45 45 0 0 1 85 15"
                stroke="url(#grad)"
                strokeWidth="8"
                strokeLinecap="round"
            />
        </Svg>
    );
}
