import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import Icon from '@react-native-vector-icons/lucide';
import DataManager from '../../services/DataManager';
import { navigationRef } from '../../services/navigationRef';
import { family } from '../../constants/font';

export default function NotificationsModal({ visible, onClose, onUpdate }) {
	const colors = useThemeColors();
	const [notifications, setNotifications] = useState([]);
	const [notificationAnimations, setNotificationAnimations] = useState([]);
	const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
	const [markAllLoading, setMarkAllLoading] = useState(false);

	// Subscribe to DataManager updates
	useEffect(() => {
		const updateData = () => {
			const notificationData = DataManager.getSortedNotifications();
			setNotifications(notificationData);
			// Don't create animations here - let loadNotifications() handle them when modal opens
		};

		// Initial load
		updateData();

		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);

		// Cleanup subscription
		return unsubscribe;
	}, []);

	// Load notifications when modal becomes visible
	useEffect(() => {
		if (visible) {
			loadNotifications();
		}
	}, [visible]);

	const loadNotifications = async () => {
		try {
			const result = await DataManager.loadNotifications();
			const currentNotifications = DataManager.getSortedNotifications();
			
			// Determine if we should animate items
			const isFirstTimeOpen = !hasOpenedBefore;
			const needsAnimations = notificationAnimations.length !== currentNotifications.length;
			const shouldAnimateItems = isFirstTimeOpen || (result.hasChanges && result.newItems.length > 0);
			
			if (isFirstTimeOpen) {
				setHasOpenedBefore(true);
				//console.log('NotificationsModal: First time opening, animating all items');
			}
			
			// Always create animations if they don't exist
			if (needsAnimations || shouldAnimateItems) {
				//console.log('NotificationsModal: Creating animations for items');
				
				// Create animations for items
				const animations = currentNotifications.map((item) => {
					// If first time opening, animate all items
					// Otherwise, only animate new items
					const shouldAnimateItem = isFirstTimeOpen || result.newItems.includes(item.id);
					
					// Find existing animation if item already exists
					const existingIndex = notifications.findIndex(existingItem => existingItem.id === item.id);
					const existingAnimation = existingIndex >= 0 ? notificationAnimations[existingIndex] : null;
					
					if (existingAnimation && !shouldAnimateItem) {
						return existingAnimation;
					} else {
						return {
							translateY: new Animated.Value(shouldAnimateItem ? 30 : 0),
							opacity: new Animated.Value(shouldAnimateItem ? 0 : 1)
						};
					}
				});
				
				setNotificationAnimations(animations);
				
				// Only animate items that should be animated
				if (shouldAnimateItems) {
					setTimeout(() => {
						let animationDelay = 0;
						currentNotifications.forEach((item, index) => {
							const shouldAnimateItem = isFirstTimeOpen || result.newItems.includes(item.id);
							if (shouldAnimateItem) {
								const anim = animations[index];
								setTimeout(() => {
									Animated.parallel([
										Animated.timing(anim.translateY, {
											toValue: 0,
											duration: 400,
											useNativeDriver: true,
										}),
										Animated.timing(anim.opacity, {
											toValue: 1,
											duration: 400,
											useNativeDriver: true,
										})
									]).start();
								}, animationDelay);
								animationDelay += 100; // 100ms delay between each item
							}
						});
					}, 50); // Small delay before starting animations
				}
			}
			
		} catch (error) {
			console.error('NotificationsModal: Failed to load notifications:', error);
		}
	};

	const markRead = useCallback(async (notification) => {
		try {
			await DataManager.markNotificationAsRead(notification.id);
			
			// Close the modal
			onClose();
			
			// Navigate based on sourceType
			setTimeout(() => {
				handleNotificationNavigation(notification);
			}, 100);
			
			if (onUpdate) onUpdate(notification.id);
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	}, [onUpdate, onClose]);

	const markAllRead = useCallback(async () => {
		if (markAllLoading) return;
		try {
			setMarkAllLoading(true);
			await DataManager.markNotificationAsRead(0); // 0 = mark all per API contract
			if (onUpdate) onUpdate('ALL');
			// Keep modal open; optionally could close: onClose();
		} catch (e) {
			console.error('Failed to mark all notifications as read:', e);
		} finally {
			setMarkAllLoading(false);
		}
	}, [markAllLoading, onUpdate]);

	const handleNotificationNavigation = (notification) => {
		if (!navigationRef.current) {
			console.error('Navigation ref not available');
			return;
		}

		const { sourceType, sourceId } = notification;
		//console.log('Navigating for notification:', { sourceType, sourceId, notification });

		// Add timestamp to ensure unique navigation calls
		const timestamp = Date.now();

		switch (sourceType) {
			case 'badge':
			case 'badges':
				//console.log('Navigating to Profile with badge modal:', sourceId);
				// Profile is a standalone screen, navigate directly
				navigationRef.current.navigate('Profile', { 
					openBadgeModal: sourceId, 
					timestamp 
				});
				break;
			
			case 'battle':
			case 'battles':
				//console.log('Navigating to Battle screen with history modal and battle result:', sourceId);
				// Battle is inside MainTabs, use screen and params structure
				navigationRef.current.navigate('MainTabs', { 
					screen: 'Battle',
					params: { openBattleResult: sourceId, timestamp }
				});
				break;
			
			case 'tribe':
			case 'tribes':
				//console.log('Navigating to Tribes tab:', sourceId);
				navigationRef.current.navigate('MainTabs', { 
					screen: 'Tribes',
					params: { sourceId, timestamp }
				});
				break;
			
			case 'chest':
			case 'chests':
				//console.log('Navigating to Profile with chests highlight');
				// Profile is a standalone screen, navigate directly
				navigationRef.current.navigate('Profile', { 
					highlightChests: true, 
					timestamp 
				});
				break;
			
			case 'learn':
			case 'content':
				//console.log('Navigating to Learn tab:', sourceId);
				navigationRef.current.navigate('MainTabs', { 
					screen: 'Learn',
					params: { sourceId, timestamp }
				});
				break;
			
			default:
				//console.log('Unknown notification sourceType:', sourceType, 'navigating to Profile');
				navigationRef.current.navigate('Profile', { 
					timestamp 
				});
				break;
		}
	};

	const renderItem = ({ item, index }) => {
		const animation = notificationAnimations[index];
		
		if (!animation) return null;

		const unread = item.readAt === null; // Use readAt field instead of read boolean
		return (
			<Animated.View
				style={[
					{
						transform: [{ translateY: animation.translateY }],
						opacity: animation.opacity
					}
				]}
			>
				<Pressable
					onPress={() => markRead(item)}
					style={({ pressed }) => [
						styles.item,
						{ borderColor: colors.text + '15', backgroundColor: colors.card + '55' },
						unread && { borderColor: colors.secondary + '66', backgroundColor: colors.secondary + '18' },
						pressed && { opacity: 0.85 },
					]}
					accessibilityRole="button"
					accessibilityLabel={`Notificação: ${item.title}`}
				>
					<View style={[styles.itemIconWrap, unread && { backgroundColor: colors.secondary + '33' }]}>
						<Icon name={iconForType(item.type)} size={22} color={unread ? colors.secondary : colors.text} />
					</View>
					<View style={styles.textContainer}>
						<Text style={[styles.itemTitle, { color: colors.text, fontWeight: unread ? '800' : '700' }]} numberOfLines={1}>{item.title}</Text>
						{item.message && (
							<Text style={[styles.itemMessage, { color: colors.text + 'DD' }]} numberOfLines={2}>{item.message}</Text>
						)}
						<Text style={[styles.itemDesc, { color: colors.text + 'AA' }]} numberOfLines={2}>{item.description || item.desc}</Text>
					</View>
					{unread && <View style={[styles.unreadDot, { backgroundColor: colors.secondary }]} />}
				</Pressable>
			</Animated.View>
		);
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={[styles.backdrop, { backgroundColor: '#00000088' }]}> 
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar notificações" />
				<View style={[styles.panel, { backgroundColor: colors.background, borderColor: colors.text + '22' }]}> 
					<View style={styles.header}> 
						<Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
						<View style={styles.headerRight}> 
							<Pressable
								style={({ pressed }) => [styles.markAllBtn, { opacity: pressed || markAllLoading ? 0.6 : 1, borderColor: colors.text + '33', backgroundColor: colors.card + '55' }]}
								onPress={markAllRead}
								accessibilityRole="button"
								accessibilityLabel="Limpar (marcar todas as notificações como lidas)"
							>
								{markAllLoading ? (
									<ActivityIndicator size="small" color={colors.text} />
								) : (
										<Text style={[styles.markAllText, { color: colors.text }]}>Limpar</Text>
								)}
							</Pressable>
						</View>
					</View>
				<FlatList
					data={notifications}
					keyExtractor={(item) => item.id.toString()}
					renderItem={renderItem}
					ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
					contentContainerStyle={{ paddingBottom: 0 }}
						style={{ flexGrow: 0, maxHeight: 520 }}
					ListEmptyComponent={<Text style={{ color: colors.text + '88', textAlign: 'center', paddingVertical: 16 }}>Sem notificações</Text>}
				/>
				</View>
			</View>
		</Modal>
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

const styles = StyleSheet.create({
	backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
	panel: {
		borderRadius: 24,
		padding: 16,
		borderWidth: 1,
		width: '100%',
		maxWidth: 440,
	},
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, paddingVertical: 4 },
	headerRight: { position: 'absolute', right: 0, top: 0, flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
	markAllBtn: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderRadius: 18, minHeight: 32, justifyContent: 'center' },
	markAllText: { fontSize: 11, fontFamily: family.bold, letterSpacing: 0.5, textTransform: 'uppercase', lineHeight: 14 },
	title: { fontSize: 18, fontFamily: family.bold },
	item: {
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 18,
		paddingTop: 12,
		paddingHorizontal: 12,
		gap: 12,
		alignItems: 'flex-start',
	},
	itemIconWrap: { 
		width: 34, 
		height: 34, 
		borderRadius: 12, 
		alignItems: 'center', 
		justifyContent: 'center', 
		backgroundColor: '#ffffff10',
		marginTop: 2,
	},
	textContainer: {
		flex: 1,
		justifyContent: 'flex-start',
	},
	itemTitle: { fontSize: 14, fontFamily: family.bold, marginBottom: 2 },
	itemMessage: { fontSize: 13, fontFamily: family.semibold, lineHeight: 18, marginBottom: 2 },
	itemDesc: { fontSize: 12, fontFamily: family.medium, lineHeight: 16 },
	unreadDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 6 },
});
