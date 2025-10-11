import React, { useMemo, useEffect, useRef } from 'react';
import {Easing} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import DataManager from '../../services/DataManager';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// Helper function to get chest image based on type
function getChestImage(chestType) {
	switch (chestType) {
		case 'bronze':
			return require('../../../assets/chests/chest-bronze.png');
		case 'silver':
			return require('../../../assets/chests/chest-silver.png');
		case 'gold':
			return require('../../../assets/chests/chest-gold.png');
		case 'epic':
			return require('../../../assets/chests/chest-epic.png');
		default:
			return require('../../../assets/chests/chest-bronze.png'); // Default fallback
	}
}

/**
 * Chest progress display (matches provided reference image):
 *  ┌───────────────────────────┐
 *  │ (circle with chest + dot) ★ 0 │
 *  └───────────────────────────┘
 *
 * Props:
 *  - stars: current number of stars counted towards next chest (fallback if no API data)
 *  - target: target stars to unlock (fallback if no API data) (default 10)
 *  - size: diameter of outer circle (default 86)
 *  - progress: 0..1 (optional explicit progress for dot position; if not provided uses current/target from API)
 *  - dataSource: 'stars' or 'points' - determines which chest data source to use from API (default 'stars')
 */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Chest({ stars = 0, target = 10, size = 64, progress, style, dataSource = 'stars' }) {
	const colors = useThemeColors();
	
	// Get chest data from DataManager
	const chestData = DataManager.getUserChests();
	const sourceData = dataSource === 'points' ? chestData?.points : chestData?.stars;
	
	// Determine if there are available (unopened) chests
	const availableChests = sourceData?.chests?.filter(chest => chest.openedAt === null) || [];
	const hasAvailableChests = availableChests.length > 0;
	
	// Use API data if available, otherwise fall back to props
	const currentValue = sourceData?.current || stars;
	const targetValue = sourceData?.nextThreshold || target;
	
	// Get the chest type for the image - prioritize available chests, then next chest type
	let chestType;
	if (hasAvailableChests) {
		// Show the first available chest's type
		chestType = availableChests[0]?.chestType || 'bronze';
		//console.log('Chest: Showing available chest type:', chestType, 'from chest:', availableChests[0]);
	} else {
		// Show the next chest type the user is working towards
		chestType = sourceData?.nextChestType || 'bronze';
		//console.log('Chest: Showing next chest type:', chestType, 'progress:', currentValue, '/', targetValue);
	}
	const chestImage = getChestImage(chestType);
	
	// Calculate progress: full if there are available chests, otherwise based on current/target
	let calculatedProgress;
	if (hasAvailableChests) {
		calculatedProgress = 1;
	} else {
		// Find the last earned chest milestone to calculate proper progress
		const earnedChests = sourceData?.chests?.filter(chest => chest.grantedAt) || [];
		const lastEarnedChest = earnedChests.length > 0 
			? earnedChests.reduce((latest, chest) => 
				new Date(chest.grantedAt) > new Date(latest.grantedAt) ? chest : latest
			) 
			: null;
		
		const startingMilestone = lastEarnedChest?.milestone || 0;
		const progressRange = targetValue - startingMilestone;
		const currentProgress = currentValue - startingMilestone;
		
		calculatedProgress = progressRange > 0 ? (currentProgress / progressRange) : 0;
		
	}
	const p = Math.min(1, Math.max(0, progress != null ? progress : calculatedProgress));
	const ringThickness = 8; // could be prop later

	const radius = (size - ringThickness) / 2; // stroke radius
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - p);

	const circleBorder = colors.text + '33';
	const baseColor = colors.secondary;

	function lighten(hex, amount = 0.4) {
		if (!hex || typeof hex !== 'string') return hex;
		const raw = hex.replace('#','');
		if (raw.length !== 6) return hex; // fallback se não for #RRGGBB
		const num = parseInt(raw,16);
		const r = (num >> 16) & 0xff;
		const g = (num >> 8) & 0xff;
		const b = num & 0xff;
		const nr = Math.round(r + (255 - r) * amount);
		const ng = Math.round(g + (255 - g) * amount);
		const nb = Math.round(b + (255 - b) * amount);
		const toHex = v => v.toString(16).padStart(2,'0');
		return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
	}

	const lighter = lighten(baseColor, 0.55);

	const styles = useMemo(() => createStyles({ size, colors, ringThickness }), [size, colors]);

	// Continuous glow animation (single driver) when full
	const isFull = p >= 1;
	const glowDriver = useRef(new Animated.Value(0)).current; // 0..1..0 loop

	useEffect(() => {
		if (isFull) {
			glowDriver.setValue(0); // start at 0 (maps to initial state)
			const loop = Animated.loop(
				Animated.sequence([
					Animated.timing(glowDriver, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
					Animated.timing(glowDriver, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
				])
			);
			loop.start();
			return () => { loop.stop(); };
		} else {
			glowDriver.stopAnimation?.();
			glowDriver.setValue(0);
		}
	}, [isFull, glowDriver]);

	// Derived animated values
	const chestScale = glowDriver.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] };
	const glowScale = glowDriver.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] };
	const glowOpacity = glowDriver.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] };

	return (
		<div style={{...styles.container, ...style}}>
			<div style={styles.svgWrapper}>
				<Svg width={size} height={size} style={styles.svg}>
					<Defs>
						<LinearGradient id="chestProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
							<Stop offset="0%" stopColor={baseColor} />
							<Stop offset="100%" stopColor={lighter} />
						</LinearGradient>
					</Defs>
					<Circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke={circleBorder}
						strokeWidth={ringThickness}
						fill="none"
					/>
					<AnimatedCircle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="url(#chestProgressGrad)"
						strokeWidth={ringThickness}
						strokeDasharray={`${circumference} ${circumference}`}
						strokeDashoffset={dashOffset}
						strokeLinecap="round"
						fill="none"
						opacity={1}
						transform={`rotate(-90 ${size / 2} ${size / 2})`}
					/>
				</Svg>
				{ /* Glow layer */ }
				{isFull && (
					<Animated.View
						pointerEvents="none"
						style={[
							styles.glow,
							{
								backgroundColor: baseColor + '55',
								opacity: glowOpacity,
								transform: [{ scale: glowScale }],
								shadowColor: baseColor,
								shadowOpacity: 0.85,
								shadowRadius: size * 0.32,
								shadowOffset: { width: 0, height: 0 },
								elevation: 10,
							},
						]}
					/>
				)}
				<AnimatedImage
					source={chestImage}
					style={[styles.chestImage, { width: size * 0.58, height: size * 0.58, transform: [{ scale: chestScale }] }]}
					style={{objectFit: "contain"}}
				/>
			</div>
		</div>
	);
}

function createStyles({ size, colors, ringThickness }) {
	return StyleSheet.create({
		container: {
			alignItems: 'flex-start',
			justifyContent: 'flex-start',
		},
		svgWrapper: {
			width: size,
			height: size,
			alignItems: 'center',
			justifyContent: 'center',
		},
		svg: { position: 'absolute', top: 0, left: 0 },
		chestImage: {
			zIndex: 1,
		},
		glow: {
			position: 'absolute',
			width: size * 0.9,
			height: size * 0.9,
			borderRadius: (size * 0.9) / 2,
			zIndex: 0,
		},
	};
}
