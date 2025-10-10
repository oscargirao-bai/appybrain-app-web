import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import DataManager from '../../services/DataManager';
import Header from '../../components/General/Header';
import NotificationBadge from '../../components/General/NotificationBadge';
import Icon from '@react-native-vector-icons/lucide';
import { useNavigation } from '@react-navigation/native';
import NotificationsModal from '../../components/Learn/NotificationsModal';
import NewsList from '../../components/News/NewsList';

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
		<View style={[styles.container, { backgroundColor: colors.background }]}> 
			<Header 
				title="Noticias" 
				right={(
					<View style={{ position: 'relative' }}>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="Notificações"
							onPress={() => setNotificationsOpen(true)}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
							style={{ paddingHorizontal: 4 }}
						>
							<Icon name="bell" size={22} color={colors.text} />
						</TouchableOpacity>
						<NotificationBadge count={unreadNotificationsCount} />
					</View>
				)}
				extraRight={(
					<TouchableOpacity
						accessibilityRole="button"
						accessibilityLabel="Abrir definições"
						onPress={() => navigation.navigate('Settings')}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ paddingHorizontal: 4 }}
					>
						<Icon name="settings" size={22} color={colors.text} />
					</TouchableOpacity>
				)}
			/>
			<View style={[styles.body, { backgroundColor: colors.background }]}> 
				<NewsList />
			</View>
			<NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	body: { flex: 1, paddingHorizontal: 0, paddingTop: 20 },
	title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
	subtitle: { fontSize: 16, fontWeight: '500' },
});

