import React, { useState, useMemo, useEffect } from 'react';
import {Modal} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../../components/General/SvgIcon';
import UserList from '../General/UserList';
import DataManager from '../../services/DataManager';
import ApiManager from '../../services/ApiManager';
import { family } from '../../constants/font';

export default function RankingsModal({ visible, onClose }) {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const width = window.innerWidth; const height = window.innerHeight;
	const [tab, setTab] = useState('global'); // 'global' | 'school' | 'class'
	const [metric, setMetric] = useState('points'); // 'points' | 'stars' | 'xp'
	const [loading, setLoading] = useState(false);

	// Get and process rankings data for current metric
	const rankingsResponse = DataManager.getRankings(metric);
	const allRankings = rankingsResponse?.ranking || [];
	
	// Find current user from rankings to get their organization and team info
	const currentUser = allRankings.find(user => user.me === 1);
	const currentUserId = currentUser?.userId?.toString();
	const currentUserOrgName = currentUser?.organizationName;
	const currentUserTeamName = currentUser?.teamName;

	// Check for ranking updates when modal opens (only once per modal session)
	useEffect(() => {
		if (visible) {
			checkForRankingUpdates();
		}
	}, [visible]);

	// Re-get rankings data when metric changes (no API call, just local data)
	useEffect(() => {
		// This effect will trigger a re-render when metric changes
		// since rankingsResponse depends on the metric
	}, [metric]);

	const checkForRankingUpdates = async () => {
		setLoading(true);
		try {
			const hasUpdates = await DataManager.checkAndUpdateRankings();
			if (hasUpdates) {
				//console.log('RankingsModal: Rankings updated');
			}
		} catch (error) {
			console.error('Failed to check ranking updates:', error);
		} finally {
			setLoading(false);
		}
	};

	// Force refresh all rankings (for manual refresh if needed)
	const forceRefreshRankings = async () => {
		setLoading(true);
		try {
			await Promise.all([
				DataManager.refreshRankings('points'),
				DataManager.refreshRankings('stars'),
				DataManager.refreshRankings('xp')
			]);
			//console.log('RankingsModal: All rankings force refreshed');
		} catch (error) {
			console.error('Failed to force refresh rankings:', error);
		} finally {
			setLoading(false);
		}
	};

	// Handle user press to open their profile
	const handleUserPress = async (user) => {
		try {
			// Don't open profile if it's the current user (they already have ProfileScreen)
			if (user.id === currentUserId) {
				return;
			}

			setLoading(true);
			
			// Fetch user data using the API
			const userBadgesResponse = await ApiManager.getUserBadges(parseInt(user.id));
			
			if (userBadgesResponse?.success && userBadgesResponse?.user) {
				// Close the rankings modal first
				onClose();
				
				// Navigate to ProfileScreen with the user data
				navigation.navigate('Profile', {
					externalUser: userBadgesResponse.user,
					externalBadges: userBadgesResponse.items || []
				});
			} else {
				console.warn('Failed to load user data:', userBadgesResponse);
			}
		} catch (error) {
			console.error('Error loading user profile:', error);
		} finally {
			setLoading(false);
		}
	};

	const data = useMemo(() => {
		if (!allRankings.length) return [];

		// New API always returns points, but we display them based on the selected metric
		const getMetricValue = (user) => {
			// The API now returns consistent points data regardless of metric type
			return user.points ?? 0;
		};

		// Transform API data to match UserList component format
		const transformRanking = (rankings) => {
			return rankings.map(user => {
				const value = getMetricValue(user);
				return ({
					id: user.userId.toString(),
					name: user.nickname,
					stars: value,
					trophies: value,
					xp: value,
					self: user.me === 1,
					position: user.position,
					organizationId: user.organizationId,
					organizationName: user.organizationName,
					teamId: user.teamId,
					teamName: user.teamName,
					avatarUrl: user.avatarUrl,
					backgroundUrl: user.backgroundUrl,
					frameUrl: user.frameUrl
				});
			})
		};

		switch (tab) {
			case 'school': {
				// Filter by current user's organization name
				const schoolRankings = allRankings.filter(user => 
					user.organizationName === currentUserOrgName
				);
				return transformRanking(schoolRankings);
			}
			case 'class': {
				// Filter by current user's team name
				const classRankings = allRankings.filter(user => 
					user.teamName === currentUserTeamName
				);
				return transformRanking(classRankings);
			}
			default: {
				// Global rankings - all users
				return transformRanking(allRankings);
			}
		}
	}, [allRankings, tab, currentUserOrgName, currentUserTeamName]);

	const MetricBtn = ({ label, value, icon }) => {
		const active = metric === value;
		return (
			<button 				onClick={() => setMetric(value)}
				style={{...styles.tabBtn, ...{ borderColor: colors.text + '33'}}
				
				aria-label={`Métrica ${label}`}
			>
				{icon ? (
					<SvgIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
				) : (
					<span style={{...styles.tabLabel, ...{ color: active ? colors.primary : colors.text }}}>XP</span>
				)}
			</button>
		);
	};

	const TabBtn = ({ label, value, icon }) => {
		const active = tab === value;
		return (
			<button 				onClick={() => setTab(value)}
				style={{...styles.tabBtn, ...{ borderColor: colors.text + '33'}}
				
				aria-label={`Ranking ${label}`}
			>
				<SvgIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
				<span style={{...styles.tabLabel, ...{ color: active ? colors.primary : colors.text }}}>{label}</span>
			</button>
		);
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<div style={{...styles.backdrop, ...{ backgroundColor: '#00000088' }}}> 
				<button style={StyleSheet.absoluteFill} onClick={onClose}  aria-label="Fechar rankings" />
				<div style={{...styles.panel, ...{ 
						backgroundColor: colors.background}}> 
					<div style={styles.titleRow}>
						<span style={{...styles.modalTitle, ...{ color: colors.text }}}>Rankings</span>
						{loading && (
							<div 
								size="small" 
								color={colors.primary} 
								style={styles.loadingIndicator}
							/>
						)}
					</div>
					{/* Metric selection */}
					<div style={styles.tabsRowCentered}>
						<MetricBtn label="Pontos" value="points" icon="trophy" />
						<MetricBtn label="Estrelas" value="stars" icon="star" />
						<MetricBtn label="XP" value="xp" icon={null} />
					</div>
					{/* Scope tabs */}
					<div style={styles.tabsRowCentered}>
						<TabBtn label="Global" value="global" icon="globe" />
						<TabBtn label="Escola" value="school" icon="school" />
						<TabBtn label="Turma" value="class" icon="users" />
					</div>
					<div style={{...styles.listContainer, ...{ maxHeight: height * 0.5 }}}>
						<UserList
							users={data}
							currentUserId={currentUserId}
							metric={metric}
							denseRanking={false}
							showRelativeBar={metric !== 'xp'}
							showMedals={true}
							onUserPress={handleUserPress}
						/>
					</div>
				</div>
			</div>
		</Modal>
	);
}

const styles = {
	backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 40 },
	panel: { borderRadius: 24, padding: 18, borderWidth: 1, width: '100%', maxWidth: 480 },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
	modalTitle: { fontSize: 18, fontFamily: family.bold, textAlign: 'center' },
	loadingIndicator: { marginLeft: 8 },
	tabsRowCentered: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
	tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10 },
	tabLabel: { fontSize: 13, fontFamily: family.bold },
	listContainer: { flex: 1, minHeight: 200 },
};

