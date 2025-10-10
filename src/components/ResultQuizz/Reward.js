import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * Reward pill for quiz results
 * Props:
 *  - type: 'stars' | 'coins' | 'trophies'
 *  - amount: number
 *  - style: ViewStyle override
 */
export default function Reward({ type = 'stars', amount = 0, style }) {
	const colors = useThemeColors();
	const styles = React.useMemo(() => createStyles(colors), [colors]);

	const config = getConfig(type, colors);

	return (
		<View style={[styles.container, style]}>
			<Text style={[styles.title, { color: colors.text }]}>Recompensas</Text>
			<View style={[styles.pill, { borderColor: colors.text + 'AA', backgroundColor: colors.background + '40' }]}
				accessibilityLabel={`Recompensa: ${config.label} +${amount}`}>
				<Text style={[styles.plus, { color: colors.text }]}>+</Text>
				<View style={styles.space} />
				<Icon name={config.icon} size={22} color={config.tint} />
				<View style={styles.space} />
				<Text style={[styles.value, { color: colors.text }]}>{amount}</Text>
			</View>
		</View>
	);
}

function getConfig(type, colors) {
	switch (type) {
			case 'coins':
			return {
				icon: 'coins',
					label: 'Moedas',
				tint: colors.accent,
				};
			case 'trophies':
				return {
					icon: 'trophy',
					label: 'Troféus',
					tint: colors.primary,
			};
		case 'stars':
		default:
			return {
				icon: 'star',
				label: 'Estrelas',
				tint: colors.primary,
			};
	}
}

const createStyles = (colors) => StyleSheet.create({
		container: {
			width: '100%',
			paddingHorizontal: 12,
			marginVertical: 8,
			alignItems: 'center',
		},
		title: {
			fontSize: 18,
			fontWeight: '800',
			fontFamily: family.bold,
			marginBottom: 6,
			textAlign: 'center',
		},
		pill: {
			alignSelf: 'center',
			paddingHorizontal: 14,
			paddingVertical: 10,
			borderRadius: 14,
			borderWidth: 1,
			flexDirection: 'row',
			alignItems: 'center',
		},
		plus: {
			fontSize: 20,
			fontWeight: '900',
			fontFamily: family.bold,
		},
		value: {
			fontSize: 20,
			fontWeight: '900',
			fontFamily: family.bold,
		},
		space: { width: 8 },
});

