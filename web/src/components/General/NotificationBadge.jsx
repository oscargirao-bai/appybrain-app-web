import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

export default function NotificationBadge({ count = 0, size = 16, style }) {
	const colors = useThemeColors();

	if (count <= 0) {
		return null;
	}

	const displayCount = count > 99 ? '99+' : count.toString();
	const badgeSize = size;
	const fontSize = size * 0.6;

	const badgeStyle = {
		...styles.badge,
		backgroundColor: colors.error,
		width: badgeSize,
		height: badgeSize,
		borderRadius: badgeSize / 2,
		...(style || {})
	};

	const textStyle = {
		...styles.badgeText,
		fontSize: fontSize,
		color: '#FFFFFF'
	};

	return (
		<div style={badgeStyle}>
			<span style={textStyle}>{displayCount}</span>
		</div>
	);
}

const styles = {
	badge: {
		position: 'absolute',
		top: -6,
		right: -6,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: '#FFFFFF',
		padding: 0,
	},
	badgeText: {
		fontWeight: '700',
		textAlign: 'center',
		lineHeight: 1,
	},
};
