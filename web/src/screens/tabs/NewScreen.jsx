import React, { useState, useEffect } from 'react';

// Mock React Native navigation hook for web
const useNavigation = () => ({ navigate: () => {}, goBack: () => {}, replace: () => {} });

import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import SvgIcon from '../../components/General/SvgIcon.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import NewsList from '../../components/News/NewsList.jsx';

export default function NewScreen() {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	useEffect(() => {
		const updateData = () => {
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
	return (
		<div style={{...styles.container, ...{ backgroundColor: colors.background }}}> 
			<Header 
				title="Noticias" 
				right={(
					<div style={{ position: 'relative' }}>
						<button 							
							aria-label="Notificações"
							onClick={() => setNotificationsOpen(true)}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							style={{ paddingHorizontal: 4 }}
						>
							<SvgIcon name="bell" size={22} color={colors.text} />
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
						<SvgIcon name="settings" size={22} color={colors.text} />
					</button>
				)}
			/>
			<div style={{...styles.body, ...{ backgroundColor: colors.background }}}> 
				<NewsList />
			</div>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}

const styles = {
	container: { flex: 1 },
	body: { flex: 1, paddingHorizontal: 0, paddingTop: 20 },
	title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
	subtitle: { fontSize: 16, fontWeight: '500' },
};

