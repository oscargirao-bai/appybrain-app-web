import React, { useState, useEffect } from 'react';

import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import DataManager from '../../services/DataManager';

// Simple coins pill that displays current user coins from DataManager
export default function Coins({ style }) {
	const colors = useThemeColors();
	const [coins, setCoins] = useState(0);

	useEffect(() => {
		const updateCoins = () => {
			const userData = DataManager.getUser();
			setCoins(userData?.coins || 0);
		};

		// Initial load
		updateCoins();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateCoins);

		// Cleanup subscription
		return unsubscribe;
	}, []);

	return (
		<div style={{...styles.wrap, ...{ borderColor: colors.primary + 'AA' }}}>
			<Icon name="coins" size={22} color={colors.primary} style={{ marginRight: 8 }} />
			<span style={{...styles.value, ...{ color: colors.primary }}}>{coins}</span>
		</div>
	);
}

const styles = {
	wrap: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 18,
		alignSelf: 'center',
		backgroundColor: 'transparent',
	},
	value: {
		fontSize: 18,
		fontWeight: '700',
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
};

