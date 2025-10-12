import React, { useRef, useState, useEffect } from 'react';

// Mock React Native navigation hook for web
const useNavigation = () => ({ navigate: () => {}, goBack: () => {}, replace: () => {} });

import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import Coins from '../../components/Shop/Coins.jsx';
import Options from '../../components/Shop/Options.jsx';
import List from '../../components/Shop/List.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import SvgIcon from '../../components/General/SvgIcon.jsx';

export default function ShopScreen(props) {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const { translate } = useTranslate();
	const width = window.innerWidth; const height = window.innerHeight;
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
		const index = key === 'avatar' ? 0 : key === 'background' ? 1 : 2;
		scrollRef.current?.scrollTo({ x: index * width, animated: true });
	}

	function handleMomentumEnd(e) {
		const idx = Math.round(e.nativeEvent.contentOffset.x / width);
		const key = idx === 0 ? 'avatar' : idx === 1 ? 'background' : 'frames';
		if (key !== tab) setTab(key);
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
				right={(
					<div style={{ position: 'relative' }}>
						<button 							
							aria-label={translate('options.notification')}
							onClick={() => setNotificationsOpen(true)}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							style={{ paddingHorizontal: 4 }}
						>
							<SvgIcon name="bell" size={22} color={colors.text} />
						</button>
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(
					<button 						
						aria-label={translate('settings.settings')}
						onClick={() => navigation.navigate('Settings')}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ paddingHorizontal: 4 }}
					>
						<SvgIcon name="settings" size={22} color={colors.text} />
					</button>
				)}
			/>
			<div style={styles.topBar}>
				<Coins />
			</div>
			<Options value={tab} onChange={onSelect} />
			<div 				horizontal
				pagingEnabled
				ref={scrollRef}
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handleMomentumEnd}
				style={{}}
			>
				<div style={{ width }}>
					<List data={avatars} scrollEnabled={true} userCoins={userCoins} onPurchase={handlePurchase} />
				</div>
				<div style={{ width }}>
					<List data={backgrounds} scrollEnabled={true} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} />
				</div>
				<div style={{ width }}>
					<List data={frames} scrollEnabled={true} userCoins={userCoins} onPurchase={handlePurchase} />
				</div>
			</div>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: { flex: 1 },
	topBar: { paddingHorizontal: 16, paddingTop: 16 },
	scrollContent: { },
};

