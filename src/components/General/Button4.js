import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

// Simple pill button (full-width) used for secondary actions in Settings (e.g. Privacy Policy, Logout)
// Props: label (string), onPress (fn), danger (bool) to color text with secondary/danger tone later if needed
export default function Button4({ label, onPress, danger, style, accessibilityLabel }) {
	const colors = useThemeColors();
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [
				styles.root,
				{ borderColor: colors.text + '25', backgroundColor: colors.card + '55' },
				pressed && { opacity: 0.85 },
				style,
			]}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel || label}
		>
			<View style={styles.inner}> 
				<Text style={[styles.label, { color: danger ? colors.error || '#ff4d50' : colors.text }]}>{label}</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	root: {
		borderWidth: 1,
		borderRadius: 22,
		paddingHorizontal: 20,
		paddingVertical: 14,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
	label: { fontSize: 15, fontWeight: '700', fontFamily: family.bold, letterSpacing: 0.2 },
});
