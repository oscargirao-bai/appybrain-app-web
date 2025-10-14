import { family } from '../../constants/font.jsx';

export const RARITY_MAP = {
	1: 'common',
	2: 'rare',
	3: 'epic',
	4: 'legendary',
};

export const RARITY_COLORS = {
	common: '#444444',
	rare: '#F2A93B',
	epic: '#824BFF',
	legendary: '#E84D7A',
};

export const DEFAULT_WIDTH = 620;
export const GAP = 12;
export const ROW_GAP = 20;
export const H_PADDING = 32; // 16 left + 16 right

export function addAlpha(hex, alpha) {
	if (!hex) return `rgba(0,0,0,${alpha})`;
	let value = hex.replace('#', '');
	if (value.length === 3) {
		value = value.split('').map((c) => c + c).join('');
	}
	const r = parseInt(value.slice(0, 2), 16);
	const g = parseInt(value.slice(2, 4), 16);
	const b = parseInt(value.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createStyles(colors, priceFontSize, numColumns, itemSize) {
	const imageScale = numColumns >= 3 ? 0.68 : 0.74;

	return {
		container: {
			display: 'flex',
			flexDirection: 'column',
			overflowY: 'auto',
			paddingBottom: 60,
			paddingTop: 20,
		},
		grid: {
			display: 'grid',
			columnGap: GAP,
			rowGap: ROW_GAP,
			paddingLeft: 16,
			paddingRight: 16,
		},
		cardWrap: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		card: {
			display: 'flex',
			borderWidth: 2,
			borderStyle: 'solid',
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.background,
			position: 'relative',
			cursor: 'pointer',
			padding: 0,
			transition: 'transform 0.25s ease, box-shadow 0.25s ease',
		},
		itemImage: {
			width: itemSize * imageScale,
			height: itemSize * imageScale,
			borderRadius: 8,
			objectFit: 'contain',
		},
		placeholder: {
			fontSize: 38,
			fontFamily: family.bold,
			color: colors.text + '66',
		},
		pricePill: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			gap: 6,
			paddingLeft: 12,
			paddingRight: 12,
			paddingTop: 4,
			paddingBottom: 4,
			borderRadius: 12,
			justifyContent: 'center',
		},
		priceRow: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		},
		pricePillWrap: {
			position: 'absolute',
			bottom: -18,
			left: '50%',
			transform: 'translateX(-50%)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		priceText: {
			fontSize: priceFontSize,
			fontFamily: family.bold,
		},
	};
}
