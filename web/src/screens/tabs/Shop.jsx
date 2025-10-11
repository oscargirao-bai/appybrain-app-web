import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import DataManager from '../../services/DataManager.js';
import NotificationBadge from '../../components/common/NotificationBadge.jsx';
import Coins from '../../components/shop/Coins.jsx';
import Options from '../../components/shop/Options.jsx';
import List from '../../components/shop/List.jsx';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function Shop({ onNavigate }) {
	const colors = useThemeColors();
	const [tab, setTab] = useState('avatar'); // avatar | background | frames
	const [avatars, setAvatars] = useState([]);
	const [backgrounds, setBackgrounds] = useState([]);
	const [frames, setFrames] = useState([]);
	const [userCoins, setUserCoins] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	useEffect(() => {
		const updateData = () => {
			// Get cosmetics by type
			// cosmeticTypeId: 1=avatar, 2=background, 3=frame
			const avatarItems = DataManager.getCosmeticsByType?.(1) || [];
			const backgroundItems = DataManager.getCosmeticsByType?.(2) || [];
			const frameItems = DataManager.getCosmeticsByType?.(3) || [];
			
			setAvatars(avatarItems);
			setBackgrounds(backgroundItems);
			setFrames(frameItems);
			
			// Get user coins
			const userData = DataManager.getUser();
			setUserCoins(userData?.coins || 0);

			const unreadCount = DataManager.getUnreadNotificationsCount?.() || 0;
			setUnreadNotificationsCount(unreadCount);
		};

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, []);

	// Handle cosmetic purchase
	const handlePurchase = async (item) => {
		try {
			await DataManager.purchaseCosmetic?.(item.id);
		} catch (error) {
			console.error('Purchase failed:', error);
		}
	};

	const renderContent = () => {
		switch (tab) {
			case 'avatar':
				return <List data={avatars} userCoins={userCoins} onPurchase={handlePurchase} />;
			case 'background':
				return <List data={backgrounds} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} />;
			case 'frames':
				return <List data={frames} userCoins={userCoins} onPurchase={handlePurchase} />;
			default:
				return null;
		}
	};

	return (
		<div style={{ minHeight: '100vh', backgroundColor: colors.background, color: colors.text }}>
			<div className="page-50" style={{ paddingBottom: '80px' }}>
				{/* Header */}
				<header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
					<div style={{ fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', marginLeft: '-48px' }}>{t('options.shop')}</div>
					<div style={{ display: 'flex', gap: 8, position: 'relative' }}>
						<button onClick={() => setNotificationsOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, position: 'relative' }}>
							<Icon name="bell" size={22} />
							<NotificationBadge count={unreadNotificationsCount} />
						</button>
						<button onClick={() => onNavigate('Settings')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
							<Icon name="settings" size={22} />
						</button>
					</div>
				</header>

				{/* Content */}
				<div style={{ paddingTop: 16 }}>
					<div style={{ paddingLeft: 16, paddingRight: 16 }}>
						<Coins />
					</div>
					<Options value={tab} onChange={setTab} />
					<div style={{ marginTop: 16 }}>
						{renderContent()}
					</div>
				</div>
			</div>

			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}
