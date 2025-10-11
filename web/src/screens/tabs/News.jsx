import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.js';
import NotificationBadge from '../../components/common/NotificationBadge.jsx';
import Icon from '../../components/common/Icon.jsx';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import NewsList from '../../components/news/NewsList.jsx';

export default function News({ onNavigate }) {
	const colors = useThemeColors();
	const [notificationsOpen, setNotificationsOpen] = useState(false);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	useEffect(() => {
		const updateData = () => {
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
					<div style={{ fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', marginLeft: '-48px' }}>Notícias</div>
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
				<div style={{ padding: '20px 0' }}>
					<NewsList />
				</div>
			</div>

			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</div>
	);
}
