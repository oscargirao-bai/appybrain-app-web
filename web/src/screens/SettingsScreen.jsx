import React, { useState, useCallback, useEffect } from 'react';

import Header from '../components/General/Header.jsx';
import { useThemeColors } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import { family } from '../constants/font.jsx';
import apiManagerInstance from '../services/ApiManager.jsx';
import DataManager from '../services/DataManager.jsx';
import Button3 from '../components/General/Button3.jsx';
import ButtonLightDark from '../components/Settings/ButtonLightDark.jsx';
import Button4 from '../components/General/Button4.jsx';
import PrivacyModal from '../components/Settings/PrivacyModal.jsx';
import ChangeNameModal from '../components/Settings/ChangeNameModal.jsx';
import MessageModal from '../components/General/MessageModal.jsx';

export default function SettingsScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [vibration, setVibration] = useState(true);
	const [privacyOpen, setPrivacyOpen] = useState(false);
	const [changeNameOpen, setChangeNameOpen] = useState(false);
	const [currentUserName, setCurrentUserName] = useState('');
	const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '' });

	useEffect(() => {
		const updateData = () => {
			const userData = DataManager.getUser();
			setCurrentUserName(userData?.nickname || userData?.firstName || '');
		};
		updateData();
		const unsubscribe = DataManager.subscribe(updateData);
		return unsubscribe;
	}, []);

	const handleVibrationChange = useCallback((val) => {
		setVibration(val);
	}, []);

	const handleChangeName = async (newNickname) => {
		setChangeNameOpen(false);
		try {
			await apiManagerInstance.updateNickname(newNickname);
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
		const confirmed = window.confirm('Tem a certeza de que deseja terminar a sessão?');
		if (confirmed) {
			(async () => {
				try {
					await apiManagerInstance.logout();
					navigation.replace('Login');
				} catch (error) {
					console.error('Logout error:', error);
					navigation.replace('Login');
				}
			})();
		}
	}, [navigation]);

	const INSTAGRAM_URL = 'https://www.instagram.com/appy_brain/';
	const handleOpenInstagram = useCallback(() => {
		try {
			window.open(INSTAGRAM_URL, '_blank');
		} catch (err) {
			console.error('Error opening Instagram:', err);
			window.alert('Não foi possível abrir o link.');
		}
	}, []);

	return (
		<div style={{ ...styles.container, backgroundColor: colors.background }}>
			<Header
				title={translate('settings.settings')}
				showBack
				onBack={() => navigation.goBack()}
			/>
			<div style={styles.scrollContent}>
				<div style={{ ...styles.centerWrap }}>
					<div style={styles.content}>
					<div style={{ ...styles.sectionTitle, color: colors.text }}>{translate('profile.overviewTitle')}</div>
					<Button4
						label={translate('profile.customize')}
						onClick={() => navigation.navigate('Customize')}
						aria-label={translate('profile.customize')}
					/>
					<Button4
						label={translate('settings.customizeProfile')}
						onClick={() => setChangeNameOpen(true)}
						aria-label={translate('settings.customizeProfile')}
					/>

					<div style={{ ...styles.sectionTitle, color: colors.text }}>{translate('settings.general')}</div>
					<Button3
						icon="vibrate"
						label={translate('settings.vibrations')}
						value={vibration}
						onValueChange={handleVibrationChange}
						accessibilityLabel={translate('settings.vibrations')}
					/>
					<ButtonLightDark />

					<div style={{ ...styles.sectionTitle, color: colors.text, marginTop: 24 }}>{translate('settings.account')}</div>
					<Button4
						label={translate('settings.privacyPolicy')}
						onClick={() => setPrivacyOpen(true)}
						aria-label={translate('settings.privacyPolicy')}
					/>
					<Button4
						label={translate('settings.logout')}
						onClick={handleLogout}
						danger
						aria-label={translate('settings.logout')}
					/>
					</div>
				</div>
			</div>

			<div style={styles.instagramRow}>
				<button
					style={styles.instagramBtn}
					onClick={handleOpenInstagram}
					onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
					onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
					aria-label="Abrir Instagram do Appy Brain"
				>
					<img src="/assets/Instagram_Glyph_Gradient.png" style={styles.instagramImg} alt="Instagram" />
					<span style={{ ...styles.instagramText, color: colors.text }}>appy_brain</span>
				</button>
			</div>

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
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		height: '100vh',
		width: '100%',
	},
	scrollContent: {
		flex: 1,
		overflowY: 'auto',
		overflowX: 'hidden',
	},
	centerWrap: {
		display: 'flex',
		justifyContent: 'center',
		width: '100%',
	},
	content: {
		padding: 16,
		width: '50%',
		maxWidth: 560,
		minWidth: 340,
		margin: '0 auto',
		paddingBottom: 40,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '700',
		fontFamily: family.bold,
		marginBottom: 12,
	},
	instagramRow: {
		padding: 16,
		marginTop: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	instagramBtn: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 6,
		paddingBottom: 6,
		background: 'transparent',
		border: 'none',
		cursor: 'pointer',
		transition: 'opacity 0.2s',
	},
	instagramImg: {
		width: 28,
		height: 28,
		objectFit: 'contain',
		marginRight: 10,
	},
	instagramText: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
		textAlign: 'center',
	},
};

