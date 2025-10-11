import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import { family } from '../../constants/font';
import Icon from '@react-native-vector-icons/lucide';

/**
 * Basic reusable header.
 * Props:
 *  - title (string): main title.
 *  - showBack (boolean): if true renders default back button (arrow-left) on the left.
 *  - onBack (function): handler for back button press.
 *  - left (ReactNode): custom element on left (renders after back button if both provided).
 *  - right (ReactNode): primary right element.
 *  - extraRight (ReactNode): optional second element on right (e.g. settings / filter).
 *  - style (ViewStyle): override container.
 */
export default function Header({
	title = '',
	showBack = false,
	onBack,
	left,
	right,
	extraRight,
	style,
}) {
	const colors = useThemeColors();
	const { width } = useWindowDimensions();
	const horizontalPadding = width >= 768 ? 28 : 16;
	const rightPadding = width >= 768 ? 20 : 8;
		const { translate } = useTranslate();

	return (
		<View style={[styles.container, { paddingLeft: horizontalPadding, paddingRight: rightPadding, borderBottomColor: colors.text }, style]}>
			<View style={styles.side}>
				{showBack && (
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel={translate('common.back')}
						onPress={onBack}
						style={styles.iconBtn}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<Icon name="arrow-left" size={24} color={colors.text} />
					</TouchableOpacity>
				)}
				{left}
			</View>
			<View style={styles.sideRight}>
				{right}
				{extraRight && <View style={styles.extraRight}>{extraRight}</View>}
			</View>
			{/* Absolutely centered title to ensure true visual centering */}
			<View pointerEvents="none" style={styles.centerWrap}>
				<Text style={[styles.title, { color: colors.text }]}>{title}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		height: 56,
		borderBottomWidth: 2,
		gap: 12,
		justifyContent: 'space-between',
	},
	title: {
		fontSize: 22,
		fontWeight: '800',
		fontFamily: family.bold,
		letterSpacing: 0.5,
		textAlign: 'center',
		paddingHorizontal: 16,
	},
	side: { width: 40, alignItems: 'flex-start', justifyContent: 'center' },
	sideRight: { minWidth: 40, alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'row', gap: 8 },
	extraRight: { marginLeft: 4 },
	iconBtn: { alignItems: 'center', justifyContent: 'center' },
	centerWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});

