import React, { useRef, useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import Button2 from '../../components/General/Button2.jsx';
import Coins from '../../components/Shop/Coins.jsx';
import Options from '../../components/Shop/Options.jsx';
import List from '../../components/Shop/List.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import LucideIcon from '../../components/General/LucideIcon.jsx';

export default function ShopScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth;
	const height = window.innerHeight;
	const scrollRef = useRef(null);
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
			const avatarItems = DataManager.getCosmeticsByType(1);
			const backgroundItems = DataManager.getCosmeticsByType(2);
			const frameItems = DataManager.getCosmeticsByType(3);
			
			setAvatars(avatarItems);
			setBackgrounds(backgroundItems);
			setFrames(frameItems);
			
			// Get user coins
			const userData = DataManager.getUser();
			setUserCoins(userData?.coins || 0);

			const unreadCount = DataManager.getUnreadNotificationsCount();
			setUnreadNotificationsCount(unreadCount);
		};

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, []);

	function onSelect(key) {
		setTab(key);
	}

	// Handle cosmetic purchase
	const handlePurchase = async (item) => {
		try {
			await DataManager.purchaseCosmetic(item.id);
			//console.log('Cosmetic purchased successfully:', item.id);
		} catch (error) {
			console.error('Purchase failed:', error);
			// You could show an error message to the user here
			// For now, just log the error - the optimistic update will be reverted
		}
	};

	return (
		<div style={{...styles.container, ...{ backgroundColor: colors.background }}}>      
			<Header 
				title={translate('options.shop')}
				style={{ paddingRight: 10 }}
				right={(
					<div style={{ position: 'relative' }}>
						<Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />)}
			/>
			<div style={styles.topBar}>
				<Coins />
			</div>
			<Options value={tab} onChange={onSelect} />
			<div style={styles.contentArea}>
				{tab === 'avatar' && (
					<List data={avatars} userCoins={userCoins} numColumns={3} onPurchase={handlePurchase} />
				)}
				{tab === 'background' && (
					<List data={backgrounds} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} />
				)}
				{tab === 'frames' && (
					<List data={frames} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} />
				)}
			</div>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: { flex: 1, display: 'flex', flexDirection: 'column' },
	topBar: { paddingLeft: 16, paddingRight: 16, paddingTop: 16, display: 'flex', justifyContent: 'center' },
	contentArea: { flex: 1, overflowY: 'auto' },
	scrollContent: { },
};

