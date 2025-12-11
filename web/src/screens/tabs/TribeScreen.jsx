import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import LucideIcon from '../../components/General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';
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

export default function TribeScreen({ navigation, selectedTribeId }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [userTribe, setUserTribe] = useState(null);
	const [allTribes, setAllTribes] = useState([]);
	const [isInTribe, setIsInTribe] = useState(false);
	// ID selecionado manualmente pelo utilizador (cliques no header)
	const [manualSelectedTribeId, setManualSelectedTribeId] = useState(null);
	// ID bloqueado vindo de navegação a partir do ranking
	const lockedSelectedIdRef = useRef(null);
	const [tribeMembers, setTribeMembers] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [joiningTribe, setJoiningTribe] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
	const [animateMembers, setAnimateMembers] = useState(false);

	useEffect(() => {
		console.log('=== TRIBE SCREEN INIT ===');
		console.log('[TribeScreen] Received selectedTribeId:', selectedTribeId);
		if (selectedTribeId && lockedSelectedIdRef.current == null) {
			lockedSelectedIdRef.current = selectedTribeId;
			console.log('[TribeScreen][Lock] lockedSelectedIdRef set to', selectedTribeId);
		}
		const currentTribe = DataManager.getUserTribe();
		setUserTribe(currentTribe);
		console.log('[TribeScreen] User current tribe:', currentTribe?.name, 'id:', currentTribe?.id);

		const inTribe = DataManager.isInTribe();
		setIsInTribe(inTribe);

		const tribes = DataManager.getTribes();
		setAllTribes(tribes);
		console.log('[TribeScreen] All available tribes:', tribes.map(t => ({ id: t.id, name: t.name })));
		console.log('=== TRIBE SCREEN INIT END ===');
	}, [selectedTribeId]);

	// Quando tribos ou estado de lock alteram, determinar tribo efetiva e carregar membros
	useEffect(() => {
		if (!allTribes.length) return;
		const lockedId = lockedSelectedIdRef.current;
		let effectiveId = lockedId || manualSelectedTribeId;
		if (!effectiveId) {
			effectiveId = userTribe?.id || allTribes[0]?.id;
		}
		const tribeObj = allTribes.find(t => t.id === effectiveId);
		if (tribeObj) {
			console.log('[TribeScreen][Effective] Using tribe:', tribeObj.name, 'id:', tribeObj.id, 'locked:', lockedId, 'manual:', manualSelectedTribeId);
			fetchTribeMembers(tribeObj.id);
		}
	}, [allTribes, manualSelectedTribeId, userTribe]);

	// Log estado derivado em cada render relevante
	const derivedSelectedTribe = useMemo(() => {
		const lockedId = lockedSelectedIdRef.current;
		const searchId = lockedId || manualSelectedTribeId || userTribe?.id || allTribes[0]?.id;
		return allTribes.find(t => t.id === searchId) || null;
	}, [allTribes, manualSelectedTribeId, userTribe]);

	useEffect(() => {
		if (derivedSelectedTribe) {
			console.log('[TribeScreen][RenderSync] selectedTribe:', derivedSelectedTribe.name, 'id:', derivedSelectedTribe.id, 'lockedId:', lockedSelectedIdRef.current, 'manualId:', manualSelectedTribeId, 'userTribe:', userTribe?.name, 'id:', userTribe?.id);
		} else {
			console.log('[TribeScreen][RenderSync] selectedTribe: null', 'lockedId:', lockedSelectedIdRef.current, 'manualId:', manualSelectedTribeId);
		}
	}, [derivedSelectedTribe, manualSelectedTribeId, userTribe]);

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
		if (!tribe) return;
		console.log('[TribeScreen][handleSelect] User clicked tribe:', tribe.name, 'id:', tribe.id, 'lockedId:', lockedSelectedIdRef.current);
		// Se existe lock inicial mas utilizador clicou noutra tribo, libertar lock e assumir manual
		if (lockedSelectedIdRef.current && lockedSelectedIdRef.current !== tribe.id) {
			console.log('[TribeScreen][handleSelect] Replacing lockedId with manual selection:', tribe.id);
			lockedSelectedIdRef.current = null;
		}
		setManualSelectedTribeId(tribe.id);
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
		const { translate } = useTranslate();
		const xpFormatter = useMemo(() => new Intl.NumberFormat('pt-PT'), []);

		const ranked = useMemo(() => {
			const getXpValue = (user) => {
				const candidates = [
					user?.xp,
					user?.totalXp,
					user?.totalXP,
					user?.total_xp,
					user?.points,
					user?.totalPoints,
					user?.total_points,
				];
				for (const value of candidates) {
					if (typeof value === 'number' && !Number.isNaN(value)) {
						return value;
					}
					if (typeof value === 'string') {
						const numericValue = Number(value);
						if (!Number.isNaN(numericValue)) {
							return numericValue;
						}
					}
				}
				return 0;
			};

			const sorted = [...members].sort((a, b) => getXpValue(b) - getXpValue(a));
			let lastXp = null;
			let lastRank = 0;
			let processed = 0;
			return sorted.map((user) => {
				const xpValue = getXpValue(user);
				processed += 1;
				let rank;
				if (lastXp === null) {
					rank = 1;
				} else if (xpValue === lastXp) {
					rank = lastRank;
				} else {
					rank = processed;
				}
				lastXp = xpValue;
				lastRank = rank;
				return { ...user, rank, computedXp: xpValue };
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
					<span style={{ ...memberListStyles.emptyText, color: themeColors.text + '99' }}>
						{loadingMembers ? '' : translate('tribes.noMembers')}
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
						const displayName = item.nickname || item.name || item.firstName || '';
						const fallbackInitial = displayName.charAt(0).toUpperCase() || '?';
						const formattedXp = xpFormatter.format(item.computedXp || 0);

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
									{item.avatarUrl ? (
										<img src={item.avatarUrl} alt="" style={memberListStyles.avatarImage} />
									) : item.avatarIcon ? (
										<LucideIcon name={item.avatarIcon} size={20} color={themeColors.primary} />
									) : (
										<span style={{ ...memberListStyles.avatarLetter, color: themeColors.primary }}>
											{fallbackInitial}
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
										{displayName}
									</span>
								</div>
								<div style={memberListStyles.xpCol}>
									<span style={{ ...memberListStyles.xpLabel }}>
										{translate('rankings.metrics.xp')}
									</span>
									<span style={{ ...memberListStyles.xpText, color: themeColors.text }}>
										{formattedXp}
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
				selectedTribe={derivedSelectedTribe}
				forcedActiveId={derivedSelectedTribe?.id}
			/>
			<TribeInfo
				name={derivedSelectedTribe?.name}
				description={derivedSelectedTribe?.description}
				members={tribeMembers.length}
				joined={Boolean(isInTribe && derivedSelectedTribe && userTribe && derivedSelectedTribe.id === userTribe.id)}
				accentColor={derivedSelectedTribe?.color}
				iconColor={derivedSelectedTribe?.iconColor}
				icon={derivedSelectedTribe?.icon}
				trophies={derivedSelectedTribe?.trophies || 0}
				tribeIconName="users"
				onJoin={handleJoinTribe}
				onLeave={handleLeaveTribe}
				disabledJoin={joiningTribe || (isInTribe && derivedSelectedTribe && userTribe && derivedSelectedTribe.id !== userTribe.id)}
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
		fontFamily: family.bold,
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
		fontFamily: family.bold,
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
		fontFamily: family.semibold,
	},
	xpCol: {
		minWidth: 92,
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		gap: 4,
	},
	xpLabel: {
		fontSize: 14,
		fontWeight: '700',
		fontFamily: family.bold,
		color: '#FFCE3B',
		letterSpacing: 0.4,
	},
	xpText: {
		fontSize: 14,
		fontWeight: '600',
		fontFamily: family.semibold,
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
	emptyText: {
		fontSize: 14,
		fontFamily: family.medium,
	},
	avatarImage: {
		width: 32,
		height: 32,
		borderRadius: 10,
		objectFit: 'cover',
	},
};
