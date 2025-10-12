import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
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

export default function CustomizeList({ 
	data = [], 
	numColumns = 3, 
	style, 
	userCoins = 0, 
	onPurchase, 
	onSelect, 
	selectedIds = {}, 
	bottomPadding = 200 
}) {
	const colors = useThemeColors();
	const width = window.innerWidth;
	const styles = useMemo(() => createStyles(colors), [colors]);

	const itemSize = useMemo(() => {
		const horizontalPadding = 16 * 2;
		const gap = 12;
		const totalGap = gap * (numColumns - 1);
		return Math.floor((width - horizontalPadding - totalGap) / numColumns);
	}, [width, numColumns]);

	return (
		<div style={{ ...styles.container, ...style }}>
			<div style={styles.grid}>
				{data.map((item) => {
					const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
					const rarityColor = RARITY_COLORS[rarity] || colors.primary;
					const owned = item.acquired === 1;
					const price = item.coins || 0;
					
					const typeKey = item.cosmeticTypeId === 1 
						? 'avatar' 
						: item.cosmeticTypeId === 2 
							? 'background' 
							: item.cosmeticTypeId === 3 
								? 'frame' 
								: undefined;
					
					const chosenFromState = typeKey 
						? String(selectedIds[typeKey] || '') === String(item.id) 
						: false;
					
					const chosenApi = item.selected === 1 || 
						item.selected === true || 
						item.equipped === 1 || 
						item.equipped === true || 
						item.isSelected === true || 
						item.active === 1;
					
					const hasLocalSelectionForType = typeKey 
						? selectedIds[typeKey] !== null && 
							selectedIds[typeKey] !== undefined && 
							String(selectedIds[typeKey]) !== '' 
						: false;
					
					const chosen = hasLocalSelectionForType 
						? chosenFromState 
						: (chosenFromState || chosenApi);
					
					return (
						<div key={item.id} style={{ ...styles.cardWrap, width: itemSize }}>
							<button
								style={{ 
									...styles.card, 
									width: itemSize, 
									borderColor: rarityColor 
								}}
								onClick={() => {
									if (onSelect && owned) onSelect(item);
									else if (!owned && onPurchase) onPurchase({ ...item, price });
								}}
								aria-label={`Cosmético ${item.name}`}
							>
								{item.imageUrl ? (
									<img 
										src={item.imageUrl} 
										alt={item.name || "Cosmetic"}
										style={styles.itemImage}
									/>
								) : (
									<span style={styles.placeholder}>
										{item.name?.[0] || '?'}
									</span>
								)}
								
								{chosen && (
									<div style={styles.pricePillWrap}>
										<div 
											style={{
												...styles.pricePill, 
												backgroundColor: rarityColor
											}}
										>
											<span style={{
												...styles.priceText, 
												color: colors.background
											}}>
												Escolhido
											</span>
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

function createStyles(colors) {
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
			borderWidth: '2px',
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
			fontSize: 14, 
			fontFamily: family.bold 
		},
	};
}
