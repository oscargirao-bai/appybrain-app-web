import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LucideIcon from '../../components/General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import TribesHeader from '../../components/Tribes/Header.jsx';
import TribeInfo from '../../components/Tribes/Info.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import Button2 from '../../components/General/Button2.jsx';

export default function TribeScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [userTribe, setUserTribe] = useState(null);
	const [allTribes, setAllTribes] = useState([]);
	const [isInTribe, setIsInTribe] = useState(false);
	const [selectedTribe, setSelectedTribe] = useState(null);
	const [tribeMembers, setTribeMembers] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [joiningTribe, setJoiningTribe] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const [animateMembers, setAnimateMembers] = useState(false);

	useEffect(() => {
		const currentTribe = DataManager.getUserTribe();
		setUserTribe(currentTribe);

		const inTribe = DataManager.isInTribe();
		setIsInTribe(inTribe);

		const tribes = DataManager.getTribes();
		setAllTribes(tribes);

		let initialTribe = null;
		if (inTribe && currentTribe) {
			initialTribe = currentTribe;
		} else if (tribes.length > 0) {
			initialTribe = tribes[0];
		}

		if (initialTribe) {
			setSelectedTribe(initialTribe);
			fetchTribeMembers(initialTribe.id);
		}
	}, []);

	useEffect(() => {
		const updateNotificationsData = () => {
			const unreadCount = DataManager.getUnreadNotificationsCount();
			setUnreadNotificationsCount(unreadCount);
		};

		updateNotificationsData();
		const unsubscribe = DataManager.subscribe(updateNotificationsData);
		return unsubscribe;
	}, []);

	useEffect(() => {
		if (!tribeMembers.length) {
			setAnimateMembers(false);
			return undefined;
		}
		setAnimateMembers(false);
		const timer = setTimeout(() => setAnimateMembers(true), 60);
		return () => clearTimeout(timer);
	}, [tribeMembers]);

	const handleSelect = (tribe) => {
		setSelectedTribe(tribe);
		fetchTribeMembers(tribe.id);
	};

	const fetchTribeMembers = async (tribeId) => {
		if (!tribeId) return;

		try {
			setLoadingMembers(true);
			setAnimateMembers(false);
			setTribeMembers([]);

			const response = await ApiManager.getTribeMembers(tribeId);
			const members = response.members || response.users || response || [];

			const sortedMembers = members.sort((a, b) => {
				const nameA = (a.name || a.firstName || '').toLowerCase();
				const nameB = (b.name || b.firstName || '').toLowerCase();
				return nameA.localeCompare(nameB);
			});

			setTribeMembers(sortedMembers);
		} catch (error) {
			console.error('Failed to fetch tribe members:', error);
			setTribeMembers([]);
		} finally {
			setLoadingMembers(false);
		}
	};

	const handleJoinTribe = async () => {
		if (!selectedTribe || joiningTribe) return;

		try {
			setJoiningTribe(true);
			await ApiManager.joinTribe(selectedTribe.id);
			DataManager.updateUserTribeMembership(selectedTribe.id, true);
			setUserTribe(selectedTribe);
			setIsInTribe(true);
			await fetchTribeMembers(selectedTribe.id);
		} catch (error) {
			console.error('Failed to join tribe:', error);
		} finally {
			setJoiningTribe(false);
		}
	};

	const handleLeaveTribe = async () => {
		if (!selectedTribe || joiningTribe) return;

		try {
			setJoiningTribe(true);
			await ApiManager.leaveTribe();
			DataManager.updateUserTribeMembership(selectedTribe.id, false);
			setUserTribe(null);
			setIsInTribe(false);
			await fetchTribeMembers(selectedTribe.id);
		} catch (error) {
			console.error('Failed to leave tribe:', error);
		} finally {
			setJoiningTribe(false);
		}
	};

	const MemberList = ({ members, currentUserId }) => {
		const themeColors = useThemeColors();

		const ranked = useMemo(() => {
			const sorted = [...members].sort((a, b) => (b.stars || 0) - (a.stars || 0));
			let lastStars = null;
			let lastRank = 0;
			let processed = 0;
			return sorted.map((user) => {
				processed += 1;
				const stars = user.stars || 0;
				let rank;
				if (lastStars === null) {
					rank = 1;
				} else if (stars === lastStars) {
					rank = lastRank;
				} else {
					rank = processed;
				}
				lastStars = stars;
				lastRank = rank;
				return { ...user, rank };
			});
		}, [members]);

		if (ranked.length === 0) {
			return (
				<div
					style={{
						...memberListStyles.emptyWrapper,
						borderColor: themeColors.text + '22',
						backgroundColor: themeColors.text + '05',
					}}
				>
					<span style={{ color: themeColors.text + '99', fontSize: 14 }}>
						{loadingMembers ? '' : 'Sem membros nesta tribo'}
					</span>
				</div>
			);
		}

		return (
			<div style={memberListStyles.list}>
				<div style={memberListStyles.contentContainer}>
					{ranked.map((item, index) => {
						const isSelf = item.id === currentUserId;
						const topMedal = item.rank <= 3;
						const medalIcon = item.rank === 1 ? 'crown' : item.rank === 2 ? 'award' : 'award';
						const medalColor = item.rank === 1 ? themeColors.accent : item.rank === 2 ? themeColors.primary : themeColors.primary;
						const delay = animateMembers ? `${index * 0.1}s` : '0s';

						return (
							<div
								key={`user-${item.id || index}-${item.email || ''}-${index}`}
								style={{
									...memberListStyles.row,
									backgroundColor: isSelf ? themeColors.accent + '22' : themeColors.text + '08',
									borderColor: themeColors.text + '15',
									transform: animateMembers ? 'translateY(0)' : 'translateY(30px)',
									opacity: animateMembers ? 1 : 0,
									transition: 'transform 0.4s ease, opacity 0.4s ease',
									transitionDelay: delay,
								}}
							>
								<div style={memberListStyles.rankCol}>
									{topMedal ? (
										<LucideIcon name={medalIcon} size={22} color={medalColor} />
									) : (
										<span style={{ ...memberListStyles.rankText, color: themeColors.text + 'AA' }}>{item.rank}</span>
									)}
								</div>
								<div
									style={{
										...memberListStyles.avatar,
										borderColor: themeColors.primary + '66',
									}}
								>
									{item.avatarIcon ? (
										<LucideIcon name={item.avatarIcon} size={20} color={themeColors.primary} />
									) : (
										<span style={{ ...memberListStyles.avatarLetter, color: themeColors.primary }}>
											{(item.name || '?').charAt(0).toUpperCase()}
										</span>
									)}
								</div>
								<div style={memberListStyles.mainCol}>
									<span
										style={{
											...memberListStyles.name,
											color: themeColors.text,
											display: '-webkit-box',
											WebkitLineClamp: 1,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{item.name}
									</span>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div style={{ ...styles.container, backgroundColor: colors.background }}>
			<Header
				title={translate('titles.tribes')}
				style={{ paddingRight: 10 }}
				right={(
					<div style={{ position: 'relative' }}>
						<Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />)}
			/>
			<TribesHeader
				onSelect={handleSelect}
				allTribes={allTribes}
				userTribe={userTribe}
				isInTribe={isInTribe}
			/>
			<TribeInfo
				name={selectedTribe?.name}
				description={selectedTribe?.description}
				members={tribeMembers.length}
				joined={Boolean(isInTribe && selectedTribe && userTribe && selectedTribe.id === userTribe.id)}
				accentColor={selectedTribe?.color}
				iconColor={selectedTribe?.iconColor}
				icon={selectedTribe?.icon}
				tribeIconName="users"
				onJoin={handleJoinTribe}
				onLeave={handleLeaveTribe}
				disabledJoin={joiningTribe || (isInTribe && selectedTribe && userTribe && selectedTribe.id !== userTribe.id)}
			/>
			<MemberList members={tribeMembers} currentUserId={DataManager.getUser()?.id} />
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 0,
		overflow: 'hidden',
	},
};

const memberListStyles = {
	list: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 0,
		marginTop: 16,
		overflowY: 'auto',
	},
	contentContainer: {
		display: 'flex',
		flexDirection: 'column',
		paddingLeft: 8,
		paddingRight: 8,
		paddingBottom: 24,
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 10,
		paddingRight: 10,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 14,
		marginTop: 10,
	},
	rankCol: {
		width: 34,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	rankText: {
		fontSize: 16,
		fontWeight: '800',
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 12,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	avatarLetter: {
		fontSize: 18,
		fontWeight: '700',
	},
	mainCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		marginRight: 10,
	},
	name: {
		fontSize: 15,
		fontWeight: '700',
	},
	emptyWrapper: {
		marginTop: 16,
		marginLeft: 16,
		marginRight: 16,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 16,
		padding: 24,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
};
