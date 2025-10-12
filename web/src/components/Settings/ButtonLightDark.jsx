import React, { useCallback } from 'react';
import LucideIcon from '../General/LucideIcon.jsx';
import { useTheme, useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function ButtonLightDark({ style, onChange }) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const colors = useThemeColors();
	const active = resolvedTheme;

	const handleSelect = useCallback((t) => {
		setTheme(t);
		onChange && onChange(t);
	}, [setTheme, onChange]);

	const lightActive = active === 'light';
	const darkActive = active === 'dark';

	return (
		<div style={{
			...styles.wrapper,
			borderColor: colors.text + '22',
			backgroundColor: colors.text + '06',
			...style
		}}>
			<Segment
				label="Modo Claro"
				icon="sun"
				active={lightActive}
				onClick={() => handleSelect('light')}
				colors={colors}
				position="left"
			/>
			<Segment
				label="Modo Escuro"
				icon="moon"
				active={darkActive}
				onClick={() => handleSelect('dark')}
				colors={colors}
				position="right"
			/>
		</div>
	);
}

function Segment({ label, icon, active, onClick, colors, position }) {
	const activeStyles = active ? {
		backgroundColor: colors.secondary,
		boxShadow: '0 2px 8px ' + colors.secondary + '55'
	} : {};

	const positionStyles = position === 'left' ? styles.segmentLeft : 
	                        position === 'right' ? styles.segmentRight : {};

	return (
		<button
			onClick={onClick}
			style={{
				...styles.segment,
				...positionStyles,
				...activeStyles
			}}
		>
			<LucideIcon 
				name={icon} 
				size={18} 
				color={active ? '#fff' : colors.text} 
				style={{ marginRight: 8 }} 
			/>
			<span style={{
				...styles.label,
				color: active ? '#fff' : colors.text
			}}>
				{label}
			</span>
		</button>
	);
}

const styles = {
	wrapper: {
		display: 'flex',
		flexDirection: 'row',
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 28,
		overflow: 'hidden',
		marginBottom: 20,
	},
	segment: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 14,
		paddingBottom: 14,
		paddingLeft: 12,
		paddingRight: 12,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
	},
	segmentLeft: {
		borderTopLeftRadius: 28,
		borderBottomLeftRadius: 28,
	},
	segmentRight: {
		borderTopRightRadius: 28,
		borderBottomRightRadius: 28,
	},
	label: {
		fontSize: 14,
		fontWeight: '800',
		fontFamily: family.bold,
		fontStyle: 'italic',
		letterSpacing: 0.4,
	},
};
