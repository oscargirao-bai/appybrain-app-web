import React, { useCallback } from 'react';
import LucideIcon from './LucideIcon.jsx';
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
				<LucideIcon name={icon} size={22} color={colors.text} style={{ marginRight: 10 }} />
				<span style={{...styles.label, ...{ color: colors.text }}}>{label}</span>
			</div>
			<div
				style={{
					width: 51,
					height: 31,
					borderRadius: 15.5,
					backgroundColor: value ? (colors.secondary + '66') : (colors.text + '33'),
					position: 'relative',
					transition: 'background-color 0.2s',
					cursor: disabled ? 'not-allowed' : 'pointer',
				}}
			>
				<div
					style={{
						width: 27,
						height: 27,
						borderRadius: 13.5,
						backgroundColor: value ? colors.secondary : colors.text,
						position: 'absolute',
						top: 2,
						left: value ? 22 : 2,
						transition: 'left 0.2s, background-color 0.2s',
						boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
					}}
				/>
			</div>
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
			borderRadius: 26,
			marginBottom: 18,
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

