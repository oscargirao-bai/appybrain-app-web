import React from 'react';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function Reward({ type = 'stars', amount = 0, style, hideLabel = false }) {
	const colors = useThemeColors();
	const styles = React.useMemo(() => createStyles(colors), [colors]);
	const config = getConfig(type, colors);

	return (
		<div style={{...styles.container, ...style}}>
			{!hideLabel && (
				<span style={{...styles.title, color: colors.text}}>Recompensas</span>
			)}
			<div 
				style={{...styles.pill, borderColor: colors.text + 'AA'}}
				aria-label={`Recompensa: ${config.label} +${amount}`}
			>
				<span style={{...styles.plus, color: colors.text}}>+</span>
				<div style={styles.space} />
				<LucideIcon name={config.icon} size={22} color={config.tint} />
				<div style={styles.space} />
				<span style={{...styles.value, color: colors.text}}>{amount}</span>
			</div>
		</div>
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

const createStyles = (colors) => ({
	container: {
		width: '100%',
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 8,
		paddingBottom: 8,
		display: 'flex',
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
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 10,
		paddingBottom: 10,
		borderRadius: 14,
		borderWidth: '1px',
		borderStyle: 'solid',
		display: 'flex',
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
