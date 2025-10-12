import React, { useState } from 'react';
import TextInputField from '../../components/LoginComponents/TextInput';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton';
import Button2 from '../../components/General/Button2';
import MessageModal from '../../components/General/MessageModal';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import ApiManager from '../../services/ApiManager';

const logoSource = require('../../../assets/logo.png');

export default function ForgotScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth;
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);

	const isTablet = width >= 768;
	const logoWidthPercent = isTablet ? 0.6 : 0.92;
	const logoWidth = width * logoWidthPercent;
	const logoCropFactor = 0.55;
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.20;

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
		<div style={{...styles.safe, backgroundColor: colors.background}}>
			<div style={styles.topBar}>
				<Button2
					iconName="arrow-left"
					size={44}
					onClick={() => navigation?.replace?.('Login')}
				/>
			</div>
			<div style={styles.flex}>
				<div style={styles.scrollContent}>
					<div style={{...styles.logoArea, height: logoVisibleHeight, marginBottom: '8%', pointerEvents: 'none'}}>
						<div style={{...styles.logoCrop, width: logoWidth, height: logoVisibleHeight}}>
							<img
								src={logoSource}
								style={{ width: logoWidth, height: logoWidth, objectFit: 'contain', transform: `translateY(${logoVerticalShift}px)` }}
								aria-label="App logo"
							/>
						</div>
					</div>
					<div style={styles.formBlock}>
						<span style={{...styles.title, color: colors.text}}>
							{translate('forgot.title') || 'Recuperar palavra‑passe'}
						</span>
						<div style={styles.inputsContainer}>
							<TextInputField
								value={email}
								onChangeText={setEmail}
								placeholder={translate('login.email') || 'Email'}
								keyboardType="email-address"
								icon="email"
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
