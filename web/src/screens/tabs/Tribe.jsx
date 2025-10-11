import React, { useState, useEffect, useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import DataManager from '../../services/DataManager.js';
import ApiManager from '../../services/ApiManager.js';
import TribesHeader from '../../components/tribes/Header.jsx';
import TribeInfo from '../../components/tribes/Info.jsx';
import NotificationBadge from '../../components/common/NotificationBadge.jsx';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import Icon from '../../components/common/Icon.jsx';

export default function Tribe({ onNavigate }) {
	const colors = useThemeColors();
	const [userTribe, setUserTribe] = useState(null);
	const [allTribes, setAllTribes] = useState([]);
	const [isInTribe, setIsInTribe] = useState(false);
	const [selectedTribe, setSelectedTribe] = useState(null);
	const [tribeMembers, setTribeMembers] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [joiningTribe, setJoiningTribe] = useState(false);
	const [memberAnimations, setMemberAnimations] = useState([]);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	useEffect(() => {
		// Get user's current tribe
		const currentTribe = DataManager.getUserTribe?.();
		setUserTribe(currentTribe);

		// Check if user is in a tribe
		const inTribe = DataManager.isInTribe?.();
		setIsInTribe(inTribe);

		// Get ALL tribes (both user's tribe and available tribes)
		const tribes = DataManager.getTribes?.() || [];
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
			const unreadCount = DataManager.getUnreadNotificationsCount?.() || 0;
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
			// Clear previous tribe members and animations immediately
			setTribeMembers([]);
			setMemberAnimations([]);
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

			// Create animation values for each member
			const animations = sortedMembers.map(() => ({
				translateY: 30,
				opacity: 0
			}));

			setTribeMembers(sortedMembers);
			setMemberAnimations(animations);

			// Animate members in sequence using CSS
			setTimeout(() => {
				animations.forEach((anim, index) => {
					setTimeout(() => {
						setMemberAnimations(prev => {
							const newAnims = [...prev];
							newAnims[index] = { translateY: 0, opacity: 1 };
							return newAnims;
						});
					}, index * 100); // 100ms delay between each member
				});
			}, 50); // Small delay before starting animations

		} catch (error) {
			console.error('Failed to fetch tribe members:', error);
			setTribeMembers([]); // Clear members on error
			setMemberAnimations([]);
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
			DataManager.updateUserTribeMembership?.(selectedTribe.id, true);

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
			DataManager.updateUserTribeMembership?.(selectedTribe.id, false);

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

	// Custom animated member list component
	const AnimatedMemberList = ({ members, animations, currentUserId }) => {
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
					marginTop: 16,
					marginLeft: 16,
					marginRight: 16,
					border: `1px solid ${colors.text}22`,
					backgroundColor: `${colors.text}05`,
					borderRadius: 16,
					padding: 24,
					display: 'flex',
					alignItems: 'center'
				}}>
					<span style={{ color: `${colors.text}99`, fontSize: 14 }}>
						{loadingMembers ? "" : "Sem membros nesta tribo"}
					</span>
				</div>
			);
		}

		return (
			<div style={{
				paddingLeft: 8,
				paddingRight: 8,
				paddingBottom: 24,
				overflowY: 'auto'
			}}>
				{ranked.map((item, index) => {
					const isSelf = item.id === currentUserId;
					const topMedal = item.rank <= 3;
					const medalIcon = item.rank === 1 ? 'crown' : item.rank === 2 ? 'award' : 'award';
					const medalColor = item.rank === 1 ? colors.accent : item.rank === 2 ? colors.primary : colors.primary;
					const animation = animations[index];

					if (!animation) return null;

					return (
						<div
							key={`user-${item.id || index}-${item.email || ''}-${index}`}
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								paddingTop: 10,
								paddingBottom: 10,
								paddingLeft: 10,
								paddingRight: 10,
								border: `1px solid ${colors.text}15`,
								borderRadius: 14,
								marginTop: 10,
								backgroundColor: isSelf ? `${colors.accent}22` : `${colors.text}08`,
								transform: `translateY(${animation.translateY}px)`,
								opacity: animation.opacity,
								transition: 'transform 400ms, opacity 400ms'
							}}
						>
							<div style={{ width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								{topMedal ? (
									<Icon name={medalIcon} size={22} color={medalColor} />
								) : (
									<span style={{ fontSize: 16, fontWeight: 800, color: `${colors.text}AA` }}>{item.rank}</span>
								)}
							</div>
							<div style={{
								width: 40,
								height: 40,
								borderRadius: 12,
								border: `2px solid ${colors.primary}66`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginRight: 12
							}}>
								{item.avatarIcon ? (
									<Icon name={item.avatarIcon} size={20} color={colors.primary} />
								) : (
									<span style={{ fontSize: 18, fontWeight: 700, color: colors.primary }}>
										{(item.name || '?').charAt(0).toUpperCase()}
									</span>
								)}
							</div>
							<div style={{ flex: 1, marginRight: 10 }}>
								<span style={{ fontSize: 15, fontWeight: 700, color: colors.text, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
									{item.name}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div style={{ minHeight: '100vh', backgroundColor: colors.background, color: colors.text }}>
			<div className="page-50" style={{ paddingBottom: '80px' }}>
				{/* Header */}
				<header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
					<div style={{ fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', marginLeft: '-48px' }}>{t('titles.tribes')}</div>
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
				<AnimatedMemberList
					members={tribeMembers}
					animations={memberAnimations}
					currentUserId={DataManager.getUser()?.id}
				/>
			</div>

			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}
