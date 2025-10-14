import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
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
	onPurchase,
	onSelect,
	selectedIds = {},
	bottomPadding = 200,
}) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(() => {
		if (typeof window === 'undefined') return 360;
		return Math.max(320, Math.min(window.innerWidth * 0.5, 560));
	});
	const styles = useMemo(() => createStyles(colors), [colors]);

	useEffect(() => {
		const node = containerRef.current;
		if (!node || typeof ResizeObserver === 'undefined') return undefined;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			setContainerWidth(entry.contentRect.width);
		});
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	const itemSize = useMemo(() => {
		const horizontalPadding = 16 * 2;
		const gap = 12;
		const available = Math.max(containerWidth - horizontalPadding - gap * (numColumns - 1), 180);
		return Math.floor(available / Math.max(numColumns, 1));
	}, [containerWidth, numColumns]);

	return (
		<div ref={containerRef} style={{ ...styles.container, ...(style || {}) }}>
			<div
				style={{
					...styles.grid,
					gridTemplateColumns: `repeat(${numColumns}, minmax(${itemSize}px, 1fr))`,
					paddingBottom: bottomPadding,
				}}
			>
				{data.map((item) => {
					const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
					const rarityColor = RARITY_COLORS[rarity] || colors.primary;
					const owned = item.acquired === 1;
					
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
					
					const cardStyle = {
						...styles.card,
						borderColor: rarityColor,
						boxShadow: chosen ? `0 14px 24px ${addAlpha(rarityColor, 0.32)}` : 'none',
						transform: chosen ? 'translateY(-2px)' : 'translateY(0)',
					};

					return (
						<div key={item.id} style={styles.cardWrap}>
							<button
								type="button"
								style={cardStyle}
								onClick={() => {
									if (owned && onSelect) onSelect(item);
									else if (!owned && onPurchase) onPurchase(item);
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
												backgroundColor: rarityColor,
											}}
										>
											<span
												style={{
													...styles.priceText,
													color: colors.background,
												}}
											>
												{translate('customize.selected')}
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
			paddingTop: 20,
		},
		grid: {
			display: 'grid',
			columnGap: 12,
			rowGap: 12,
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
			borderWidth: '2px',
			borderStyle: 'solid',
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.card,
			position: 'relative',
			aspectRatio: '1 / 1',
			cursor: 'pointer',
			padding: 0,
			transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
			left: '50%',
			transform: 'translateX(-50%)',
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

function addAlpha(hex, alpha) {
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
