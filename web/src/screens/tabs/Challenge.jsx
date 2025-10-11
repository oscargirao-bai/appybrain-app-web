import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.js';
import Banner from '../../components/profile/Banner.jsx';
import Info from '../../components/learn/Info.jsx';
import ChallengeList from '../../components/challenge/ChallengeList.jsx';
import Button2 from '../../components/common/Button2.jsx';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import RankingsModal from '../../components/learn/RankingsModal.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import NotificationBadge from '../../components/common/NotificationBadge.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function Challenge({ onNavigate }) {
	const colors = useThemeColors();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [rankingsOpen, setRankingsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const [userInfo, setUserInfo] = useState(null);
	const [challenges, setChallenges] = useState([]);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedChallenge, setSelectedChallenge] = useState(null);

	useEffect(() => {
		const updateData = () => {
			const userData = DataManager.getUser();
			setUserInfo(userData);

			// Load challenges from DataManager
			const challengesData = DataManager.getAvailableChallenges?.() || [];
			setChallenges(challengesData);

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

	return (
		<div style={{ minHeight: '100vh', backgroundColor: colors.background, color: colors.text }}>
			<div className="page-50" style={{ paddingBottom: '80px' }}>
				{/* Header */}
				<header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
					<div style={{ fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', marginLeft: '-48px' }}>Desafios</div>
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
				<div style={{ padding: '0 10px' }}>
					<div style={{ marginBottom: 8 }}>
						<Banner 
							topFlat={true} 
							avatarUrl={userInfo?.avatarUrl}
							backgroundUrl={userInfo?.backgroundUrl}
							frameUrl={userInfo?.frameUrl}
						/>
						<Info
							username={userInfo?.nickname}
							tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
							coins={userInfo?.coins ?? 0}
						/>
						<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, marginBottom: 4 }}>
							<Button2
								size={54}
								icon="medal"
								onPress={() => setRankingsOpen(true)}
								style={{ marginLeft: 12 }}
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
						onNavigate('Quizz', { challengeId: selectedChallenge.id });
					}
					setSelectedChallenge(null);
				}}
				confirmLabel="Continuar"
				cancelLabel="Cancelar"
			/>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
			<RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
		</div>
	);
}
