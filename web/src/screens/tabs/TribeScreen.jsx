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

export default function TribeScreen({ sourceId, timestamp, navigation }) {
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

	useEffect(() => {
		// Get user's current tribe
		const currentTribe = DataManager.getUserTribe();
		setUserTribe(currentTribe);
		
		// Check if user is in a tribe
		const inTribe = DataManager.isInTribe();
		setIsInTribe(inTribe);
		
		// Get ALL tribes (both user's tribe and available tribes)
		const tribes = DataManager.getTribes();
		setAllTribes(tribes);
		
		// Set initial selected tribe (user's tribe if they have one, otherwise first available)
		let initialTribe = null;
		if (inTribe && currentTribe) {
			initialTribe = currentTribe;
		} else if (tribes.length > 0) {
			initialTribe = tribes[0];
		}
		
		if (initialTribe) {
			setSelectedTribe(initialTribe);
			// Fetch members for the initial selected tribe
			fetchTribeMembers(initialTribe.id);
		}
		
	}, []);

	// Separate useEffect for DataManager subscriptions (notifications count)
	useEffect(() => {
		const updateNotificationsData = () => {
			const unreadCount = DataManager.getUnreadNotificationsCount();
			setUnreadNotificationsCount(unreadCount);
		};

		// Initial load
		updateNotificationsData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateNotificationsData);

		// Cleanup subscription
		return unsubscribe;
	}, []);

	const handleSelect = (tribe) => {
		// Update selected tribe when user selects from header
		setSelectedTribe(tribe);
		
		// Fetch members for the selected tribe
		fetchTribeMembers(tribe.id);
	};

	const fetchTribeMembers = async (tribeId) => {
		if (!tribeId) return;
		
		try {
			// Clear previous tribe members immediately
			setTribeMembers([]);
			setLoadingMembers(true);
			
			const response = await ApiManager.getTribeMembers(tribeId);
			
			// Transform API response to format expected by UserList component
			const members = response.members || response.users || response || [];
			
			// Sort members alphabetically by name
			const sortedMembers = members.sort((a, b) => {
				const nameA = (a.name || a.firstName || '').toLowerCase();
				const nameB = (b.name || b.firstName || '').toLowerCase();
				return nameA.localeCompare(nameB);
			});
			
			setTribeMembers(sortedMembers);
			
		} catch (error) {
			console.error('Failed to fetch tribe members:', error);
			setTribeMembers([]); // Clear members on error
		} finally {
			setLoadingMembers(false);
		}
	};

	const handleJoinTribe = async () => {
		if (!selectedTribe || joiningTribe) return;

		try {
			setJoiningTribe(true);
			
			const response = await ApiManager.joinTribe(selectedTribe.id);
			
			// Update DataManager with new tribe membership
			DataManager.updateUserTribeMembership(selectedTribe.id, true);
			
			// Update local state
			setUserTribe(selectedTribe);
			setIsInTribe(true);
			
			// Refresh the member list to include the current user
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
			
			const response = await ApiManager.leaveTribe();
			
			// Update DataManager with removed tribe membership
			DataManager.updateUserTribeMembership(selectedTribe.id, false);
			
			// Update local state
			setUserTribe(null);
			setIsInTribe(false);
			
			// Refresh the member list to remove the current user
			await fetchTribeMembers(selectedTribe.id);
			
		} catch (error) {
			console.error('Failed to leave tribe:', error);
		} finally {
			setJoiningTribe(false);
		}
	};

	// Custom member list component (web version without animations)
	const MemberList = ({ members, currentUserId }) => {
		const colors = useThemeColors();

		const ranked = useMemo(() => {
			const sorted = [...members].sort((a, b) => (b.stars || 0) - (a.stars || 0));
			let lastStars = null;
			let lastRank = 0;
			let itemsProcessed = 0;
			return sorted.map((u) => {
				itemsProcessed += 1;
				const s = u.stars || 0;
				let rank;
				if (lastStars === null) {
					rank = 1;
				} else if (s === lastStars) {
					rank = lastRank;
				} else {
					rank = itemsProcessed;
				}
				lastStars = s;
				lastRank = rank;
				return { ...u, rank };
			});
		}, [members]);

		if (ranked.length === 0) {
			return (
				<div style={{
					...memberListStyles.emptyWrapper,
					borderColor: colors.text + '22',
					backgroundColor: colors.text + '05'
				}}>
					<span style={{ color: colors.text + '99', fontSize: 14 }}>
						{loadingMembers ? "" : "Sem membros nesta tribo"}
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
						const medalColor = item.rank === 1 ? colors.accent : item.rank === 2 ? colors.primary : colors.primary;

						return (
							<div
								key={`user-${item.id || index}-${item.email || ''}-${index}`}
								style={{
									...memberListStyles.row,
									backgroundColor: isSelf ? colors.accent + '22' : colors.text + '08',
									borderColor: colors.text + '15',
								}}
							>
								<div style={memberListStyles.rankCol}>
									{topMedal ? (
										<LucideIcon name={medalIcon} size={22} color={medalColor} />
									) : (
										<span style={{...memberListStyles.rankText, color: colors.text + 'AA'}}>{item.rank}</span>
									)}
								</div>
								<div style={{
									...memberListStyles.avatar,
									borderColor: colors.primary + '66'
								}}>
									{item.avatarIcon ? (
										<LucideIcon name={item.avatarIcon} size={20} color={colors.primary} />
									) : (
										<span style={{...memberListStyles.avatarLetter, color: colors.primary}}>
											{(item.name || '?').charAt(0).toUpperCase()}
										</span>
									)}
								</div>
								<div style={memberListStyles.mainCol}>
									<span style={{
										...memberListStyles.name,
										color: colors.text,
										display: '-webkit-box',
										WebkitLineClamp: 1,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}>
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
		<div style={{...styles.container, backgroundColor: colors.background}}>
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
				joined={isInTribe && selectedTribe && userTribe && selectedTribe.id === userTribe.id}
				accentColor={selectedTribe?.color}
				iconColor={selectedTribe?.iconColor}
				icon={selectedTribe?.icon}
				tribeIconName="users"
				onJoin={handleJoinTribe}
				onLeave={handleLeaveTribe}
				disabledJoin={joiningTribe || (isInTribe && selectedTribe && userTribe && selectedTribe.id !== userTribe.id)}
			/>
			<MemberList
				members={tribeMembers}
				currentUserId={DataManager.getUser()?.id}
			/>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
};

const memberListStyles = {
	list: {
		flexGrow: 0,
		overflowY: 'auto',
	},
	contentContainer: {
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
