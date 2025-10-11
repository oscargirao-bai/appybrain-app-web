import React, { useMemo, useEffect, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import Icon from '../common/Icon.jsx';

// Rarity mapping from API rarityTypeId to color names
const RARITY_MAP = {
	1: 'common',
	2: 'rare',
	3: 'epic',
	4: 'legendary'
};

// rarity -> border color mapping
const RARITY_COLORS = {
	common: '#444444',
	rare: '#F2A93B',
	epic: '#824BFF',
	legendary: '#E84D7A',
};

// helper: add alpha to hex (#RRGGBB) returning rgba()
function addAlpha(hex, alpha) {
	let h = hex.replace('#', '');
	if (h.length === 3) h = h.split('').map(c => c + c).join('');
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function List({ data = [], numColumns = 3, style, scrollEnabled = true, userCoins = 0, onPurchase }) {
	const colors = useThemeColors();
	const [containerWidth, setContainerWidth] = useState(600);

	// Animation state for affordable items
	const [glowOpacity, setGlowOpacity] = useState(0.25);

	useEffect(() => {
		// Start loop if at least one item affordable or free not owned
		const hasHighlight = data.some(i => {
			const owned = i.acquired === 1;
			if (owned) return false;
			const price = i.coins || 0;
			if (price === 0) return true;
			return typeof price === 'number' && price > 0 && price <= userCoins;
		});

		if (hasHighlight) {
			let growing = true;
			const interval = setInterval(() => {
				setGlowOpacity(prev => {
					if (growing) {
						if (prev >= 0.9) {
							growing = false;
							return 0.9;
						}
						return prev + 0.05;
					} else {
						if (prev <= 0.25) {
							growing = true;
							return 0.25;
						}
						return prev - 0.05;
					}
				});
			}, 50);
			return () => clearInterval(interval);
		}
	}, [data, userCoins]);

	const itemSize = useMemo(() => {
		const horizontalPadding = 16 * 2;
		const gap = 12;
		const totalGap = gap * (numColumns - 1);
		return Math.floor((containerWidth - horizontalPadding - totalGap) / numColumns);
	}, [containerWidth, numColumns]);

	// Responsive price font-size based on item size
	const priceFontSize = useMemo(() => {
		if (itemSize <= 84) return 11;
		if (itemSize <= 96) return 12;
		return 14;
	}, [itemSize]);

	const handlePurchase = async (item) => {
		if (item.acquired === 1) return; // already owned

		try {
			if (onPurchase) {
				await onPurchase(item);
			}
		} catch (error) {
			console.error('Purchase failed in List component:', error);
		}
	};

	return (
		<div
			ref={el => {
				if (el) {
					const rect = el.getBoundingClientRect();
					setContainerWidth(rect.width || 600);
				}
			}}
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${numColumns}, 1fr)`,
				gap: 12,
				paddingLeft: 16,
				paddingRight: 16,
				paddingTop: 20,
				paddingBottom: 60,
				overflowY: scrollEnabled ? 'auto' : 'hidden',
				...style
			}}
		>
			{data.map(item => {
				const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
				const rarityColor = RARITY_COLORS[rarity] || colors.primary;
				const owned = item.acquired === 1;
				const price = item.coins || 0;

				const highlight = !owned && (
					(price === 0) || (typeof price === 'number' && price > 0 && price <= userCoins)
				);
				const glowBase = rarityColor;

				return (
					<div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: itemSize, height: itemSize + 36 }}>
						<button
							onClick={() => price !== undefined && handlePurchase({ ...item, price })}
							style={{
								width: itemSize,
								height: itemSize,
								border: `2px solid ${rarityColor}`,
								borderRadius: 12,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: colors.background,
								position: 'relative',
								cursor: 'pointer',
								padding: 0
							}}
						>
							{item.imageUrl ? (
								<img
									src={item.imageUrl}
									alt={item.name || 'Item'}
									style={{
										width: '80%',
										height: '80%',
										borderRadius: 8,
										objectFit: 'contain'
									}}
								/>
							) : (
								<span style={{
									fontSize: 38,
									fontWeight: 700,
									color: `${colors.text}66`
								}}>{item.name?.[0] || '?'}</span>
							)}
							{price !== undefined && (
								<div style={{ position: 'absolute', bottom: -18, left: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									{highlight && (
										<div
											style={{
												position: 'absolute',
												top: 0,
												bottom: 0,
												left: 0,
												right: 0,
												borderRadius: 16,
												backgroundColor: addAlpha(glowBase, 0.35),
												opacity: glowOpacity,
												transform: `scale(${1 + (glowOpacity - 0.25) * 0.4})`,
												transition: 'opacity 50ms, transform 50ms',
												pointerEvents: 'none',
												zIndex: 1,
												boxShadow: '0 0 12px rgba(255,255,255,0.8)'
											}}
										/>
									)}
									<button
										onClick={(e) => {
											e.stopPropagation();
											handlePurchase({ ...item, price });
										}}
										style={{
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											paddingLeft: 10,
											paddingRight: 10,
											paddingTop: 4,
											paddingBottom: 4,
											borderRadius: 12,
											backgroundColor: rarityColor,
											border: 'none',
											cursor: 'pointer',
											zIndex: 2,
											maxWidth: itemSize - 12,
											position: 'relative'
										}}
									>
										{owned ? (
											<span style={{
												fontSize: priceFontSize,
												fontWeight: 800,
												color: colors.background,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
											}}>
												{t('shop.owned')}
											</span>
										) : price === 0 ? (
											<span style={{
												fontSize: priceFontSize,
												fontWeight: 800,
												color: '#fff',
												letterSpacing: 0.5,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												textOverflow: 'ellipsis'
											}}>
												{t('shop.free')}
											</span>
										) : (
											<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
												<Icon name="coins" size={14} color={colors.background} style={{ marginRight: 4 }} />
												<span style={{
													fontSize: priceFontSize,
													fontWeight: 700,
													color: colors.background,
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													textOverflow: 'ellipsis'
												}}>
													{price}
												</span>
											</div>
										)}
									</button>
								</div>
							)}
						</button>
					</div>
				);
			})}
		</div>
	);
}
