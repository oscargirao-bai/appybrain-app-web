import React, { useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import Icon from '@react-native-vector-icons/lucide';
import SvgIcon from '../General/SvgIcon';

/**
 * Subject2 – horizontal pill card with:
 *  | Icon + label stacked (left) | Centered Subject Name |
 * Full width, rounded border, press scale feedback.
 * Props:
 *  - title: string (subject name)
 *  - iconName: lucide icon name (default 'book-open') - used when svgIcon is not provided
 *  - svgIcon: string (SVG markup from API) - takes priority over iconName
 *  - color: string (hex color from API) - used for background and icon color
 *  - onPress: function
 *  - height: optional (default 70)
 *  - style: external style override
 */
export default function Subject2({ title, iconName = 'book-open', svgIcon, color, onPress, height = 70, style }) {
	const colors = useThemeColors();
	const scale = useRef(new Animated.Value(0)).current;

	const handlePressIn = () => Animated.timing(scale, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
	const handlePressOut = () => Animated.timing(scale, { toValue: 0, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
	const pressScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

	// Use API color for background, or fallback to theme background
	const backgroundColor = color; 
	const borderColor = addAlpha(color, 0.7);
	const iconColor = color || colors.text;

	return (
		<Animated.View style={[styles.outer, { transform: [{ scale: pressScale }] }, style]}>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={title}
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={({ pressed }) => [
					styles.container,
					{
						backgroundColor,
						borderColor,
						height,
					},
					pressed && { opacity: 0.9 },
				]}
			>
				{/* Left icon */}
				<View style={styles.side} pointerEvents="none">
					{svgIcon ? (
						<SvgIcon svgString={svgIcon} size={28} color={style.textColor} />
					) : (
						<Icon name={iconName} size={28} color={iconColor} />
					)}
				</View>
				{/* Center title (flex) */}
				<View style={styles.titleWrapper} pointerEvents="none">
					<Text style={[styles.title, { color: style.textColor }]}>{title}</Text>
				</View>
				{/* Right spacer to balance layout */}
				<View style={styles.side} pointerEvents="none" />
			</Pressable>
		</Animated.View>
	);
}

function addAlpha(hexOrRgba, alpha) {
	if (!hexOrRgba) return `rgba(0,0,0,${alpha})`;
	if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) {
		return hexOrRgba.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
			const parts = inner.split(',').map(p => p.trim());
			const [r,g,b] = parts;
			return `rgba(${r},${g},${b},${alpha})`;
		});
	}
	let h = hexOrRgba.replace('#','');
	if (h.length === 3) h = h.split('').map(c => c+c).join('');
	const int = parseInt(h,16);
	const r = (int>>16)&255, g=(int>>8)&255, b=int&255;
	return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
	outer: {
		width: '80%',
	},
	container: {
		width: '100%',
		borderWidth: 2,
		borderRadius: 22,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
	},
	side: {
		width: 48,
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	titleWrapper: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
		fontFamily: family.bold,
		letterSpacing: 0.5,
		textAlign: 'center',
	},
	smallLabel: {
		marginTop: 6,
		fontSize: 12,
		fontFamily: family.medium,
		lineHeight: 14,
		fontWeight: '500',
	},
});
