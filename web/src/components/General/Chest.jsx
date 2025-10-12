import React from 'react';
import { useThemeColors } from '../../services/Theme';

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

export default function Chest({ tier = 'bronze', size = 100, onPress, style }) {
	const colors = useThemeColors();
	const imageSource = getImageForTier(tier);

	const containerStyle = {
		...styles.container,
		width: size,
		height: size,
		...(style || {})
	};

	return (
		<button style={containerStyle} onClick={onPress} aria-label={`Baú ${tier}`}>
			<img src={imageSource} style={styles.image} alt={`Baú ${tier}`} />
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
	image: {
		width: '100%',
		height: '100%',
		objectFit: 'contain',
	},
};
