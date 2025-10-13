import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
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

const addAlpha = (hex, alpha) => {
	if (!hex) return `rgba(0,0,0,${alpha})`;
	let h = hex.replace('#', '');
	if (h.length === 3) {
		h = h.split('').map((c) => c + c).join('');
	}
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(() => {
		if (typeof window === 'undefined') return 0;
		return Math.min(window.innerWidth, 620);
	});

	useEffect(() => {
		const node = containerRef.current;
		if (!node) return;

		const update = () => {
			const rect = node.getBoundingClientRect();
			setContainerWidth(rect.width);
		};

		update();

		if (typeof ResizeObserver !== 'undefined') {
			const observer = new ResizeObserver((entries) => {
				const entry = entries[0];
				if (entry) {
					setContainerWidth(entry.contentRect.width);
				}
			});
			observer.observe(node);
			return () => observer.disconnect();
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('resize', update);
			return () => window.removeEventListener('resize', update);
		}

		return undefined;
	}, []);

	const priceFontSize = useMemo(() => {
		const horizontalPadding = 16 * 2;
		const gap = 12;
		const effectiveWidth = containerWidth || (typeof window !== 'undefined' ? window.innerWidth * 0.5 : 0);
		const available = (effectiveWidth - horizontalPadding - gap * (numColumns - 1)) / Math.max(numColumns, 1);
		if (available <= 84) return 11;
		if (available <= 96) return 12;
		return 14;
	}, [containerWidth, numColumns]);

	const styles = useMemo(() => createStyles(colors, priceFontSize, numColumns), [colors, priceFontSize, numColumns]);

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
		<div ref={containerRef} style={{ ...styles.container, ...style }}>
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
												maxWidth: 'calc(100% - 12px)',
												boxShadow: highlight ? `0 0 0 6px ${addAlpha(rarityColor, 0.18)}` : 'none',
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
													<LucideIcon name="coins" size={14} color={colors.background} style={{ marginRight: 4 }} />
													<span style={{ ...styles.priceText, color: colors.background }}>
														{price}
													</span>
												</div>
											)}
										</div>
									</div>
								);
							</button>
							</div>
							);
				})}
			</div>
		</div>
			function createStyles(colors, priceFontSize, numColumns) {
}

function createStyles(colors, priceFontSize) {
	return {
		container: {
			display: 'flex',
			flexDirection: 'column',
			overflowY: 'auto',
			paddingBottom: 60,
						display: 'grid',
						gap: 12,
			display: 'flex',
			flexWrap: 'wrap',
			gap: 12,
			paddingLeft: 16,
						display: 'flex',
						alignItems: 'center', 
						justifyContent: 'center',
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
						width: '100%',
						aspectRatio: '1 / 1',
			backgroundColor: colors.background,
			position: 'relative',
			aspectRatio: 1,
			cursor: 'pointer',
			padding: 0,
						width: numColumns >= 3 ? '68%' : '72%',
						height: numColumns >= 3 ? '68%' : '72%',
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
			gap: 6,
			paddingLeft: 12,
			paddingRight: 12,
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
