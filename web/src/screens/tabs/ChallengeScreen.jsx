import React, { useState, useEffect } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../../services/Theme';
import DataManager from '../../services/DataManager';
import ApiManager from '../../services/ApiManager';
import Banner from '../../components/Profile/Banner';
import Info from '../../components/Learn/Info';
import ChallengeList from '../../components/ChallengeComponents/ChallengeList';
import Button2 from '../../components/General/Button2';
// Removed Learn button and Subjects list
// Chest removed from Challenge screen
import NotificationsModal from '../../components/Learn/NotificationsModal';
import RankingsModal from '../../components/Learn/RankingsModal';
import ConfirmModal from '../../components/General/ConfirmModal';
import Header from '../../components/General/Header';
import NotificationBadge from '../../components/General/NotificationBadge';
import Icon from '@react-native-vector-icons/lucide';
// import ChestRewardModal removed
// (Content list removido ao retirar multi-part)

// TESTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Corrigido caminho relativo: de '../../testing' (inexistente em src/) para '../../../testing'
//import moldura from '../../../testing/moldura.png';

export default function ChallengeScreen(props) {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [rankingsOpen, setRankingsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	// const [chestRewardOpen, setChestRewardOpen] = useState(false); // removed
	const [userInfo, setUserInfo] = useState(null);
	const [challenges, setChallenges] = useState([]);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedChallenge, setSelectedChallenge] = useState(null);
	// const [disciplines, setDisciplines] = useState([]); // removed subjects

	useEffect(() => {
		const updateData = () => {
			const userData = DataManager.getUser();
			setUserInfo(userData);

			// Load challenges from DataManager
			const challengesData = DataManager.getAvailableChallenges();
			setChallenges(challengesData);

			const unreadCount = DataManager.getUnreadNotificationsCount();
			setUnreadNotificationsCount(unreadCount);
		});

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, []);
	// Multi-part removido – mostrar apenas o overview (Chest + Subject)
	// Let Chest component handle its own data from API
	return (
		<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>
			<Header
				title="Desafios"
				right={(
					<div style={{ position: 'relative' }}>
						<button 							
							aria-label="Notificações"
							onClick={() => setNotificationsOpen(true)}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							style={{ paddingHorizontal: 4 }}
						>
							<Icon name="bell" size={22} color={colors.text} />
						</button>
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(
					<button 						
						aria-label="Abrir definições"
						onClick={() => navigation.navigate('Settings')}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ paddingHorizontal: 4 }}
					>
						<Icon name="settings" size={22} color={colors.text} />
					</button>
				)}
			/>
			<div style={styles.content}>
				<div style={styles.headerSection}>
					<div style={styles.fullBleed}>
					<Banner 
						topFlat={true} 
						avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
						bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
						frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
					/>
					</div>
					<div style={styles.fullBleed}>
					<Info
						username={userInfo?.nickname}
						tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
						coins={userInfo?.coins ?? 0}
					/>
					</div>
					<div style={styles.buttonsRow}>
						<Button2
							size={54}
							iconName="medal"
							onClick={() => setRankingsOpen(true)}
							style={styles.buttonSpacing}
						/>
					</div>
				</div>
				{/* Challenges section */}
				<ChallengeList
					items={challenges}
					showHeader={false}
					onPressItem={(item) => {
						setSelectedChallenge(item);
						setConfirmOpen(true);
					}}
				/>
			</div>
			{/* Confirm start challenge */}
			<ConfirmModal
				visible={confirmOpen}
				message={`Queres começar o desafio "${selectedChallenge?.title || ''}"?`}
				onCancel={() => {
					setConfirmOpen(false);
					setSelectedChallenge(null);
				}}
				onConfirm={() => {
					setConfirmOpen(false);
					if (selectedChallenge) {
						// Navigate directly to quiz with challengeId - no API call needed
						navigation.navigate('Quizz', { challengeId: selectedChallenge.id });
					}
					setSelectedChallenge(null);
				}}
				confirmLabel="Continuar"
				cancelLabel="Cancelar"
			/>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
			<RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
			{/* ChestRewardModal removed */}
		</div>
	);
}

const styles = {
	safe: { flex: 1 },
	content: { flex: 1, paddingHorizontal: 10 },
	headerSection: {
		width: '100%',
		marginBottom: 8,
	},
	sectionTitleWrap: { paddingHorizontal: 6 },
	sectionTitleRow: { flexDirection: 'column' },
	inlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
	sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 1.2, color: '#F05454' },
	sectionUnderline: { height: 2, width: 96, borderRadius: 2, backgroundColor: '#F05454', marginTop: 2 },
	middleSection: {
		// removed
	},
	bottomSection: {
		// removed
	},
	buttonsRow: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 4,
	},
	actionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 4,
	},
	buttonSpacing: {
		marginLeft: 12,
	},
	fullBleed: {
		marginHorizontal: -10,
		width: 'auto',
	},
	// chestPressable removed
	// learnButtonWrap removed
	subjectsRow: {
		// removed
	},
	subjectItem: {},
};

