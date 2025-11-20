import React, { useState, useEffect, useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';
import OrganizationModal from './OrganizationModal.jsx';

export default function TournamentRankingModal({ visible, onClose, challengeId, minimumPoints = null, navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [activeTab, setActiveTab] = useState('global');
	const [loading, setLoading] = useState(false);
	const [rankingData, setRankingData] = useState(null);
	const [error, setError] = useState(null);
	const [organizationModalVisible, setOrganizationModalVisible] = useState(false);
	const [selectedOrganization, setSelectedOrganization] = useState(null);

	useEffect(() => {
		if (visible && challengeId) {
			loadRanking(activeTab);
		}
	}, [visible, challengeId, activeTab]);

	const loadRanking = async (type) => {
		setLoading(true);
		setError(null);
		try {
			// Map UI tab names to API parameter names
			// UI: global|school|tribe -> API: global|team|tribe
			const apiType = type === 'school' ? 'team' : type;
			
			console.log('TournamentRankingModal: Loading ranking', { 
				type, 
				apiType, 
				challengeId 
			});

			const response = await ApiManager.makeAuthenticatedJSONRequest('app/challenge_ranking', {
				method: 'POST',
				body: { type: apiType, challengeId }
			});

			console.log('TournamentRankingModal: API response', response);

			if (response.success) {
				setRankingData(response);
			} else {
				setError('Erro ao carregar ranking');
			}
		} catch (err) {
			console.error('Error loading tournament ranking:', err);
			setError('Erro ao carregar ranking');
		} finally {
			setLoading(false);
		}
	};

	const renderRankingItem = (item, index) => {
		const isMe = item.me === 1;
		const isTribe = activeTab === 'tribe';
		const topMedal = item.position <= 3;
		const medalIcon = item.position === 1 ? 'trophy' : 'medal';
		const medalColor = item.position === 1 ? colors.accent : colors.primary;

		// Para tribos: tribeImage (SVG), tribeName
		// Para global/school: organizationUrl (URL), teamName
		const imageSrc = isTribe ? null : item.organizationUrl;
		const imageSvg = isTribe ? item.tribeImage : null;
		const name = isTribe ? item.tribeName : item.teamName;

		const handleAvatarClick = (e) => {
			e.stopPropagation();
			
			if (isTribe && item.tribeId && navigation) {
				console.log('[TournamentRanking] Navigating to tribe:', item.tribeId, 'Name:', item.tribeName);
				onClose();
				// Navegar para MainTabs com o screen de Tribes e params
				navigation.navigate('MainTabs', { 
					screen: 'Tribes',
					params: { selectedTribeId: item.tribeId }
				});
			} else if (!isTribe && imageSrc) {
				// Clicar na organização (global/escola) abre modal
				console.log('[TournamentRanking] Opening organization modal:', name);
				setSelectedOrganization({ name, imageUrl: imageSrc });
				setOrganizationModalVisible(true);
			}
		};

		return (
			<div
				key={index}
				style={{
					...styles.rankItem,
					backgroundColor: isMe ? colors.accent + '22' : colors.text + '08',
					borderColor: colors.text + '15',
				}}
			>
				<div style={styles.rankLeft}>
					<div style={styles.rankCol}>
						{topMedal ? (
							<LucideIcon name={medalIcon} size={22} color={medalColor} />
						) : (
							<span style={{ ...styles.position, color: colors.text + 'AA' }}>
								{item.position}
							</span>
						)}
					</div>
					<button
						onClick={handleAvatarClick}
						style={{
							...styles.avatar,
							backgroundColor: colors.surface,
							borderColor: colors.primary + '66',
							cursor: (isTribe && item.tribeId && navigation) || (!isTribe && imageSrc) ? 'pointer' : 'default',
						}}
						disabled={!(isTribe && item.tribeId && navigation) && !(imageSrc && !isTribe)}
					>
						{imageSvg ? (
							<div dangerouslySetInnerHTML={{ __html: imageSvg }} style={{ width: '100%', height: '100%' }} />
						) : imageSrc ? (
							<img src={imageSrc} alt={name} style={styles.avatarImage} />
						) : (
							<LucideIcon name="users" size={24} color={colors.primary} />
						)}
					</button>
					<div style={styles.nameColumn}>
						<span style={{ ...styles.name, color: colors.text }}>
							{name}
						</span>
						{!isTribe && item.organizationName && (
							<span style={{ ...styles.subtitle, color: colors.muted }}>
								{item.organizationName}
							</span>
						)}
					</div>
				</div>
				<div style={styles.rankRight}>
					<span style={{ ...styles.points, color: colors.text }}>
						{item.points}
					</span>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		if (loading) {
			return (
				<div style={styles.emptyContainer}>
					<span style={{ ...styles.emptyText, color: colors.muted }}>
						{translate('common.loading')}
					</span>
				</div>
			);
		}

		if (error) {
			return (
				<div style={styles.emptyContainer}>
					<span style={{ ...styles.emptyText, color: colors.error }}>
						{error}
					</span>
				</div>
			);
		}

		if (!rankingData || !rankingData.ranking || rankingData.ranking.length === 0) {
			const emptyKey = `tournament.empty.${activeTab}`;
			return (
				<div style={styles.emptyContainer}>
					<span style={{ ...styles.emptyText, color: colors.muted }}>
						{translate(emptyKey)}
					</span>
				</div>
			);
		}

		return (
			<div style={styles.rankingList}>
				{rankingData.ranking.map((item, index) => renderRankingItem(item, index))}
			</div>
		);
	};

	if (!visible) return null;

	return (
		<div style={styles.overlay} onClick={onClose}>
			<div style={{ ...styles.modal, backgroundColor: colors.background, borderColor: colors.border }} onClick={(e) => e.stopPropagation()}>
				<div style={styles.header}>
					<span style={{ ...styles.title, color: colors.text }}>
						{translate('tournament.rankingTitle')}
					</span>
					<button onClick={onClose} style={styles.closeButton}>
						<LucideIcon name="x" size={24} color={colors.text} />
					</button>
				</div>

				{minimumPoints !== null && (
					<div style={{ ...styles.minimumPointsBanner, backgroundColor: colors.surface, borderColor: colors.border }}>
						<LucideIcon name="medal" size={18} color={colors.accent} />
						<span style={{ ...styles.minimumPointsText, color: colors.accent }}>
							{translate('tournament.minimumPoints', { points: minimumPoints })}
						</span>
					</div>
				)}

				<div style={styles.tabs}>
					{['global', 'school', 'tribe'].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							style={{
								...styles.tab,
								backgroundColor: activeTab === tab ? colors.secondary : 'transparent',
								borderColor: activeTab === tab ? colors.secondary : colors.border,
							}}
						>
							<LucideIcon
								name={tab === 'global' ? 'globe' : tab === 'school' ? 'school' : 'users'}
								size={16}
								color={activeTab === tab ? '#FFFFFF' : colors.text}
							/>
							<span style={{ ...styles.tabText, color: activeTab === tab ? '#FFFFFF' : colors.text }}>
								{translate(`tournament.tabs.${tab}`)}
							</span>
						</button>
					))}
				</div>

				<div style={styles.content}>
					{renderContent()}
				</div>
			</div>
			
			{/* Organization Modal */}
			<OrganizationModal
				visible={organizationModalVisible}
				onClose={() => {
					setOrganizationModalVisible(false);
					setSelectedOrganization(null);
				}}
				organizationName={selectedOrganization?.name}
				organizationImageUrl={selectedOrganization?.imageUrl}
			/>
		</div>
	);
}

const styles = {
	overlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000,
		padding: 20,
	},
	modal: {
		width: '100%',
		maxWidth: 500,
		maxHeight: '90vh',
		borderRadius: 16,
		borderWidth: 1,
		borderStyle: 'solid',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 20,
		paddingBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: '800',
		fontFamily: family.bold,
	},
	closeButton: {
		background: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: 4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	minimumPointsBanner: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 12,
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderStyle: 'solid',
	},
	minimumPointsText: {
		fontSize: 13,
		fontWeight: '600',
		fontFamily: family.medium,
	},
	tabs: {
		display: 'flex',
		flexDirection: 'row',
		gap: 8,
		paddingLeft: 20,
		paddingRight: 20,
		marginBottom: 16,
	},
	tab: {
		flex: 1,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 6,
		padding: '10px 12px',
		borderRadius: 24,
		borderWidth: 1,
		borderStyle: 'solid',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		fontFamily: family.bold,
	},
	tabText: {
		fontSize: 13,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	content: {
		flex: 1,
		overflowY: 'auto',
		paddingLeft: 20,
		paddingRight: 20,
		paddingBottom: 20,
	},
	rankingList: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},
	rankItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: '10px 12px',
		borderRadius: 14,
		borderWidth: 1,
		borderStyle: 'solid',
		gap: 12,
	},
	rankLeft: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		flex: 1,
		minWidth: 0,
	},
	rankCol: {
		width: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	position: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 12,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		flexShrink: 0,
		padding: 0,
		background: 'none',
	},
	avatarImage: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	},
	nameColumn: {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		flex: 1,
		minWidth: 0,
	},
	name: {
		fontSize: 14,
		fontWeight: '700',
		fontFamily: family.bold,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	subtitle: {
		fontSize: 11,
		fontFamily: family.regular,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	rankRight: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		flexShrink: 0,
	},
	points: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	emptyContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 40,
	},
	emptyText: {
		fontSize: 14,
		fontFamily: family.regular,
		textAlign: 'center',
	},
};
