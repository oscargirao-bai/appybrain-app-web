import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../services/Theme';
import DataManager from '../services/DataManager';
import Header from '../components/General/Header';
import Icon from '@react-native-vector-icons/lucide';
import Banner from '../components/Profile/Banner';
import Info from '../components/Profile/Info';
import MedalsList from '../components/Profile/MedalsList';
import MedalModal from '../components/Profile/MedalModal';

// TESTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Corrigido caminho relativo para imagem moldura
//import moldura from '../../../testing/moldura.png';

export default function ProfileScreen() {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const route = useRoute();
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedMedal, setSelectedMedal] = useState(null);
	const [userInfo, setUserInfo] = useState(null);
	const [badges, setBadges] = useState([]);
	const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);

	// Check if we're viewing an external user's profile
	const externalUser = route?.params?.externalUser;
	const externalBadges = route?.params?.externalBadges;
	const isExternalProfile = !!externalUser;

	// Get navigation params for badge modal opening
	const { openBadgeModal, highlightChests, timestamp } = route?.params || {};

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

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>      
			<Header
				title={isExternalProfile ? userInfo?.nickname || 'Perfil' : 'Perfil'}
				showBack
				onBack={() => navigation.goBack()}
				extraRight={!isExternalProfile ? (
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Abrir definições"
						onPress={() => navigation.navigate('Settings')}
						style={styles.iconBtn}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
					>
						<Icon name="settings" size={24} color={colors.text} />
					</TouchableOpacity>
				) : null}
			/>
			<ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
				<Banner 
					topFlat={true}
					avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
					bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
					frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
				/>
				<View style={styles.infoWrapper}>
					<Info 
						username={userInfo?.nickname}
						tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
					/>
					<MedalsList 
						medals={badges}
						onMedalPress={handleMedalPress} 
					/>
				</View>
			</ScrollView>
			<MedalModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				medal={selectedMedal}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	scrollContent: { paddingBottom: 40 },
	infoWrapper: { paddingHorizontal: 16, paddingTop: 18 },
	section: { paddingHorizontal: 16, paddingTop: 24 },
	sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 14 },
	statsRow: { flexDirection: 'row', justifyContent: 'space-between' , gap: 12 },
	statCard: { flex: 1, paddingVertical: 16, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
	statNumber: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
	statLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
	body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	text: { fontSize: 32, fontWeight: '700' },
});

