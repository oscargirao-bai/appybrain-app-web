import React, { useRef, useState, useEffect, useCallback } from 'react';
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

export default function ShopScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const scrollRef = useRef(null);
	const [tab, setTab] = useState('avatar'); // avatar | background | frames
	const [avatars, setAvatars] = useState([]);
	const [backgrounds, setBackgrounds] = useState([]);
	const [frames, setFrames] = useState([]);
	const [userCoins, setUserCoins] = useState(0);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const pageWidthRef = useRef(0);
	const rafRef = useRef(null);

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
			const stats = DataManager.getUserStats();
			setUserCoins(stats?.coins || 0);

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

	useEffect(() => {
		function updateMeasurements() {
			if (scrollRef.current) {
				pageWidthRef.current = scrollRef.current.clientWidth;
			}
		}
		updateMeasurements();
		window.addEventListener('resize', updateMeasurements);
		return () => {
			window.removeEventListener('resize', updateMeasurements);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
			}
		};
	}, []);

	const scrollToTab = useCallback((key) => {
		const container = scrollRef.current;
		if (!container) return;
		const pageWidth = pageWidthRef.current || container.clientWidth;
		const index = key === 'avatar' ? 0 : key === 'background' ? 1 : 2;
		container.scrollTo({ left: index * pageWidth, behavior: 'smooth' });
	}, []);

	function onSelect(key) {
		setTab(key);
		scrollToTab(key);
	}

	const handleScroll = useCallback(() => {
		const container = scrollRef.current;
		if (!container) return;
		const pageWidth = pageWidthRef.current || container.clientWidth;
		if (!pageWidth) return;
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(() => {
			const index = Math.round(container.scrollLeft / pageWidth);
			const keys = ['avatar', 'background', 'frames'];
			const next = keys[index] || 'avatar';
			if (next !== tab) {
				setTab(next);
			}
			rafRef.current = null;
		});
	}, [tab]);

	// Handle cosmetic purchase
	const handlePurchase = async (item) => {
		try {
			await DataManager.purchaseCosmetic(item.id);
			const updatedStats = DataManager.getUserStats();
			setUserCoins(updatedStats?.coins || 0);
		} catch (error) {
			const message = error?.message || '';
			if (message.toLowerCase().includes('insufficient')) {
				window.alert(`${translate('shop.insufficientCoinsTitle')}\n\n${translate('shop.insufficientCoinsDescription')}`);
			}
		}
	};

	return (
		<div style={{ ...styles.container, backgroundColor: colors.background }}>		
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
			<div style={styles.optionsRow}>
				<Options value={tab} onChange={onSelect} />
			</div>
			<div
				ref={scrollRef}
				onScroll={handleScroll}
				style={styles.pager}
			>
				<div style={styles.page}>
					<List data={avatars} userCoins={userCoins} numColumns={3} onPurchase={handlePurchase} style={styles.list} />
				</div>
				<div style={styles.page}>
					<List data={backgrounds} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} style={styles.list} />
				</div>
				<div style={styles.page}>
					<List data={frames} userCoins={userCoins} numColumns={2} onPurchase={handlePurchase} style={styles.list} />
				</div>
			</div>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
	topBar: { paddingLeft: 16, paddingRight: 16, paddingTop: 16, display: 'flex', justifyContent: 'center', flexShrink: 0 },
	optionsRow: { paddingLeft: 16, paddingRight: 16, marginTop: 12, display: 'flex', justifyContent: 'center', flexShrink: 0 },
	pager: {
		flex: 1,
		display: 'flex',
		overflowX: 'auto',
		overflowY: 'hidden',
		scrollSnapType: 'x mandatory',
		scrollBehavior: 'smooth',
		minHeight: 0,
	},
	page: {
		flex: '0 0 100%',
		scrollSnapAlign: 'start',
		display: 'flex',
		flexDirection: 'column',
		maxWidth: '100%',
		height: '100%',
		minHeight: 0,
	},
	list: {
		flex: 1,
		display: 'flex',
		minHeight: 0,
	},
};

