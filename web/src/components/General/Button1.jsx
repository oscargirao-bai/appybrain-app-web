import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';

export default function Button1({ label, color, onPress, onClick, style }) {
	const themeColors = useThemeColors();
	const { translate } = useTranslate();
	const resolvedLabel = label || translate('common.play');
	const baseColor = color || themeColors.primary;
	
	// Support both onPress (RN) and onClick (web)
	const handleClick = onClick || onPress;
	
	const isYellow = baseColor && (baseColor.toLowerCase().includes('#ffd') || baseColor.toLowerCase().includes('#ff') || baseColor.toLowerCase() === '#ffd700');
	const gradientColors = isYellow ? [baseColor, '#FFA500'] : [baseColor, themeColors.secondary];

	const hexToRgb = (h) => {
		let x = h?.replace('#', '') || '000000';
		if (x.length === 3) x = x.split('').map(c => c + c).join('');
		const n = parseInt(x, 16);
		return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
	};
	
	const rgbToHex = ({ r, g, b }) => '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
	const mix = (a, b, t) => ({ r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) });
	const addAlpha = (hex, alpha) => {
		const { r, g, b } = hexToRgb(hex);
		return `rgba(${r},${g},${b},${alpha})`;
	};
	const darken = (hex, amt = 0.25) => {
		const rgb = hexToRgb(hex);
		const d = mix(rgb, { r: 0, g: 0, b: 0 }, amt);
		return rgbToHex(d);
	};
	const lighten = (hex, amt = 0.4) => {
		const rgb = hexToRgb(hex);
		const l = mix(rgb, { r: 255, g: 255, b: 255 }, amt);
		return rgbToHex(l);
	};

	const borderColor = darken(baseColor, 0.28);
	const highlightStart = addAlpha('#FFFFFF', 0.85);
	const highlightMid = addAlpha('#FFFFFF', 0.25);
	const auraColor = addAlpha(lighten(baseColor, 0.3), 0.35);
	const textStrokeColor = darken(baseColor, 0.35);

	const buttonStyle = {
		...styles.wrapper,
		...(style || {})
	};

	const faceStyle = {
		...styles.face,
		borderColor: borderColor,
		background: `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]})`,
	};

	const textStyle = {
		...styles.buttonText,
		color: '#FFFFFF',
		textShadow: `0 2px 4px ${textStrokeColor}`,
	};

	return (
		<div style={buttonStyle}>
			<div style={{ ...styles.aura, backgroundColor: auraColor }} />
			<button style={faceStyle} onClick={handleClick} aria-label={resolvedLabel}>
				<span style={textStyle}>{resolvedLabel}</span>
			</button>
		</div>
	);
}

const styles = {
	wrapper: {
		position: 'relative',
		alignSelf: 'center',
		minWidth: 160,
	},
	aura: {
		position: 'absolute',
		top: -18,
		left: -18,
		right: -18,
		bottom: -18,
		borderRadius: 44,
		opacity: 0.4,
		animation: 'glow-pulse 4.4s ease-in-out infinite',
	},
	face: {
		position: 'relative',
		height: 60,
		paddingLeft: 26,
		paddingRight: 26,
		paddingTop: 16,
		paddingBottom: 16,
		borderRadius: 20,
		borderWidth: 3,
		borderStyle: 'solid',
		cursor: 'pointer',
		transition: 'transform 0.12s, filter 0.12s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 3px 5px rgba(0,0,0,0.14)',
	},
	buttonText: {
		fontSize: 22,
		fontWeight: '900',
		textTransform: 'none',
		letterSpacing: 0.4,
	},
};
