import React, { useState, useCallback, useEffect } from 'react';

import { useThemeColors } from '../services/Theme.jsx';
import DataManager from '../services/DataManager.jsx';
import Header from '../components/General/Header.jsx';
import Button2 from '../components/General/Button2.jsx';
import NotificationBadge from '../components/General/NotificationBadge.jsx';
import LucideIcon from '../components/General/LucideIcon.jsx';
import NotificationsModal from '../components/Learn/NotificationsModal.jsx';
import Banner from '../components/Profile/Banner.jsx';
import LearnInfo from '../components/Learn/Info.jsx';
import MedalsList from '../components/Profile/MedalsList.jsx';
import MedalModal from '../components/Profile/MedalModal.jsx';

// TESTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Corrigido caminho relativo para imagem moldura
//import moldura from '../../../testing/moldura.png';

export default function ProfileScreen({ navigation, route }) {
	const colors = useThemeColors();
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedMedal, setSelectedMedal] = useState(null);
	const [userInfo, setUserInfo] = useState(null);
	const [badges, setBadges] = useState([]);
	const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const [notificationsOpen, setNotificationsOpen] = useState(false);

	// Check if we're viewing an external user's profile
	const externalUser = route?.params?.externalUser;
	const externalBadges = route?.params?.externalBadges;
	const isExternalProfile = !!externalUser;

	// Get navigation params for badge modal opening
	const { openBadgeModal, highlightChests, timestamp } = route?.params || {};

	useEffect(() => {
		// keep unread notifications count in sync
		const updateUnread = () => setUnreadNotificationsCount(DataManager.getUnreadNotificationsCount());
		updateUnread();
		const unsub = DataManager.subscribe(updateUnread);
		return unsub;
	}, []);

	useEffect(() => {
		if (isExternalProfile) {
			// Display external user data
			//console.log('ProfileScreen: Displaying external user:', externalUser?.nickname);
			setUserInfo(externalUser);
			
			// Transform external badges data
			if (externalBadges && externalBadges.length > 0) {
				const transformedBadges = externalBadges.map(badge => ({
					id: badge.id,
					icon: badge.icon, // SVG string
					unlocked: badge.currentLevel > 0, // Badge is unlocked if current level > 0
					new: false, // You can add logic here for newly unlocked badges
					title: badge.name,
					description: badge.description,
					level: badge.currentLevel,
					current: badge.currentCounter,
					target: badge.requiredOccurrences,
					hideLevel: badge.maxLevels === 1,
					code: badge.code,
					color: badge.color,
					iconColor: badge.iconColor,
					currentWins: badge.currentWins,
					maxLevels: badge.maxLevels,
					nextLevel: badge.nextLevel,
					nextLevelCoins: badge.nextLevelCoins
				}));
				//console.log('ProfileScreen: Transformed external badges:', transformedBadges.length, 'badges');
				setBadges(transformedBadges);
			} else {
				//console.log('ProfileScreen: No external badges data available');
				setBadges([]);
			}
		} else {
			// Display current user data
			const updateData = () => {
				const userData = DataManager.getUser();
				const badgesData = DataManager.getUserBadges(); // Use getUserBadges() instead of getBadges()
				
				//console.log('ProfileScreen: Updating data - userInfo:', !!userData, 'badges count:', badgesData?.length || 0);
				setUserInfo(userData);
				
				// Transform badges data to format expected by MedalsList
				if (badgesData && badgesData.length > 0) {
					const transformedBadges = badgesData.map(badge => ({
						id: badge.id,
						icon: badge.icon, // SVG string
						unlocked: badge.currentLevel > 0, // Badge is unlocked if current level > 0
						new: false, // You can add logic here for newly unlocked badges
						title: badge.name,
						description: badge.description,
						level: badge.currentLevel,
						current: badge.currentCounter,
						target: badge.requiredOccurrences,
						hideLevel: badge.maxLevels === 1,
						code: badge.code,
						color: badge.color,
						iconColor: badge.iconColor,
						currentWins: badge.currentWins,
						maxLevels: badge.maxLevels,
						nextLevel: badge.nextLevel,
						nextLevelCoins: badge.nextLevelCoins
					}));
					//console.log('ProfileScreen: Transformed badges:', transformedBadges.length, 'badges');
					setBadges(transformedBadges);
				} else {
					//console.log('ProfileScreen: No badges data available');
					setBadges([]);
				}
			};

			// Initial load
			updateData();

			// Subscribe to DataManager changes
			const unsubscribe = DataManager.subscribe(updateData);

			// Cleanup subscription
			return unsubscribe;
		}
	}, [isExternalProfile, externalUser, externalBadges]);

	const handleMedalPress = useCallback((medal) => {
		// Example mapping for progress (placeholder). In real case, progress should come from medal object.
		setSelectedMedal({
			id: medal.id,
			icon: medal.icon,
			title: medal.title,
			description: medal.description,
			level: medal.level,
			current: medal.current,
			target: medal.target,
			unlocked: medal.unlocked,
			hideLevel: medal.hideLevel,
		});
		setModalVisible(true);
	}, []);

	// Handle opening badge modal from navigation params
	useEffect(() => {
		// Only process if we have a new timestamp (avoid processing the same navigation twice)
		if (openBadgeModal && timestamp && timestamp !== lastProcessedTimestamp && badges.length > 0) {
			// Add a delay to wait for screen transition animation to complete
			setTimeout(() => {
				// Try both string and number comparison for badge ID
				const targetBadge = badges.find(badge => 
					badge.id === openBadgeModal || 
					badge.id === String(openBadgeModal) || 
					String(badge.id) === String(openBadgeModal)
				);
				if (targetBadge) {
					handleMedalPress(targetBadge);
					setLastProcessedTimestamp(timestamp);
				} else {
					setLastProcessedTimestamp(timestamp);
				}

				// Clear the navigation parameters to prevent reopening on subsequent visits
				navigation.setParams({ openBadgeModal: undefined, highlightChests: undefined, timestamp: undefined });
			}, 800); // 800ms delay to wait for screen transition to complete
		}
	}, [openBadgeModal, badges, handleMedalPress, timestamp, lastProcessedTimestamp, navigation]);

	return (
		<div style={{...styles.container, ...{ backgroundColor: colors.background }}}>      
			<Header
				title={isExternalProfile ? userInfo?.nickname || 'Perfil' : 'Perfil'}
				showBack
				onBack={() => {
					// If we came from Learn tab, force return to Learn
					const cameFromLearn = window?.__lastMainTab === 0;
					if (cameFromLearn) {
						navigation.replace('MainTabs', { initialTab: 0 });
					} else {
						navigation.goBack();
					}
				}}
					style={{ paddingRight: 10 }}
				right={!isExternalProfile ? (
					<div style={{ position: 'relative' }}>
						<Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				) : null}
				extraRight={!isExternalProfile ? (
					<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />
				) : null}
			/>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
			<div style={{...styles.scrollContent, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
				<Banner 
					topFlat={true}
					avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
					bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
					frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
				/>
				<div style={styles.infoWrapper}>
					<LearnInfo 
						username={userInfo?.nickname}
						tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
						stars={userInfo?.stars ?? 0}
						trophies={userInfo?.points ?? 0}
						coins={userInfo?.coins ?? 0}
					/>
					<MedalsList 
						medals={badges}
						onMedalPress={handleMedalPress} 
					/>
				</div>
			</div>
			<MedalModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				medal={selectedMedal}
			/>
		</div>
	);
}

const styles = {
	container: { flex: 1 },
	scrollContent: { paddingBottom: 40 },
	infoWrapper: { paddingLeft: 0, paddingRight: 0, paddingTop: 0 },
	section: { paddingLeft: 16, paddingRight: 16, paddingTop: 24 },
	sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
	statsRow: { flexDirection: 'row', justifyContent: 'space-between' , gap: 12 },
	statCard: { flex: 1, paddingTop: 16, paddingBottom: 16, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
	statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
	statLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
	body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { fontSize: 32, fontWeight: '700' },
};

