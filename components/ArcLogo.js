import React from 'react';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Filter, FeGaussianBlur, FeComposite } from 'react-native-svg';
import { View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function ArcLogo({ size = 120, animated = false, style }) {
    const { isDark, colors } = useTheme();

    return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
            <Svg width={size} height={size} viewBox="0 0 240 200" fill="none">
                <Defs>
                    <LinearGradient id="arcGrad" x1="40" y1="180" x2="200" y2="60" gradientUnits="userSpaceOnUse">
                        <Stop offset="0%" stopColor={colors.accentSalmon} />
                        <Stop offset="25%" stopColor={colors.accentPink} />
                        <Stop offset="55%" stopColor={isDark ? colors.primary : colors.primaryContainer} />
                        <Stop offset="80%" stopColor={colors.secondaryContainer} />
                        <Stop offset="100%" stopColor={colors.tertiaryContainer} />
                    </LinearGradient>
                </Defs>

                {/* Track background */}
                <Path
                    d="M 50 170 C 50 100, 110 50, 200 62"
                    stroke={isDark ? '#292931' : '#E0E2F0'}
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeOpacity={0.6}
                />

                {/* Main radiant gradient arc */}
                <Path
                    d="M 50 170 C 50 100, 110 50, 200 62"
                    stroke="url(#arcGrad)"
                    strokeWidth={14}
                    strokeLinecap="round"
                />

                {/* Dashed ambient orbit */}
                <Path
                    d="M 65 155 C 65 105, 115 65, 185 75"
                    stroke={colors.primaryContainer}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray="4 6"
                    strokeOpacity={0.4}
                />

                {/* Milestone Node 1 (Salmon) */}
                <G transform="translate(50, 170)">
                    <Circle r={12} fill={colors.accentSalmon} fillOpacity={0.25} />
                    <Circle r={7} fill={colors.accentSalmon} />
                    <Circle r={2.5} fill="#FFFFFF" />
                </G>

                {/* Milestone Node 2 (Pink) */}
                <G transform="translate(70, 96)">
                    <Circle r={10} fill={colors.accentPink} fillOpacity={0.25} />
                    <Circle r={6} fill={colors.accentPink} />
                    <Circle r={2} fill="#FFFFFF" />
                </G>

                {/* Milestone Node 3 (Lavender) */}
                <G transform="translate(125, 62)">
                    <Circle r={11} fill={colors.primaryContainer} fillOpacity={0.3} />
                    <Circle r={6.5} fill={colors.primaryContainer} />
                    <Circle r={2.5} fill="#FFFFFF" />
                </G>

                {/* Milestone Target Node (Mint Glow) */}
                <G transform="translate(200, 62)">
                    <Circle r={15} fill={colors.tertiaryContainer} fillOpacity={0.22} />
                    <Circle r={10} fill={colors.tertiaryContainer} />
                    <Circle r={4} fill="#FFFFFF" />
                </G>
            </Svg>
        </View>
    );
}
