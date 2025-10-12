import React, { useState, useEffect } from 'react';

// Mock React Native hooks for web
const useWindowDimensions = () => ({ width: window.innerWidth, height: window.innerHeight });
const useNavigation = () => ({ navigate: () => {}, goBack: () => {}, replace: () => {} });

import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import Banner from '../../components/Profile/Banner.jsx';
import Info from '../../components/Learn/Info.jsx';
import Button2 from '../../components/General/Button2.jsx';
import Button1 from '../../components/General/Button1.jsx';
import Subject2 from '../../components/Learn/Subject2.jsx';
import Area from '../../components/Learn/Area.jsx';
import Chest from '../../components/General/Chest.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import RankingsModal from '../../components/Learn/RankingsModal.jsx';
import Stars from '../../components/Learn/Stars.jsx';
import ChestRewardModal from '../../components/General/ChestRewardModal.jsx';
import ChestBrowserModal from '../../components/General/ChestBrowserModal.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import LucideIcon from '../../components/General/LucideIcon.jsx';
// (Content list removido ao retirar multi-part)

// TESTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Corrigido caminho relativo: de '../../testing' (inexistente em src/) para '../../../testing'
//import moldura from '../../../testing/moldura.png';

export default function LearnScreen({ sourceId, timestamp, openNotifications }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const { height: windowHeight } = useWindowDimensions();
	const navigation = useNavigation();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [rankingsOpen, setRankingsOpen] = useState(false);
	const [chestRewardOpen, setChestRewardOpen] = useState(false);
	const [chestRewards, setChestRewards] = useState([]);
	const [chestType, setChestType] = useState('bronze'); // Store the type of chest being opened
	const [chestBrowserOpen, setChestBrowserOpen] = useState(false);
	const [reopenBrowserAfterReward, setReopenBrowserAfterReward] = useState(false);
	const [userInfo, setUserInfo] = useState(null);
	const [disciplines, setDisciplines] = useState([]);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	useEffect(() => {
		// Open Notifications modal if requested via navigation params
		if (openNotifications) {
			setTimeout(() => setNotificationsOpen(true), 300);
		}
	}, [openNotifications]);

	useEffect(() => {
		const updateData = () => {
			const userData = DataManager.getUser();
			setUserInfo(userData);
			const disciplinesData = DataManager.getDisciplines();
			setDisciplines(disciplinesData);
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

	// Handle chest opening - open chest browser modal first
	const handleChestOpen = async () => {
		setChestBrowserOpen(true);
		setReopenBrowserAfterReward(false); // fresh open
	};

	const handleChestOpenedFromBrowser = (rewards, chestType) => {
		setChestRewards(rewards || []);
		setChestType(chestType || 'bronze');
		setChestRewardOpen(true);
		setReopenBrowserAfterReward(true);
	};

	// Proportions (relative to full screen height)
	const HEADER_PCT = 0.10; // header handled by Header component
	const INFO_PCT = 0.10;
	const CHEST_LINE_PCT = 0.15;
	const TROPHY_PCT = 0.06;
	const MATH_PCT = 0.10;
	const BUTTON_PCT = 0.10;
	const CHEST_SIZE_PCT = 0.10; // chest component size
	const bannerPct = Math.max(0, 1 - (HEADER_PCT + INFO_PCT + CHEST_LINE_PCT + TROPHY_PCT + MATH_PCT + BUTTON_PCT));

	const bannerH = Math.round(windowHeight * bannerPct);
	const infoH = Math.round(windowHeight * INFO_PCT);
	const chestH = Math.round(windowHeight * CHEST_LINE_PCT);
	const trophyH = Math.round(windowHeight * TROPHY_PCT);
	const mathH = Math.round(windowHeight * MATH_PCT);
	const buttonH = Math.round(windowHeight * BUTTON_PCT);
	const chestSize = Math.round(windowHeight * CHEST_SIZE_PCT);

	// (dev debug overlay removed)

	// Multi-part removido – mostrar apenas o overview (Chest + Subject)
	// Let Chest component handle its own data from API
	return (
		<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>      
			<Header
				title={translate('titles.learn')}
				right={(
					<div style={{ position: 'relative' }}>
						<button 							
							aria-label={translate('options.notification')}
							onClick={() => setNotificationsOpen(true)}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							style={{ paddingHorizontal: 4 }}
						>
							<LucideIcon name="bell" size={22} color={colors.text} />
						</button>
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(
					<button 						
						aria-label={translate('settings.settings')}
						onClick={() => navigation.navigate('Settings')}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ paddingHorizontal: 4 }}
					>
						<LucideIcon name="settings" size={22} color={colors.text} />
					</button>
				)}
			/>
			<div style={styles.content}>
				<div style={styles.headerSection}>
					<div style={styles.bannerSection}>
						<Banner
							topFlat={true}
							avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
							bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
							frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
						/>
					</div>
					<div style={styles.infoSection}>
						<Info
							username={userInfo?.nickname}
							tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
							stars={userInfo?.stars ?? 0}
							coins={userInfo?.coins ?? 0}
						/>
					</div>
					<div style={styles.chestLine}>
						<button 							style={styles.chestPressable}
							onClick={handleChestOpen}
							
							aria-label="Baú de recompensas"
						>
							<Chest size={chestSize} dataSource='stars' />
						</button>
						<div style={styles.starsWrap}>
							<Stars value={userInfo?.stars ?? 0} size={48} responsive={true} />
						</div>
						<div style={styles.buttonsRow}>
							<Button2
								iconName="medal"
								onClick={() => setRankingsOpen(true)}
								style={styles.buttonSpacing}
							/>
						</div>
					</div>
				</div>
				<div style={styles.bottomSection}>
					<div style={styles.trophySection} />
					<div style={styles.subjectsSection}>
						<div style={styles.subjectsRow}>
						{disciplines.map((discipline) => (
							<Area
								key={discipline.id}
								title={discipline.title}
								svgIcon={discipline.icon}
								color={discipline.color}
								iconColor={discipline.iconColor}
								disciplineId={discipline.id}
								iconName="book-open"
								onClick={() => navigation.navigate('Category', { disciplineId: discipline.id })}
							/>
						))}
						</div>
					</div>
					<div style={styles.buttonSection}>
						<div style={styles.learnButtonWrap}>
							<Button1
								label={translate('titles.learn')}
								color="#FFD700"
								onClick={() => {
								if (disciplines.length > 0) navigation.navigate('Category', { disciplineId: disciplines[0].id });
								}}
							/>
						</div>
					</div>
				</div>
			</div>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
			<RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
			<ChestRewardModal 
				visible={chestRewardOpen} 
				onClose={() => {
					setChestRewardOpen(false);
					if (reopenBrowserAfterReward) {
						// slight delay to avoid overlapping modals
						setTimeout(() => setChestBrowserOpen(true), 120);
					}
				}} 
				rewards={chestRewards}
				chestType={chestType}
			/>
			<ChestBrowserModal visible={chestBrowserOpen} onClose={() => setChestBrowserOpen(false)} onChestOpened={handleChestOpenedFromBrowser} dataSource="stars" />
		</div>
		);
	}

const styles = {
	safe: { flex: 1 },
	content: { flex: 1, justifyContent: 'flex-start' },
	headerSection: {
		width: '100%',
	},
	bottomSection: {
		flex: 1,
		justifyContent: 'space-between',
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
	chestPressable: {
		alignSelf: 'flex-start',
		marginTop: 6,
	},
	starsWrap: {
		alignSelf: 'center',
		marginHorizontal: 8,
	},
	fullBleed: {
		marginHorizontal: -10,
		width: 'auto',
	},
	learnButtonWrap: {
		paddingBottom: 0,
		marginBottom: -20,
		marginTop: -2,
		alignItems: 'center',
	},
	subjectsCenter: {
		flex: 1,
		justifyContent: 'center',
	},
	subjectsRow: {
		width: '100%',
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'space-around',
		paddingHorizontal: 20,
	},
	bannerSection: {
		width: '100%',
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 0,
		marginBottom: 0,
		paddingVertical: 0,
	},
	infoSection: {
		width: '100%',
		justifyContent: 'center',
		marginTop: 0,
	},
	chestLine: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
	},
	trophySection: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		height: 0,
	},
	subjectsSection: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		flex: 0.7,
	},
	buttonSection: {
		width: '100%',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingBottom: 8,
		flex: 0.3,
		paddingTop: 2,
	},
};

