import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/General/Header';
import { useThemeColors } from '../services/Theme';
import { useTranslate } from '../services/Translate';
import { family } from '../constants/font';
import apiManagerInstance from '../services/ApiManager';
import DataManager from '../services/DataManager';
import Button3 from '../components/General/Button3';
import ButtonLightDark from '../components/Settings/ButtonLightDark';
import ButtonLanguage from '../components/Settings/ButtonLanguage';
import Button4 from '../components/General/Button4.js';
import PrivacyModal from '../components/Settings/PrivacyModal';
import ChangeNameModal from '../components/Settings/ChangeNameModal';
import MessageModal from '../components/General/MessageModal';

export default function SettingsScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [vibration, setVibration] = useState(true); // placeholder state
	const [privacyOpen, setPrivacyOpen] = useState(false);
	const [changeNameOpen, setChangeNameOpen] = useState(false);
	const [currentUserName, setCurrentUserName] = useState('');
	const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '' });

	// Load current user name
	useEffect(() => {
		const updateData = () => {
			const userData = DataManager.getUser();
			setCurrentUserName(userData?.nickname || userData?.firstName || '');
		};
		
		// Initial load
		updateData();
		
		// Subscribe to DataManager changes
		const unsubscribe = DataManager.subscribe(updateData);
		
		return unsubscribe;
	}, []);

	const handleVibrationChange = useCallback((val) => {
		setVibration(val);
		// Futuro: persistir em AsyncStorage ou contexto global
	}, []);

    const handleChangeName = async (newNickname) => {
        setChangeNameOpen(false);
        try {
            await apiManagerInstance.updateNickname(newNickname);
            // Success - refresh user data and update current name
            await DataManager.refreshSection('userInfo');
            setCurrentUserName(newNickname);
        } catch (error) {
            console.error('Error updating nickname:', error);
            if (error.status === 409) {
                setMessageModal({
                    title: translate('error'),
                    message: translate('settings.nick_in_use'),
                    visible: true,
                });
            } else {
                setMessageModal({
                    title: translate('error'),
                    message: translate('settings.nick_error'),
                    visible: true,
                });
            }
        }
    };

    const handleLogout = useCallback(() => {
		Alert.alert(
			'Confirmar Logout',
			'Tem a certeza de que deseja terminar a sessão?',
			[
				{
					text: 'Cancelar',
					style: 'cancel'
				},
				{
					text: 'Sim, sair',
					style: 'destructive',
					onPress: async () => {
						try {
							await apiManagerInstance.logout();
							// Navigate to login screen
							navigation.replace('Login');
						} catch (error) {
							console.error('Logout error:', error);
							// Still navigate to login even if logout fails
							navigation.replace('Login');
						}
					}
				}
			]
		);
	}, [navigation]);

	// Open Instagram link
	const INSTAGRAM_URL = 'https://www.instagram.com/appy_brain/';
	const handleOpenInstagram = useCallback(async () => {
		try {
			const supported = await Linking.canOpenURL(INSTAGRAM_URL);
			if (supported) {
				await Linking.openURL(INSTAGRAM_URL);
			} else {
				Alert.alert('Erro', 'Não foi possível abrir o link.');
			}
		} catch (err) {
			console.error('Error opening Instagram:', err);
			Alert.alert('Erro', 'Não foi possível abrir o link.');
		}
	}, []);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<Header
				title={translate('settings.settings')}
				showBack
				onBack={() => navigation.goBack()}
			/>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('profile.overviewTitle')}</Text>
				<Button4
					label={translate('profile.customize')}
					onPress={() => navigation.navigate('Customize')}
					accessibilityLabel={translate('profile.customize')}
				/>
				<Button4
					label={translate('settings.customizeProfile')}
					onPress={() => setChangeNameOpen(true)}
					accessibilityLabel={translate('settings.customizeProfile')}
				/>

				<Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('settings.general')}</Text>
				<Button3
					icon={vibration ? 'vibrate' : 'vibrate'}
					label={translate('settings.vibrations')}
					value={vibration}
					onValueChange={handleVibrationChange}
					accessibilityLabel={translate('settings.vibrations')}
				/>
				<ButtonLightDark />
				{/* <ButtonLanguage /> */}

				<Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>{translate('settings.account')}</Text>
				<Button4
					label={translate('settings.privacyPolicy')}
					onPress={() => setPrivacyOpen(true)}
					accessibilityLabel={translate('settings.privacyPolicy')}
				/>
				<Button4
					label={translate('settings.logout')}
					onPress={handleLogout}
					danger
					accessibilityLabel={translate('settings.logout')}
				/>
			</ScrollView>

			{/* Instagram link button - bottom */}
			<View style={styles.instagramRow}>
				<Pressable
					style={({ pressed }) => [styles.instagramBtn, pressed && { opacity: 0.8 }]}
					onPress={handleOpenInstagram}
					accessibilityRole="link"
					accessibilityLabel="Abrir Instagram do Appy Brain"
				>
					<Image source={require('../../assets/Instagram_Glyph_Gradient.png')} style={styles.instagramImg} />
					<Text style={[styles.instagramText, { color: colors.text }]}>appy_brain</Text>
				</Pressable>
			</View>
			<ChangeNameModal
				visible={changeNameOpen}
				currentName={currentUserName}
				onCancel={() => setChangeNameOpen(false)}
				onConfirm={handleChangeName}
			/>
			<PrivacyModal visible={privacyOpen} onClose={() => setPrivacyOpen(false)} />
			<MessageModal
				visible={messageModal.visible}
				title={messageModal.title}
				message={messageModal.message}
				onClose={() => setMessageModal({ visible: false, title: '', message: '' })}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 16, paddingBottom: 40 },
	sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: family.bold, marginBottom: 12 },
	card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
	cardTitle: { fontSize: 16, fontWeight: '700', fontFamily: family.bold, marginBottom: 4 },
	cardDesc: { fontSize: 13, fontWeight: '500', fontFamily: family.medium, lineHeight: 18 },
	instagramRow: { padding: 16, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
	instagramBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
	instagramImg: { width: 28, height: 28, resizeMode: 'contain', marginRight: 10 },
	instagramText: { fontSize: 16, fontWeight: '700', fontFamily: family.bold, textAlign: 'center' },
});

