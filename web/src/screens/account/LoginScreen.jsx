import React, { useState, useEffect, useRef } from 'react';
import TextInputField from '../../components/LoginComponents/TextInput.jsx';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.js';
import DataManager from '../../services/DataManager.jsx';

// Local require for logo (as per instruction uses assets/logo.png)
const logoSource = '/assets/logo.png';

export default function LoginScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const width = window.innerWidth > 600 ? 600 : window.innerWidth;
	const isTablet = width >= 768;
	const logoWidthPercent = isTablet ? 0.6 : 0.92;
	const logoWidth = width * logoWidthPercent;
	const logoCropFactor = 0.55;
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.20;

	async function onSubmit() {
		if (!email || !password) {
			window.alert(translate('login.fillFields') || 'Por favor, preencha todos os campos.');
			return;
		}

		setIsLoading(true);
		
		try {
			// Call login via ApiManager directly
			const loginResult = await ApiManager.login(email, password);
			
			if (loginResult && loginResult.success) {
				// Store user config if available
				if (loginResult.user) {
					try {
						DataManager.setUserConfig({
							randomPosition: loginResult.user.randomPosition,
							fullAccess: loginResult.user.fullAccess
						});
					} catch (error) {
						console.warn('Failed to set user config:', error);
					}
				}

				// Check if user needs to reset password
				if (loginResult.resetPassword === 1) {
					navigation?.replace?.('Password', { currentPassword: password });
				} else {
					// Login successful - navigate to loading screen
					navigation?.replace?.('Loading');
				}
			} else {
				window.alert(translate('login.unexpectedError') || 'Resposta inesperada do servidor.');
			}
		} catch (error) {
			console.error('Login error:', error);
			
			let errorMessage = translate('login.loginFailed') || 'Falha no login. Verifique as suas credenciais.';
			
			if (error.status === 401) {
				errorMessage = translate('login.invalidCredentials') || 'Email ou palavra-passe incorretos.';
			} else if (error.status === 500) {
				errorMessage = translate('login.serverError') || 'Erro do servidor. Tente novamente mais tarde.';
			} else if (error.status === 408) {
				errorMessage = translate('login.timeout') || 'Tempo limite excedido. Verifique a sua ligação à internet.';
			}
			
			window.alert(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
			<div style={{ 
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '4% 6% 12%'
			}}>
				{/* Logo */}
				<div style={{ 
					display: 'flex',
					alignItems: 'center',
					paddingTop: '2%',
					marginBottom: '8%',
					height: logoVisibleHeight
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
						<TextInputField
							value={email}
							onChangeText={setEmail}
							placeholder={translate('login.email') || 'Email'}
							keyboardType="email-address"
							icon="email"
						/>
						<TextInputField
							value={password}
							onChangeText={setPassword}
							placeholder={translate('login.password') || 'Palavra-passe'}
							secureTextEntry
							icon="password"
						/>
					</div>
					<button 
						style={{ 
							width: '100%', 
							display: 'flex', 
							alignItems: 'flex-end', 
							marginTop: '2%', 
							marginBottom: '6%',
							background: 'none',
							border: 'none',
							padding: 0,
							cursor: 'pointer'
						}} 
						onClick={() => navigation.navigate('Forgot')}
					>
						<span style={{ fontSize: Math.max(12, width * 0.035), color: colors.text + '99' }}>
							{translate('login.forgot') || 'Esqueceste a palavra-passe?'}
						</span>
					</button>
					<PrimaryButton
						title={translate('login.enter') || 'Entrar'}
						onClick={onSubmit}
						disabled={!email || !password || isLoading}
						loading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
