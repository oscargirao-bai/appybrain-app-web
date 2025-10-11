import React, { useCallback } from 'react';

import Icon from '@react-native-vector-icons/lucide';
import { useTheme } from '../../services/Theme';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * ButtonLightDark - selector 2 estados (Light / Dark) estilo segmented control.
 * Props opcionais:
 *  - style
 *  - onChange? callback(t)
 */
export default function ButtonLightDark({ style, onChange }) {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const colors = useThemeColors();
	const active = resolvedTheme; // 'light' | 'dark'

	const handleSelect = useCallback((t) => {
		setTheme(t);
		onChange && onChange(t);
	}, [setTheme, onChange]);

	const lightActive = active === 'light';
	const darkActive = active === 'dark';

	return (
		<div style={{...styles.wrapper, ...{ borderColor: colors.text + '22'}}> 
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

function Segment({ label, icon, active, onPress, colors, position }) {
	return (
		<button 			onClick={onPress}
			style={({ pressed }) => [
				styles.segment,
				position === 'left' && styles.segmentLeft,
				position === 'right' && styles.segmentRight,
				active && { backgroundColor: colors.secondary, shadowColor: colors.secondary },
				pressed && { opacity: 0.85 },
			]}
			
			accessibilityState={{ selected: active }}
			aria-label={label}
		>
			<Icon name={icon} size={18} color={active ? '#fff' : colors.text} style={{ marginRight: 8 }} />
			<span style={{...styles.label, ...{ color: active ? '#fff' : colors.text }}} numberOfLines={1}>{label}</span>
		</button>
	);
}

const styles = {
	wrapper: {
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 28,
		overflow: 'hidden',
		marginBottom: 20,
	},
	segment: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 14,
		paddingHorizontal: 12,
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

