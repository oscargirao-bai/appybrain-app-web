import React, { useState, useCallback, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import LucideIcon from '../../components/General/LucideIcon.jsx';
import DataManager from '../../services/DataManager.jsx';
import { executeNotificationNavigation } from '../../services/Notifications.jsx';
import { setPendingNotificationNavigation, resetRoot } from '../../services/navigationRef.jsx';
import { family } from '../../constants/font.jsx';

export default function NotificationsModal({ visible, onClose, onUpdate }) {
	const colors = useThemeColors();
	const [notifications, setNotifications] = useState([]);
	const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
	const [markAllLoading, setMarkAllLoading] = useState(false);

	useEffect(() => {
		const updateData = () => {
			const notificationData = DataManager.getSortedNotifications();
			setNotifications(notificationData);
		};
		updateData();
		const unsubscribe = DataManager.subscribe(updateData);
		return unsubscribe;
	}, []);

	useEffect(() => {
		if (visible) {
			loadNotifications();
		}
	}, [visible]);

	const loadNotifications = async () => {
		try {
			const result = await DataManager.loadNotifications();
			const currentNotifications = DataManager.getSortedNotifications();
			const isFirstTimeOpen = !hasOpenedBefore;
			if (isFirstTimeOpen) {
				setHasOpenedBefore(true);
			}
			setNotifications(currentNotifications);
		} catch (error) {
			console.error('NotificationsModal: Failed to load notifications:', error);
		}
	};

	const markRead = useCallback(async (item) => {
		try {
			await DataManager.markNotificationAsRead(item.id);
			if (onUpdate) {
				onUpdate(item.id);
			}
			onClose();
			setTimeout(() => handleNotificationNavigation(item), 100);
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	}, [onUpdate, onClose]);

	const markAllRead = async () => {
		if (markAllLoading) return;
		try {
			setMarkAllLoading(true);
			await DataManager.markNotificationAsRead(0);
			if (onUpdate) {
				onUpdate('ALL');
			}
		} catch (error) {
			console.error('Error marking all notifications as read:', error);
		} finally {
			setMarkAllLoading(false);
		}
	};

	const handleNotificationNavigation = (notification) => {
		if (!notification) return;
		try {
			// Only route through Loading for battles (which require data refresh). For other
			// notification types (e.g. badges) route immediately to avoid showing the Loading screen.
			const rawType = notification?.type ?? notification?.sourceType ?? notification?.data?.sourceType;
			const type = String(rawType || '').toLowerCase();
			console.log('[NotificationsModal] handleNotificationNavigation called with notification:', notification, 'resolvedType:', type);
			if (type === 'battle' || type === 'battles') {
				// Store pending navigation and go to Loading — LoadingScreen will execute the navigation
				setPendingNotificationNavigation({
					sourceType: notification?.type ?? notification?.sourceType ?? notification?.data?.sourceType,
					sourceId: notification?.id ?? notification?.sourceId ?? notification?.data?.sourceId,
					data: notification?.data ?? {}
				});
				resetRoot({ index: 0, routes: [{ name: 'Loading' }] });
			} else {
				// Directly execute the navigation for non-battle notifications
				executeNotificationNavigation(notification);
			}
		} catch (err) {
			console.warn('[NotificationsModal] Failed to navigate via Loading, falling back:', err);
			executeNotificationNavigation(notification);
		}
	};

	const renderItem = (item, index) => {
		const unread = item.readAt === null;
		const itemStyle = {
			...styles.item,
			borderColor: unread ? colors.secondary + '66' : colors.text + '15',
			backgroundColor: unread ? colors.secondary + '18' : colors.card + '55',
		};
		const iconWrapStyle = {
			...styles.itemIconWrap,
			backgroundColor: unread ? colors.secondary + '33' : '#ffffff10'
		};
		const titleStyle = {
			...styles.itemTitle,
			color: colors.text
		};
		const messageStyle = {
			...styles.itemMessage,
			color: colors.text + 'DD'
		};
		const descStyle = {
			...styles.itemDesc,
			color: colors.text + 'AA'
		};
		const dotStyle = {
			...styles.unreadDot,
			backgroundColor: colors.secondary
		};

		return (
			<button
				key={item.id}
				onClick={() => markRead(item)}
				style={itemStyle}
				aria-label={`Notificação: ${item.title}`}
			>
				<div style={iconWrapStyle}>
					<LucideIcon name={iconForType(item.type)} size={22} color={unread ? colors.secondary : colors.text} />
				</div>
				<div style={styles.textContainer}>
					<span style={titleStyle}>{item.title}</span>
					{item.message && (
						<span style={messageStyle}>{item.message}</span>
					)}
					<span style={descStyle}>{item.description || item.desc}</span>
				</div>
				{unread && <div style={dotStyle} />}
			</button>
		);
	};

	if (!visible) return null;

	const backdropStyle = {
		...styles.backdrop,
		backgroundColor: '#00000088'
	};
	const panelStyle = {
		...styles.panel,
		backgroundColor: colors.background,
		borderColor: colors.text + '20'
	};
	const titleStyle = {
		...styles.title,
		color: colors.text
	};
	const markAllBtnStyle = {
		...styles.markAllBtn,
		opacity: markAllLoading ? 0.6 : 1,
		borderColor: colors.text + '33',
		backgroundColor: colors.card + '55'
	};
	const markAllTextStyle = {
		...styles.markAllText,
		color: colors.text
	};

	return (
		<div style={styles.modalContainer}>
			<div style={backdropStyle}>
				<button style={styles.backdropButton} onClick={onClose} aria-label="Fechar notificações" />
				<div style={panelStyle}>
					<div style={styles.header}>
						<span style={titleStyle}>Notificações</span>
						<div style={styles.headerRight}>
							<button
								style={markAllBtnStyle}
								onClick={markAllRead}
								disabled={markAllLoading}
								aria-label="Limpar (marcar todas as notificações como lidas)"
							>
								{markAllLoading ? (
									<span style={markAllTextStyle}>...</span>
								) : (
									<span style={markAllTextStyle}>Limpar</span>
								)}
							</button>
						</div>
					</div>
					<div style={styles.listContainer}>
						{notifications.length === 0 ? (
							<span style={{...styles.emptyText, color: colors.text + '88'}}>Sem notificações</span>
						) : (
							notifications.map((item, index) => (
								<div key={item.id} style={{ marginBottom: index < notifications.length - 1 ? 10 : 0 }}>
									{renderItem(item, index)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function iconForType(type) {
	switch (type) {
		case 'chest': return 'gift';
		case 'tribe': return 'users';
		case 'battle': return 'swords';
		default: return 'bell';
	}
}

const styles = {
	modalContainer: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
		display: 'flex',
	},
	backdrop: {
		flex: 1,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 12,
		paddingRight: 12,
	},
	backdropButton: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
	},
	panel: {
		borderRadius: 24,
		padding: 16,
		borderWidth: 1,
		borderStyle: 'solid',
		width: '100%',
		maxWidth: 440,
		position: 'relative',
		zIndex: 1,
	},
	header: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 8,
		paddingTop: 4,
		paddingBottom: 4,
		position: 'relative',
	},
	headerRight: {
		position: 'absolute',
		right: 0,
		top: 0,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 2,
		paddingBottom: 2,
	},
	markAllBtn: {
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 6,
		paddingBottom: 6,
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 18,
		minHeight: 32,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		cursor: 'pointer',
		background: 'transparent',
	},
	markAllText: {
		fontSize: 11,
		fontFamily: family.bold,
		letterSpacing: 0.5,
		textTransform: 'uppercase',
		lineHeight: '14px',
	},
	title: {
		fontSize: 18,
		fontFamily: family.bold,
	},
	listContainer: {
		maxHeight: 520,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
	},
	item: {
		display: 'flex',
		flexDirection: 'row',
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 18,
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 12,
		paddingRight: 12,
		gap: 12,
		alignItems: 'flex-start',
		cursor: 'pointer',
		background: 'transparent',
		textAlign: 'left',
		width: '100%',
	},
	itemIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 12,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 2,
	},
	textContainer: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
	},
	itemTitle: {
		fontSize: 14,
		fontFamily: family.bold,
		marginBottom: 2,
	},
	itemMessage: {
		fontSize: 13,
		fontFamily: family.semibold,
		lineHeight: '18px',
		marginBottom: 2,
	},
	itemDesc: {
		fontSize: 12,
		fontFamily: family.medium,
		lineHeight: '16px',
	},
	unreadDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginLeft: 6,
	},
	emptyText: {
		textAlign: 'center',
		paddingTop: 16,
		paddingBottom: 16,
	},
};
