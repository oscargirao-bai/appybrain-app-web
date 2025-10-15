import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import SvgIcon from '../../components/General/SvgIcon.jsx';

/**
 * Subject card (circular) with icon + label underneath.
 * Props:
 *  - title: string
 *  - iconName: lucide icon name (e.g. 'calculator')
 *  - onPress: function
 *  - size: diameter of circle (optional, default 120)
 *  - style: container style override
 */
export default function Subject({ title, iconName = 'book-open', onPress, size = 160, style }) {
	const colors = useThemeColors();

	return (
		<div style={{...styles.wrap, ...style}}>      
			<button 				
				aria-label={title}
				onClick={onPress}
				style={{
					...styles.touchArea,
					width: size,
					height: size,
				}}
			>
				<div style={{
					...styles.circle,
					width: size,
					height: size,
					borderRadius: size / 2,
					borderColor: addAlpha(colors.text, 0.12),
					backgroundColor: addAlpha(colors.text, 0.02),
				}}>
					<SvgIcon name={iconName} size={size * 0.36} color={addAlpha(colors.text, 0.9)} />
				</div>
			</button>
			<span style={{...styles.label, ...{ color: colors.accent }}}>{(title || '').toUpperCase()}</span>
		</div>
	);
}

// Helpers
function addAlpha(hexOrRgba, alpha) {
	if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) {
		// naive replace last )
		return hexOrRgba.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
			const parts = inner.split(',').map(p => p.trim());
			const [r,g,b] = parts;
			return `rgba(${r},${g},${b},${alpha})`;
		});
	}
	let h = hexOrRgba.replace('#', '');
	if (h.length === 3) h = h.split('').map(c => c + c).join('');
	const int = parseInt(h, 16);
	const r = (int >> 16) & 255; const g = (int >> 8) & 255; const b = int & 255;
	return `rgba(${r},${g},${b},${alpha})`;
}

const styles = {
	wrap: { alignItems: 'center', justifyContent: 'flex-start' },
	touchArea: { alignItems: 'center', justifyContent: 'center' },
	circle: {
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
	},
	label: {
		marginTop: 10,
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
		letterSpacing: 0.5,
		textAlign: 'center',
		maxWidth: 160,
	},
};
