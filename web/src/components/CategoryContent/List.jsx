import React from 'react';
import SvgIcon from '../General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import { family } from '../../constants/font';

function StarCount({ stars, max, iconColor }) {
	const colors = useThemeColors();
	const pct = (stars / max) || 0;
	const full = pct >= 1;
	const badgeStyle = {
		...styles.countBadge,
		borderColor: iconColor || colors.text
	};
	const textStyle = {
		...styles.countText,
		color: iconColor || colors.text
	};
	return (
		<div style={badgeStyle} aria-label={`${stars} estrelas`}>
			<SvgIcon name="star" size={14} color={iconColor || colors.text} style={{ marginRight: 4 }} />
			<span style={textStyle}>{stars}</span>
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
			{data.map((item, index) => {
				const pct = (item.stars / item.maxStars) || 0;
				const baseColor = item.color || colors.primary;
				const iconColor = item.iconColor || colors.primary;
				const fillColor = addAlpha(baseColor, 0.8);
				const containerBg = addAlpha(baseColor, 0.5);

				const progressContainerStyle = {
					...styles.progressContainer,
					backgroundColor: baseColor
				};
				const progressFillStyle = {
					...styles.progressFillFull,
					backgroundColor: fillColor
				};
				const leftIconStyle = {
					...styles.leftIcon,
					width: 45
				};

				return (
					<button
						key={item.id}
						style={styles.rowOuter}
						onClick={() => onPressItem && onPressItem(item)}
						aria-label={`${translate('learn.openContent')}: ${item.title}. ${item.stars} / ${item.maxStars} ${translate('quizResult.stars')}.`}
					>
						<div style={progressContainerStyle}>
							<div style={progressFillStyle} />
							<div style={{ flex: 1 - pct }} />
							<div style={styles.rowContent}>
								{item.icon ? (
									<div style={leftIconStyle}>
										<SvgIcon svgString={item.icon} size={45} color={iconColor} />
									</div>
								) : (
									<div style={leftIconStyle}>
										<SvgIcon name="book" size={45} color={iconColor} />
									</div>
								)}
								<div style={styles.textBlock}>
									<span style={styles.title}>{item.title}</span>
								</div>
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
		gap: 16,
	},
	rowOuter: {
		width: '100%',
		borderRadius: 16,
		overflow: 'hidden',
		border: 'none',
		padding: 0,
		background: 'transparent',
		cursor: 'pointer',
		transition: 'opacity 0.2s',
	},
	progressContainer: {
		position: 'relative',
		display: 'flex',
		flexDirection: 'row',
		minHeight: 64,
	},
	progressFillFull: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		width: '100%',
	},
	rowContent: {
		position: 'relative',
		zIndex: 1,
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 12,
		paddingRight: 12,
		gap: 12,
	},
	leftIcon: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textBlock: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	title: {
		fontFamily: family.bold,
		fontSize: 16,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	countBadge: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 4,
		paddingBottom: 4,
		borderRadius: 12,
		borderWidth: 2,
		borderStyle: 'solid',
		backgroundColor: 'rgba(255,255,255,0.2)',
	},
	countText: {
		fontFamily: family.semibold,
		fontSize: 14,
		fontWeight: '600',
	},
};
