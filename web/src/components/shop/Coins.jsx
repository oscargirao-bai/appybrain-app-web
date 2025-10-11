import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../common/Icon.jsx';
import DataManager from '../../services/DataManager.js';

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
		<div style={{
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			border: `2px solid ${colors.primary}AA`,
			paddingLeft: 14,
			paddingRight: 14,
			paddingTop: 8,
			paddingBottom: 8,
			borderRadius: 18,
			alignSelf: 'center',
			backgroundColor: 'transparent',
			...style
		}}>
			<Icon name="coins" size={22} color={colors.primary} style={{ marginRight: 8 }} />
			<span style={{
				fontSize: 18,
				fontWeight: 700,
				color: colors.primary,
				letterSpacing: 0.5
			}}>{coins}</span>
		</div>
	);
}
