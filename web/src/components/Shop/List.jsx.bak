import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import {
	addAlpha,
	createStyles,
	DEFAULT_WIDTH,
	GAP,
	H_PADDING,
	RARITY_COLORS,
	RARITY_MAP,
} from './listUtils.js';

export default function List({
	data = [],
	numColumns = 3,
	style,
	userCoins = 0,
	onPurchase,
}) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(() => {
		if (typeof window === 'undefined') return DEFAULT_WIDTH;
		return Math.min(window.innerWidth, DEFAULT_WIDTH);
	});

	useEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		const updateWidth = () => {
			const rect = node.getBoundingClientRect();
			if (rect.width) {
				setContainerWidth(rect.width);
			}
		};

		updateWidth();

		if (typeof ResizeObserver !== 'undefined') {
			const observer = new ResizeObserver(() => updateWidth());
			observer.observe(node);
			return () => observer.disconnect();
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateWidth);
			return () => window.removeEventListener('resize', updateWidth);
		}

		return undefined;
	}, []);

	const itemSize = useMemo(() => {
		const available = Math.max(containerWidth - H_PADDING, 200);
		const perColumn = Math.floor((available - GAP * (numColumns - 1)) / Math.max(numColumns, 1));
		if (numColumns >= 3) {
			return Math.max(86, Math.min(perColumn, 110));
		}
		return Math.max(120, Math.min(perColumn, 160));
	}, [containerWidth, numColumns]);

	const priceFontSize = useMemo(() => {
		if (itemSize <= 84) return 11;
		if (itemSize <= 96) return 12;
		return 14;
	}, [itemSize]);

	const styles = useMemo(
		() => createStyles(colors, priceFontSize, numColumns, itemSize),
		[colors, priceFontSize, numColumns, itemSize],
	);

	const handlePurchase = async (item) => {
		if (item.acquired === 1) return;
		if (!onPurchase) return;
		try {
			await onPurchase(item);
		} catch (error) {
			console.error('Purchase failed:', error);
		}
	};

	return (
		<div ref={containerRef} style={{ ...styles.container, ...(style || {}) }}>
			<div
				style={{
					...styles.grid,
					gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))`,
				}}
			>
				{data.map((item) => {
					const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
					const rarityColor = RARITY_COLORS[rarity] || colors.primary;
					const owned = item.acquired === 1;
					const price = item.coins || 0;
					const highlight = !owned && ((price === 0) || (typeof price === 'number' && price > 0 && price <= userCoins));

					return (
						<div key={item.id} style={styles.cardWrap}>
							<button
								type="button"
								style={{
									...styles.card,
									width: itemSize,
									height: itemSize,
									borderColor: rarityColor,
									boxShadow: highlight ? `0 8px 22px ${addAlpha(rarityColor, 0.25)}` : 'none',
									transform: highlight ? 'translateY(-3px)' : 'translateY(0)',
								}}
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
												boxShadow: highlight ? `0 0 0 6px ${addAlpha(rarityColor, 0.18)}` : 'none',
											}}
										>
											{owned ? (
												<span style={{ ...styles.priceText, color: '#fff' }}>
													{translate('shop.owned')}
												</span>
											) : price === 0 ? (
												<span style={{ ...styles.priceText, color: '#fff' }}>
													{translate('shop.free')}
												</span>
											) : (
												<div style={styles.priceRow}>
													<LucideIcon name="coins" size={14} color={colors.background} style={{ marginRight: 4 }} />
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
