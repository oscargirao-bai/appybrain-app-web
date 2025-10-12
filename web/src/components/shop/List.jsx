import React, { useMemo, useRef, useEffect, useCallback } from 'react';

import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import SvgIcon from '../../components/General/SvgIcon';
import { family } from '../../constants/font';

// Rarity mapping from API rarityTypeId to color names
const RARITY_MAP = {
	1: 'common',
	2: 'rare', 
	3: 'epic',
	4: 'legendary'
};

// rarity -> border color mapping
const RARITY_COLORS = {
	common: '#444444', // expand to full hex to reliably append alpha
	rare: '#F2A93B',
	epic: '#824BFF',
	legendary: '#E84D7A',
};

// helper: add alpha to hex (#RRGGBB) returning rgba()
function addAlpha(hex, alpha) {
	let h = hex.replace('#','');
	if (h.length === 3) h = h.split('').map(c => c + c).join('');
	const r = parseInt(h.slice(0,2),16);
	const g = parseInt(h.slice(2,4),16);
	const b = parseInt(h.slice(4,6),16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function List({ data = [], numColumns = 3, style, scrollEnabled = true, userCoins = 0, onPurchase }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth; const height = window.innerHeight;


	// purchase handler
	const handlePurchase = useCallback(async (item) => {
		if (item.acquired === 1) return; // already owned
		
		try {
			// Call the parent's onPurchase handler which uses DataManager
			if (onPurchase) {
				await onPurchase(item);
			}
		} catch (error) {
			console.error('Purchase failed in List component:', error);
		}
	}, [onPurchase]);

	// Single shared animation driver for all affordable items (performance friendly)
	const affordableAnim = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		// Start loop if at least one item affordable or free not owned; stop otherwise
		const hasHighlight = data.some(i => {
			const owned = i.acquired === 1;
			if (owned) return false;
			const price = i.coins || 0;
			if (price === 0) return true;
			return typeof price === 'number' && price > 0 && price <= userCoins;
		});
		let loop;
		if (hasHighlight) {
			loop = Animated.loop(
				Animated.sequence([
					Animated.timing(affordableAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
					Animated.timing(affordableAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
				])
			);
			loop.start();
		} else {
			affordableAnim.stopAnimation();
		}
		return () => {
			loop && loop.stop();
		});
	}, [data, userCoins, affordableAnim]);

	const itemSize = useMemo(() => {
		const horizontalPadding = 16 * 2; // mimic screen padding
		const gap = 12;
		const totalGap = gap * (numColumns - 1);
		return Math.floor((width - horizontalPadding - totalGap) / numColumns);
	}, [width, numColumns]);

	// Responsive price font-size based on item size
	const priceFontSize = useMemo(() => {
		if (itemSize <= 84) return 11; // very small tiles
		if (itemSize <= 96) return 12; // small tiles
		return 14; // default
	}, [itemSize]);

	// Create dynamic styles based on theme colors and responsive font size
	const styles = useMemo(() => createStyles(colors, priceFontSize), [colors, priceFontSize]);

	const renderItem = ({ item }) => {
		// Transform API data to component format
		const rarity = RARITY_MAP[item.rarityTypeId] || 'common';
		const rarityColor = RARITY_COLORS[rarity] || colors.primary;
		const owned = item.acquired === 1; // Check API data
		const price = item.coins || 0; // Use 'coins' field from API
		
		const highlight = !owned && (
			(price === 0) || (typeof price === 'number' && price > 0 && price <= userCoins)
		);
		const glowBase = rarityColor;
		
		return (
			<div style={{...styles.cardWrap, ...{ width: itemSize}}> 
				<button 					style={{...styles.card, ...{ width: itemSize}}
					onClick={() => price !== undefined && handlePurchase({ ...item, price })}
					android_ripple={{ color: rarityColor + '33' }}
				>
					{item.imageUrl ? (
						<img 
							source={{ uri: item.imageUrl }} 
							style={styles.itemImage}
							style={{objectFit: "contain"}}
						/>
					) : (
						<span style={styles.placeholder}>{item.name?.[0] || '?'}</span>
					)}
					{price !== undefined && (
						<div style={styles.pricePillWrap}>
							{highlight && (
								<Animated.View
									pointerEvents="none"
									style={[
										styles.glow,
										{ backgroundColor: addAlpha(glowBase, 0.35),
											opacity: affordableAnim.interpolate({ inputRange: [0,1], outputRange: [0.25, 0.9] }),
											transform: [{ scale: affordableAnim.interpolate({ inputRange: [0,1], outputRange: [1, 1.25] }) }],
										}
									]}
								/>
							)}
							<button 								onClick={() => handlePurchase({ ...item, price })}
								style={({ pressed }) => [
									styles.pricePill,
									{ backgroundColor: rarityColor, opacity: pressed ? 0.8 : 1, maxWidth: itemSize - 12 }
								]}
							>
								{owned ? (
									<span 										style={{...styles.priceText, ...{ color: colors.background}}
										numberOfLines={1}
										ellipsizeMode="tail"
										adjustsFontSizeToFit
										minimumFontScale={0.8}
									>
										{translate('shop.owned')}
									</span>
								) : price === 0 ? (
									<span 										style={{...styles.priceText, ...{ color: '#fff'}}
										numberOfLines={1}
										ellipsizeMode="tail"
										adjustsFontSizeToFit
										minimumFontScale={0.8}
									>
										{translate('shop.free')}
									</span>
								) : (
									<div style={{ flexDirection: 'row', alignItems: 'center' }}>
										<SvgIcon name="coins" size={14} color={colors.background} style={{ marginRight: 4 }} />
										<span 											style={{...styles.priceText, ...{ color: colors.background }}}
											numberOfLines={1}
											ellipsizeMode="tail"
											adjustsFontSizeToFit
											minimumFontScale={0.85}
										>
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
	};

	return (
		<div 			data={data}
			keyExtractor={item => item.id}
			numColumns={numColumns}
			scrollEnabled={scrollEnabled}
			columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
			contentContainerStyle={{ gap: 12, paddingBottom: 60, paddingTop: 20 }}
			renderItem={renderItem}
			style={style}
		/>
	);
}

function createStyles(colors, priceFontSize) {
	return StyleSheet.create({
		cardWrap: { alignItems: 'center', justifyContent: 'flex-start' },
		card: {
			borderWidth: 2,
			borderRadius: 12,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.background,
			position: 'relative',
		},
		itemImage: {
			width: '80%',
			height: '80%',
			borderRadius: 8,
		},
		placeholder: { 
			fontSize: 38,
			fontFamily: family.bold,
			color: colors.text + '66',
		},
		pricePill: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingHorizontal: 10,
			paddingVertical: 4,
			borderRadius: 12,
			zIndex: 2,
		},
		pricePillWrap: {
			position: 'absolute',
			bottom: -18,
			left: 6,
			alignItems: 'center',
			justifyContent: 'center',
		},
		glow: {
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			borderRadius: 16,
			zIndex: 1,
			flexDirection: 'row',
			shadowColor: '#fff',
			shadowOpacity: 0.8,
			shadowRadius: 12,
			shadowOffset: { width: 0, height: 0 },
		},
		priceText: { fontSize: priceFontSize, fontFamily: family.bold },
	};
}

