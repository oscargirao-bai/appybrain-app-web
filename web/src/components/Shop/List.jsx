import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import { family } from '../../constants/font.jsx';

const RARITY_MAP = {
	1: 'common',
	2: 'rare', 
	3: 'epic',
	4: 'legendary'
};

const RARITY_COLORS = {
	common: '#444444',
	rare: '#F2A93B',
	epic: '#824BFF',
	legendary: '#E84D7A',
};

export default function List({ 
	data = [], 
	numColumns = 3, 
	style, 
	userCoins = 0, 
	onPurchase 
}) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth;

	const itemSize = useMemo(() => {
		const horizontalPadding = 16 * 2;
		const gap = 12;
		const totalGap = gap * (numColumns - 1);
		return Math.floor((width - horizontalPadding - totalGap) / numColumns);
	}, [width, numColumns]);

	const priceFontSize = useMemo(() => {
		if (itemSize <= 84) return 11;
		if (itemSize <= 96) return 12;
		return 14;
	}, [itemSize]);

	const styles = useMemo(() => createStyles(colors, priceFontSize), [colors, priceFontSize]);

	const handlePurchase = async (item) => {
		if (item.acquired === 1) return;
		if (onPurchase) {
			try {
				await onPurchase(item);
			} catch (error) {
				console.error('Purchase failed:', error);
			}
		}
	};

	return (
		<div style={{ ...styles.container, ...style }}>
			<div style={styles.grid}>
				{data.map((item) => {
					const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
					const rarityColor = RARITY_COLORS[rarity] || colors.primary;
					const owned = item.acquired === 1;
					const price = item.coins || 0;
					
					return (
						<div key={item.id} style={{ ...styles.cardWrap, width: itemSize }}>
							<button
								style={{ ...styles.card, width: itemSize, borderColor: rarityColor }}
								onClick={() => handlePurchase({ ...item, price })}
								aria-label={`Comprar ${item.name}`}
							>
								{item.imageUrl ? (
									<img 
										src={item.imageUrl} 
										alt={item.name}
										style={styles.itemImage}
									/>
								) : (
									<span style={styles.placeholder}>{item.name?.[0] || '?'}</span>
								)}
								
								{price !== undefined && (
									<div style={styles.pricePillWrap}>
										<div
											style={{
												...styles.pricePill,
												backgroundColor: rarityColor,
												maxWidth: itemSize - 12
											}}
										>
											{owned ? (
												<span style={{ ...styles.priceText, color: colors.background }}>
													{translate('shop.owned')}
												</span>
											) : price === 0 ? (
												<span style={{ ...styles.priceText, color: '#fff' }}>
													{translate('shop.free')}
												</span>
											) : (
												<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
													<SvgIcon name="coins" size={14} color={colors.background} style={{ marginRight: 4 }} />
													<span style={{ ...styles.priceText, color: colors.background }}>
														{price}
													</span>
												</div>
											)}
										</div>
									</div>
								)}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function createStyles(colors, priceFontSize) {
	return {
		container: {
			overflowY: 'auto',
			paddingBottom: 60,
			paddingTop: 20,
		},
		grid: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: 12,
			paddingLeft: 16,
			paddingRight: 16,
		},
		cardWrap: { 
			display: 'flex',
			alignItems: 'center', 
			justifyContent: 'flex-start' 
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
			aspectRatio: 1,
			cursor: 'pointer',
			padding: 0,
		},
		itemImage: {
			width: '80%',
			height: '80%',
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
			paddingLeft: 10,
			paddingRight: 10,
			paddingTop: 4,
			paddingBottom: 4,
			borderRadius: 12,
		},
		pricePillWrap: {
			position: 'absolute',
			bottom: -18,
			left: 6,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
		},
		priceText: { 
			fontSize: priceFontSize, 
			fontFamily: family.bold 
		},
	};
}
