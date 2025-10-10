import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, useWindowDimensions, Platform, Keyboard, Alert, Animated, KeyboardAvoidingView, ScrollView } from 'react-native';
import TextInputField from '../../components/LoginComponents/TextInput';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import ApiManager from '../../services/ApiManager';
import DataManager from '../../services/DataManager';

const logoSource = require('../../../assets/logo.png');

export default function LoginScreen({ onNavigate }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const { width } = useWindowDimensions();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	const isTablet = width >= 768;
	const logoWidthPercent = isTablet ? 0.6 : 0.92;
	const logoWidth = width * logoWidthPercent;
	const logoCropFactor = 0.55;
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.2;

	const styles = StyleSheet.create({
		safe: { flex: 1, backgroundColor: colors.background },
		flex: { flex: 1 },
		scrollContent: {
			flexGrow: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingHorizontal: '6%',
			paddingBottom: '12%',
			paddingTop: '4%',
			minHeight: '100%',
		},
		scrollContentKeyboard: {
			justifyContent: 'flex-start',
			paddingTop: '1%',
			paddingBottom: '1%',
		},
		logoArea: {
			alignItems: 'center',
			paddingTop: '2%',
			marginBottom: '8%',
		},
		logoCrop: { overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start' },
		formBlock: {
			width: '100%',
			alignItems: 'center',
			flex: 0,
			marginTop: 0,
		},
		formBlockKeyboard: {
			marginTop: '-1%',
		},
		inputsContainer: {
			width: '100%',
			marginBottom: '2%',
		},
		inputsContainerKeyboard: {
			marginBottom: '0.5%',
		},
		forgot: {
			width: '100%',
			alignItems: 'flex-end',
			marginTop: '2%',
			marginBottom: '6%',
		},
		forgotKeyboard: {
			marginTop: '0.3%',
			marginBottom: '4%',
		},
		forgotText: { fontSize: Math.max(12, width * 0.035) },
	});

	const logoScale = useRef(new Animated.Value(1)).current;
	const logoOpacity = useRef(new Animated.Value(1)).current;

	useEffect(() => {
		const showEvents = Platform.OS === 'android'
			? ['keyboardDidShow']
			: ['keyboardWillShow', 'keyboardDidShow'];
		const hideEvents = Platform.OS === 'android'
			? ['keyboardDidHide']
			: ['keyboardWillHide', 'keyboardDidHide'];

		const subscriptions = [
			...showEvents.map((eventName) =>
				Keyboard.addListener(eventName, () => {
					setKeyboardVisible(true);
					Animated.parallel([
						Animated.spring(logoScale, {
							toValue: 0.75,
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						}),
						Animated.spring(logoOpacity, {
							toValue: 1,
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						}),
					]).start();
				})
			),
			...hideEvents.map((eventName) =>
				Keyboard.addListener(eventName, () => {
					setKeyboardVisible(false);
					Animated.parallel([
						Animated.spring(logoScale, {
							toValue: 1,
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						}),
						Animated.spring(logoOpacity, {
							toValue: 1,
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						}),
					]).start();
				})
			),
		];

		return () => {
			subscriptions.forEach((sub) => sub?.remove?.());
		};
	}, [logoOpacity, logoScale]);

	const showAlert = (title, message) => {
		if (Platform.OS === 'web') {
			window.alert(`${title}\n${message}`);
		} else {
			Alert.alert(title, message);
		}
	};

	async function onSubmit() {
		if (!email || !password) {
			showAlert(
				translate('login.error') || 'Erro',
				translate('login.fillFields') || 'Por favor, preencha todos os campos.'
			);
			return;
		}

		setIsLoading(true);

		try {
			const loginResult = await ApiManager.login(email, password);

			if (loginResult && loginResult.success) {
				if (loginResult.user) {
					try {
						DataManager.setUserConfig({
							randomPosition: loginResult.user.randomPosition,
							fullAccess: loginResult.user.fullAccess,
						});
					} catch (err) {
						console.warn('Failed to set user config:', err);
					}
				}

				if (loginResult.resetPassword === 1) {
					onNavigate?.('Password');
				} else {
					onNavigate?.('Loading');
				}
			} else {
				showAlert(
					translate('login.error') || 'Erro',
					translate('login.unexpectedError') || 'Resposta inesperada do servidor.'
				);
			}
		} catch (error) {
			console.error('Login error:', error);

			let errorMessage = translate('login.loginFailed') || 'Falha no login. Verifique as suas credenciais.';

			if (error?.status === 401) {
				errorMessage = translate('login.invalidCredentials') || 'Email ou palavra-passe incorretos.';
			} else if (error?.status === 500) {
				errorMessage = translate('login.serverError') || 'Erro do servidor. Tente novamente mais tarde.';
			} else if (error?.status === 408) {
				errorMessage = translate('login.timeout') || 'Tempo limite excedido. Verifique a sua ligação à internet.';
			}

			showAlert(translate('login.error') || 'Erro', errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<View style={styles.safe}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.select({ ios: 0, android: 0, web: 0 })}
			>
				<ScrollView
					style={styles.flex}
					contentContainerStyle={[
						styles.scrollContent,
						keyboardVisible && styles.scrollContentKeyboard,
					]}
					keyboardShouldPersistTaps="handled"
					scrollEnabled
					showsVerticalScrollIndicator={false}
				>
					<View
						style={[
							styles.logoArea,
							{
								height: keyboardVisible ? `${Math.round(logoVisibleHeight * 0.4)}px` : logoVisibleHeight,
								marginBottom: keyboardVisible ? '1%' : '8%',
							},
						]}
						pointerEvents="none"
					>
						<Animated.View
							style={{
								transform: [{ scale: logoScale }],
								opacity: logoOpacity,
								alignItems: 'center',
							}}
						>
							<View style={[styles.logoCrop, { width: logoWidth, height: logoVisibleHeight }]}>
								<Image
									source={logoSource}
									style={{
										width: logoWidth,
										height: logoWidth,
										resizeMode: 'contain',
										transform: [{ translateY: logoVerticalShift }],
									}}
									accessibilityRole="img"
									accessibilityLabel="App logo"
								/>
							</View>
						</Animated.View>
					</View>

					<View style={[styles.formBlock, keyboardVisible && styles.formBlockKeyboard]}>
						<View style={[styles.inputsContainer, keyboardVisible && styles.inputsContainerKeyboard]}>
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
						</View>
						<Pressable
							style={[styles.forgot, keyboardVisible && styles.forgotKeyboard]}
							accessibilityRole="button"
							onPress={() => onNavigate?.('Forgot')}
						>
							<Text style={[styles.forgotText, { color: `${colors.text}99` }]}>
								{translate('login.forgot') || 'Esqueceste a palavra-passe?'}
							</Text>
						</Pressable>
						<PrimaryButton
							title={translate('login.enter') || 'Entrar'}
							onPress={onSubmit}
							disabled={!email || !password || isLoading}
							loading={isLoading}
						/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}
