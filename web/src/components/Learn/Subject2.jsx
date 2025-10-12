import React, { useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import SvgIcon from '../General/SvgIcon.jsx';

export default function Subject2({ title, iconName = 'book-open', svgIcon, color, onPress, height = 70, style }) {
	const colors = useThemeColors();
	const [pressed, setPressed] = useState(false);

	const backgroundColor = color;
	const borderColor = addAlpha(color, 0.7);
	const iconColor = color || colors.text;
	const textColor = style?.textColor || '#FFFFFF';

	const containerStyle = {
		...styles.container,
		backgroundColor,
		borderColor,
		height,
		transform: pressed ? 'scale(0.97)' : 'scale(1)',
		opacity: pressed ? 0.9 : 1,
	};

	return (
		<div style={{ ...styles.outer, ...(style || {}) }}>
			<button
				aria-label={title}
				onClick={onPress}
				onMouseDown={() => setPressed(true)}
				onMouseUp={() => setPressed(false)}
				onMouseLeave={() => setPressed(false)}
				style={containerStyle}
			>
				<div style={styles.side}>
					{svgIcon ? (
						<SvgIcon svgString={svgIcon} size={28} color={textColor} />
					) : (
						<SvgIcon name={iconName} size={28} color={iconColor} />
					)}
				</div>
				<div style={styles.titleWrapper}>
					<span style={{ ...styles.title, color: textColor }}>{title}</span>
				</div>
				<div style={styles.side} />
			</button>
		</div>
	);
}

function addAlpha(hexOrRgba, alpha) {
	if (!hexOrRgba) return `rgba(0,0,0,${alpha})`;
	if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) {
		return hexOrRgba.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
			const parts = inner.split(',').map(p => p.trim());
			const [r, g, b] = parts;
			return `rgba(${r},${g},${b},${alpha})`;
		});
	}
	let h = hexOrRgba.replace('#', '');
	if (h.length === 3) h = h.split('').map(c => c + c).join('');
	const int = parseInt(h, 16);
	const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
	return `rgba(${r},${g},${b},${alpha})`;
}

const styles = {
	outer: {
		width: '80%',
	},
	container: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderStyle: 'solid',
		borderRadius: 20,
		paddingLeft: 14,
		paddingRight: 14,
		transition: 'transform 0.15s ease, opacity 0.15s ease',
		cursor: 'pointer',
		background: 'transparent',
	},
	side: {
		width: 40,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	titleWrapper: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontFamily: family.bold,
		fontSize: 18,
		fontWeight: '700',
		textAlign: 'center',
	},
};
