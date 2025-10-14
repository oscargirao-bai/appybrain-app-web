import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import Banner from '../../components/Profile/Banner.jsx';
import Info from '../../components/Learn/Info.jsx';
import ChallengeList from '../../components/ChallengeComponents/ChallengeList.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import RankingsModal from '../../components/Learn/RankingsModal.jsx';
import ConfirmModal from '../../components/General/ConfirmModal.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import Button2 from '../../components/General/Button2.jsx';

export default function ChallengeScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
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
		};

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
				title={translate('titles.challenge')}
				style={{ paddingRight: 10 }}
				right={(
					<div style={{ position: 'relative' }}>
						<Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />)}
			/>
			<div style={styles.content}>
				<div style={styles.headerSection}>
					<div style={{ ...styles.fullBleed, ...styles.bannerSection }}>
						<Banner 
							topFlat={true} 
							avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
							bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
							frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
						/>
					</div>
					<div style={{ ...styles.fullBleed, ...styles.infoSection }}>
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
				<div style={styles.listArea}>
					<ChallengeList
						items={challenges}
						showHeader={false}
						onPressItem={(item) => {
							setSelectedChallenge(item);
							setConfirmOpen(true);
						}}
					/>
				</div>
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
	safe: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
	content: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		minHeight: 0,
		paddingBottom: 20,
		overflow: 'hidden',
	},
	headerSection: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: 0,
		flexShrink: 0,
	},
	sectionTitleWrap: { paddingLeft: 6, paddingRight: 6 },
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
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
		marginTop: 0,
		marginBottom: 0,
		paddingLeft: 10,
		paddingRight: 10,
		boxSizing: 'border-box',
	},
	actionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 4,
	},
	listArea: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 0,
		overflowX: 'hidden',
		overflowY: 'auto',
		paddingTop: 12,
		paddingLeft: 10,
		paddingRight: 10,
		boxSizing: 'border-box',
	},
	bannerSection: {
		width: '100%',
		overflow: 'hidden',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 0,
		marginBottom: 0,
	},
	infoSection: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		marginTop: 0,
	},
	fullBleed: {
		marginLeft: -10,
		marginRight: -10,
		width: 'auto',
	},
	// chestPressable removed
	// learnButtonWrap removed
	subjectsRow: {
		// removed
	},
	subjectItem: {},
	buttonSpacing: {
		marginLeft: 12,
	},
};

