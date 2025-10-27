import React, { useState } from 'react';
import TextInputField from '../../components/LoginComponents/TextInput.jsx';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton.jsx';
import Button2 from '../../components/General/Button2.jsx';
import MessageModal from '../../components/General/MessageModal.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.jsx';

// Logo from public folder
const logoSource = '/assets/logo.png';

export default function ForgotScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth > 600 ? 600 : window.innerWidth;
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);

	const isTablet = width >= 768;
	const logoWidthPercent = isTablet ? 0.6 : 0.92;
	const logoWidth = Math.min(width * logoWidthPercent, 720);
	// use same crop/shift as LoginScreen to keep logo position consistent
	const logoCropFactor = 0.8;
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.06;

	async function handleSubmit() {
		if (!email) {
			window.alert(translate('forgot.fillEmail') || 'Por favor, introduza o seu email.');
			return;
		}
		setIsLoading(true);
		try {
			const response = await ApiManager.forgotPassword(email);
			setModalMessage(response.message || 'Request processed');
			setIsSuccess(response.success || false);
			setModalVisible(true);
		} catch (error) {
			console.error('Forgot password error:', error);
			setModalMessage(error.message || 'Não foi possível enviar o email.');
			setIsSuccess(false);
			setModalVisible(true);
		} finally {
			setIsLoading(false);
		}
	}

	function handleModalClose() {
		setModalVisible(false);
		if (isSuccess) {
			navigation.goBack();
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
			<div style={{ 
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: width > 420 ? 'center' : 'flex-start',
				padding: width > 420 ? '4% 6% 12%' : '6% 6% 10%'
			}}>
				{/* Logo */}
				<div style={{ 
					display: 'flex',
					alignItems: 'center',
					paddingTop: '2%',
					marginBottom: '6%',
					height: Math.min(logoVisibleHeight, 260)
				}}>
					<div style={{ overflow: 'hidden', width: logoWidth, height: logoVisibleHeight, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
						<img
							src={logoSource}
							alt="App logo"
							style={{ width: logoWidth, height: logoWidth, objectFit: 'contain', transform: `translateY(${logoVerticalShift}px)` }}
						/>
					</div>
				</div>

				{/* Form */}
				<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					<div style={{ width: '100%', marginBottom: '2%' }}>
						<span style={{...styles.title, color: colors.text}}>{translate('forgot.title') || 'Recuperar palavra‑passe'}</span>
						<TextInputField
							value={email}
							onChangeText={setEmail}
							placeholder={translate('login.email') || 'Email'}
							label={translate('login.email') || 'Email'}
							keyboardType="email-address"
							icon="email"
							containerStyle={{ maxWidth: Math.min(480, width - 48) }}
						/>
					</div>

					<PrimaryButton
						title={translate('forgot.send') || 'Enviar email de recuperação'}
						onClick={handleSubmit}
						disabled={!email || isLoading}
						loading={isLoading}
					/>
				</div>
			</div>
			<MessageModal
				visible={modalVisible}
				title={isSuccess ? 'Sucesso' : 'Erro'}
				message={modalMessage}
				onClose={handleModalClose}
			/>
		</div>
	);
}

const styles = {
	safe: { flex: 1 },
	topBar: { paddingLeft: '3%', paddingRight: '3%', paddingTop: '2%', zIndex: 10 },
	flex: { flex: 1 },
	scrollContent: {
		flexGrow: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		paddingLeft: '6%',
		paddingRight: '6%',
		paddingBottom: '12%',
		paddingTop: '4%',
		minHeight: '100%'
	},
	logoArea: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	logoCrop: {
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	formBlock: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: 16
	},
	title: {
		fontSize: 24,
		fontWeight: '600',
		textAlign: 'center',
		marginBottom: 16
	},
	inputsContainer: {
		width: '100%',
		marginBottom: 8
	},
};
