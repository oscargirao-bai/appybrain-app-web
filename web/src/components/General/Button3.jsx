import React, { useCallback } from 'react';
import SvgIcon from '../../components/General/SvgIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

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
		<button
			onClick={handleToggle}
			disabled={disabled}
			style={{
				...styles.card,
				borderColor: colors.text + '22',
				backgroundColor: colors.text + '06',
				opacity: disabled ? 0.5 : 1,
				cursor: disabled ? 'not-allowed' : 'pointer',
			}}
			aria-label={accessibilityLabel || label}
			aria-checked={value}
		>
			<div style={styles.leftRow}>
				<SvgIcon name={icon} size={22} color={colors.text} style={{ marginRight: 10 }} />
				<span style={{...styles.label, ...{ color: colors.text }}}>{label}</span>
			</div>
			<input
				type="checkbox"
				checked={value}
				onChange={handleToggle}
				disabled={disabled}
				style={{
					width: 48,
					height: 28,
					cursor: disabled ? 'not-allowed' : 'pointer',
				}}
				aria-label={accessibilityLabel || label}
			/>
		</button>
	);
}

const styles = {
	card: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 14,
		paddingBottom: 14,
		border: '1px solid',
		borderRadius: 24,
		marginBottom: 16,
		background: 'transparent',
	},
	leftRow: {
		display: 'flex',
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

