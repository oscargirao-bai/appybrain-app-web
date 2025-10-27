import React from 'react';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import { family } from '../../constants/font.jsx';

function StarCount({ stars, max, iconColor }) {
	const colors = useThemeColors();
	const badgeStyle = {
		...styles.countBadge,
		borderColor: iconColor || colors.text,
	};
	const iconStyle = {
		marginRight: 4
	};
	const textStyle = {
		...styles.countText,
		color: iconColor || colors.text
	};
	return (
		<div style={badgeStyle} aria-label={`${stars} / ${max} estrelas`}>
			<LucideIcon name="star" size={14} color={iconColor || colors.text} style={iconStyle} />
			<span style={textStyle}>{`${stars}/${max}`}</span>
		</div>
	);
}

function addAlpha(hex, alpha) {
	if (!hex || hex.startsWith('rgb')) return hex;
	let h = hex.replace('#','');
	if (h.length === 3) h = h.split('').map(c=>c+c).join('');
	const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function ContentList({ data, onPressItem }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();

	return (
		<div style={styles.listContent}>
			{data.map((item) => {
				const pct = (item.stars / item.maxStars) || 0;
				const baseColor = item.color || colors.primary;
				const iconColor = item.iconColor || colors.primary;
				const fillColor = addAlpha(baseColor, 0.8);
				const containerBg = addAlpha(baseColor, 0.5);

				const progressContainerStyle = {
					...styles.progressContainer,
					backgroundColor: baseColor,
					borderColor: containerBg
				};
				const progressFillStyle = {
					...styles.progressFillFull,
					backgroundColor: fillColor,
					flex: pct
				};
				const emptyFillStyle = {
					flex: 1 - pct
				};

				return (
					<button
						key={item.id}
						style={styles.rowOuter}
						onClick={() => onPressItem && onPressItem(item)}
						aria-label={`${translate('learn.openContent')}: ${item.title}. ${item.stars} / ${item.maxStars} ${translate('quizResult.stars')}.`}
						onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
						onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
					>
						<div style={progressContainerStyle}>
							<div style={progressFillStyle} />
							<div style={emptyFillStyle} />
							<div style={styles.rowContent}>
								{item.icon ? (
									<div style={styles.leftIcon}>
										<SvgIcon svgString={item.icon} size={45} color={iconColor} />
									</div>
								) : (
									<div style={styles.leftIcon}>
										<LucideIcon name="book-open" size={40} color={baseColor} />
									</div>
								)}
								<span style={{ ...styles.itemTitle, color: iconColor }}>{item.title}</span>
								<StarCount stars={item.stars} max={item.maxStars} iconColor={iconColor} />
							</div>
						</div>
					</button>
				);
			})}
		</div>
	);
}

const styles = {
	listContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		paddingBottom: 400,
		marginTop: 8,
	},
	rowOuter: {
		width: '100%',
		border: 'none',
		padding: 0,
		background: 'transparent',
		cursor: 'pointer',
		transition: 'opacity 0.2s',
		marginTop: 8,
		marginBottom: 8,
	},
	progressContainer: {
		display: 'flex',
		flexDirection: 'row',
		borderWidth: 2,
		borderStyle: 'solid',
		borderRadius: 16,
		minHeight: 86,
		overflow: 'hidden',
		position: 'relative',
	},
	progressFillFull: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
	},
	rowContent: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 8,
		paddingRight: 8,
		pointerEvents: 'none',
	},
	leftIcon: {
		marginRight: 10,
		width: 45,
		height: 45,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	itemTitle: {
		flex: 1,
		fontSize: 20,
		fontFamily: family.bold,
		fontWeight: '700',
		textAlign: 'left',
	},
	countBadge: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6,
		borderRadius: 30,
		borderWidth: 2,
		borderStyle: 'solid',
	},
	countText: {
		fontSize: 12,
		fontFamily: family.bold,
		fontWeight: '700',
	},
};
