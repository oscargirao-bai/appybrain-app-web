import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';
import Button2 from '../../components/General/Button2.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import NewsList from '../../components/News/NewsList.jsx';

export default function NewScreen({ navigation }) {
	const colors = useThemeColors();
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
				style={{ paddingRight: 10 }}
				right={(
					<div style={{ position: 'relative' }}>
						<Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
						<NotificationBadge count={unreadNotificationsCount} />
					</div>
				)}
				extraRight={(<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />)}
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
	body: { flex: 1, paddingLeft: 0, paddingRight: 0, paddingTop: 20 },
	title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
	subtitle: { fontSize: 16, fontWeight: '500' },
};

