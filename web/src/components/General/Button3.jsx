import React, { useCallback } from 'react';
import {Switch} from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * Button3 – Card estilo linha com ícone + título em negrito itálico + switch à direita.
 * Props:
 *  - icon (lucide icon name)
 *  - label (string)
 *  - value (boolean)
 *  - onValueChange (function)
 *  - disabled (boolean)
 *  - accessibilityLabel (string opcional)
 */
export default function Button3({
	icon = 'volume-2',
	label = 'Efeitos Sonoros',
	value = false,
	onValueChange,
	disabled = false,
	accessibilityLabel,
}) {
	const colors = useThemeColors();

	const handleToggle = useCallback(() => {
		if (disabled) return;
		onValueChange && onValueChange(!value);
	}, [onValueChange, value, disabled]);

	return (
		<button 			onClick={handleToggle}
			disabled={disabled}
			style={({ pressed }) => [
				styles.card,
				{
					borderColor: colors.text + '22',
					backgroundColor: colors.text + '06',
					opacity: disabled ? 0.5 : 1,
				},
				pressed && !disabled && { opacity: 0.85 },
			]}
			
			accessibilityState={{ checked: value, disabled }}
			aria-label={accessibilityLabel || label}
		>
			<div style={styles.leftRow}>
				<Icon name={icon} size={22} color={colors.text} style={{ marginRight: 10 }} />
				<span style={{...styles.label, ...{ color: colors.text }}}>{label}</span>
			</div>
			<Switch
				value={value}
				onValueChange={handleToggle}
				trackColor={{ false: colors.text + '33', true: colors.secondary + '66' }}
				thumbColor={value ? colors.secondary : colors.text}
				ios_backgroundColor={colors.text + '33'}
			/>
		</button>
	);
}

const styles = {
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderWidth: 1,
		borderRadius: 24,
		marginBottom: 16,
	},
	leftRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	label: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
		fontStyle: 'italic',
		letterSpacing: 0.5,
	},
};

