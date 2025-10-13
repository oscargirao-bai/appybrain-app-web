import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.jsx';

function getImageForTier(tier) {
	switch (tier?.toLowerCase()) {
		case 'bronze':
			return '/assets/chests/chest-bronze.png';
		case 'silver':
			return '/assets/chests/chest-silver.png';
		case 'gold':
			return '/assets/chests/chest-gold.png';
		case 'epic':
			return '/assets/chests/chest-epic.png';
		default:
			return '/assets/chests/chest-bronze.png';
	}
}

// Chest with circular progress around the image
// Props:
// - dataSource: 'stars' | 'points' (default 'stars')
// - size: number (outer diameter)
// - onPress: click handler
// - style: extra styles for wrapper
export default function Chest({ dataSource = 'stars', size = 86, onPress, style }) {
	const colors = useThemeColors();

	// Read chest data from DataManager
	const chestData = DataManager.getUserChests();
	const sourceData = dataSource === 'points' ? chestData?.points : chestData?.stars;

	const { imageSrc, progress, hasAvailable } = useMemo(() => {
		// Determine available chests
		const available = sourceData?.chests?.filter(c => c.openedAt === null) || [];
		const hasAvailable = available.length > 0;

		// Determine chest image type
		let chestType;
		if (hasAvailable) {
			chestType = available[0]?.chestType || 'bronze';
		} else {
			chestType = sourceData?.nextChestType || 'bronze';
		}
		const imageSrc = getImageForTier(chestType);

		// Compute progress
		let p = 0;
		if (hasAvailable) {
			p = 1; // full ring when an unopened chest exists
		} else {
			const currentValue = sourceData?.current ?? 0;
			const targetValue = sourceData?.nextThreshold ?? 10;

			// Find last earned chest to get starting milestone
			const earned = sourceData?.chests?.filter(c => c.grantedAt) || [];
			const lastEarned = earned.length > 0
				? earned.reduce((latest, c) => (new Date(c.grantedAt) > new Date(latest.grantedAt) ? c : latest))
				: null;
			const startMilestone = lastEarned?.milestone || 0;
			const range = targetValue - startMilestone;
			const current = currentValue - startMilestone;
			p = range > 0 ? (current / range) : 0;
		}
		p = Math.max(0, Math.min(1, p));

		return { imageSrc, progress: p, hasAvailable };
	}, [sourceData]);

	// Ring geometry
	const ringThickness = 8;
	const radius = (size - ringThickness) / 2; // stroke radius
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - progress);

	const circleBorder = colors.text + '33';
	const baseColor = colors.secondary;

	// Small lighten
	const lighten = (hex, amount = 0.55) => {
		if (!hex || typeof hex !== 'string') return hex;
		const raw = hex.replace('#','');
		if (raw.length !== 6) return hex;
		const num = parseInt(raw,16);
		const r = (num >> 16) & 0xff;
		const g = (num >> 8) & 0xff;
		const b = num & 0xff;
		const nr = Math.round(r + (255 - r) * amount);
		const ng = Math.round(g + (255 - g) * amount);
		const nb = Math.round(b + (255 - b) * amount);
		const toHex = v => v.toString(16).padStart(2,'0');
		return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
	};
	const lighter = lighten(baseColor, 0.55);

	const containerStyle = {
		...styles.container,
		width: size,
		height: size,
		...(style || {})
	};

	return (
		<button style={containerStyle} onClick={onPress} aria-label={`Baú ${dataSource}`}>
			{/* SVG ring */}
			<svg width={size} height={size} style={styles.svg}>
				<defs>
					<linearGradient id="chestProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor={baseColor} />
						<stop offset="100%" stopColor={lighter} />
					</linearGradient>
				</defs>
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					stroke={circleBorder}
					strokeWidth={ringThickness}
					fill="none"
				/>
				{/* Progress ring (rotated to start at top) */}
				<g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="url(#chestProgressGrad)"
						strokeWidth={ringThickness}
						strokeDasharray={`${circumference} ${circumference}`}
						strokeDashoffset={dashOffset}
						strokeLinecap="round"
						fill="none"
					/>
				</g>
			</svg>
			{/* Chest image in center */}
			<img src={imageSrc} style={{ ...styles.image, width: size * 0.58, height: size * 0.58, animation: hasAvailable ? 'chest-pulse 1.6s ease-in-out infinite' : 'none' }} alt="Baú" />
		</button>
	);
}

const styles = {
	container: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		padding: 0,
	},
	svg: { position: 'absolute', top: 0, left: 0 },
	image: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
	},
};
