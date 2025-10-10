import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, useWindowDimensions, Platform, Keyboard, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import TextInputField from '../../components/LoginComponents/TextInput';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import ApiManager from '../../services/ApiManager';
import DataManager from '../../services/DataManager';

// Local require for logo (as per instruction uses assets/logo.png)
const logoSource = require('../../../assets/logo.png');

export default function LoginScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const { width } = useWindowDimensions();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	// password visibility handled inside TextInputField (secureTextEntry + eye toggle)

	const isTablet = width >= 768;
	// Use percentage-based sizing for responsive design
	const logoWidthPercent = isTablet ? 0.6 : 0.92; // 60% on tablet, 92% on mobile for bigger logo
	const logoWidth = width * logoWidthPercent;
	// Visual crop factors (tune these if you replace the asset with one already trimmed)
	const logoCropFactor = 0.55; // portion of square height we want visible
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.20; // shift image up to hide bottom/extra whitespace

	// Define styles inside component to access width for responsive sizing
	const styles = StyleSheet.create({
		safe: { flex: 1 },
		flex: { flex: 1 },
		scrollContent: { 
			flexGrow: 1, 
			alignItems: 'center', 
			justifyContent: 'center', 
			paddingHorizontal: '6%', // Use percentage for horizontal padding
			paddingBottom: '12%', // Use percentage for bottom padding
			paddingTop: '4%', // Use percentage for top padding
			minHeight: '100%' // Ensure content takes at least full height for centering
		},
		scrollContentKeyboard: {
			justifyContent: 'flex-start', // When keyboard is open, align content to top
			paddingTop: '1%', // Use percentage for minimal top padding
			paddingBottom: '1%', // Use percentage for minimal bottom padding to reduce gap
		},
		logoArea: { 
			alignItems: 'center', 
			paddingTop: '2%', // Use percentage for logo area padding
			marginBottom: '8%' // Use percentage for logo margin (overridden by inline styles)
		},
		logoCrop: { overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start' },
		formBlock: { 
			width: '100%', 
			alignItems: 'center',
			flex: 0, // Remove flex so it doesn't expand
			marginTop: 0 // Remove auto margin that was causing issues
		},
		formBlockKeyboard: {
			marginTop: '-1%', // Use percentage to pull form up slightly when keyboard is open
		},
		inputsContainer: {
			width: '100%',
			marginBottom: '2%' // Use percentage for inputs container margin
		},
		inputsContainerKeyboard: {
			marginBottom: '0.5%', // Very minimal spacing when keyboard is open using percentage
		},
		forgot: { width: '100%', alignItems: 'flex-end', marginTop: '2%', marginBottom: '6%' }, // Use percentages
		forgotKeyboard: {
			marginTop: '0.3%', // Use percentage for minimal spacing when keyboard is open
			marginBottom: '4%', // Use percentage for very tight spacing before login button
		},
		forgotText: { fontSize: Math.max(12, width * 0.035) }, // Use responsive font size with minimum of 12px
	});

	// Logo scale animation when keyboard appears (frees vertical space without manual scroll)
	const logoScale = useRef(new Animated.Value(1)).current;
	const logoOpacity = useRef(new Animated.Value(1)).current;
	const [keyboardVisible, setKeyboardVisible] = useState(false);
	
	useEffect(() => {
		// Use multiple keyboard events to ensure detection works across all devices
		const events = Platform.OS === 'android' 
			? ['keyboardDidShow', 'keyboardDidHide']
			: ['keyboardWillShow', 'keyboardDidShow', 'keyboardWillHide', 'keyboardDidHide'];
		
		const listeners = [];
		
		// Show events
		['keyboardWillShow', 'keyboardDidShow'].forEach(eventName => {
			if (events.includes(eventName)) {
				const listener = Keyboard.addListener(eventName, (event) => {
					//console.log(`${eventName}: Shrinking logo`);
					setKeyboardVisible(true);
					Animated.parallel([
						Animated.spring(logoScale, {
							toValue: 0.75, // Increased from 0.6 to 0.75 for bigger logo when keyboard is open
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						}),
						Animated.spring(logoOpacity, {
							toValue: 1, // Keep logo more visible when keyboard is open
							tension: 100,
							friction: 8,
							useNativeDriver: true,
						})
					]).start();
				});
				listeners.push(listener);
			}
		});
		
		// Hide events
		['keyboardWillHide', 'keyboardDidHide'].forEach(eventName => {
			if (events.includes(eventName)) {
				const listener = Keyboard.addListener(eventName, (event) => {
					//console.log(`${eventName}: Restoring logo`);
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
						})
					]).start();
				});
				listeners.push(listener);
			}
		});
		
		return () => { 
			listeners.forEach(listener => listener.remove());
		};
	}, [logoScale, logoOpacity]);

	async function onSubmit() {
		if (!email || !password) {
			Alert.alert(
				translate('login.error') || 'Erro',
				translate('login.fillFields') || 'Por favor, preencha todos os campos.'
			);
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
						// Continue with login even if this fails
					}
				}

				// Check if user needs to reset password
				if (loginResult.resetPassword === 1) {
					// Navigate to PasswordScreen for password reset, passing current password
					navigation?.replace?.('Password', { currentPassword: password });
				} else {
					// Login successful - navigate to loading screen
					navigation?.replace?.('Loading');
				}
			} else {
				// Unexpected response format
				Alert.alert(
					translate('login.error') || 'Erro',
					translate('login.unexpectedError') || 'Resposta inesperada do servidor.'
				);
			}
		} catch (error) {
			// Login failed - show error
			console.error('Login error:', error);
			
			let errorMessage = translate('login.loginFailed') || 'Falha no login. Verifique as suas credenciais.';
			
			// Handle specific error cases
			if (error.status === 401) {
				errorMessage = translate('login.invalidCredentials') || 'Email ou palavra-passe incorretos.';
			} else if (error.status === 500) {
				errorMessage = translate('login.serverError') || 'Erro do servidor. Tente novamente mais tarde.';
			} else if (error.status === 408) {
				errorMessage = translate('login.timeout') || 'Tempo limite excedido. Verifique a sua ligação à internet.';
			}
			
			Alert.alert(
				translate('login.error') || 'Erro',
				errorMessage
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
			>
				<ScrollView
					style={styles.flex}
					contentContainerStyle={[
						styles.scrollContent,
						keyboardVisible && styles.scrollContentKeyboard // Apply special styles when keyboard is visible
					]}
					keyboardShouldPersistTaps="handled"
					scrollEnabled={true}
					showsVerticalScrollIndicator={false}
				>
					{/* Logo */}
					<View 
						style={[
							styles.logoArea, 
							{ 
								height: keyboardVisible ? `${Math.round(logoVisibleHeight * 0.4)}px` : logoVisibleHeight, // Use 40% of original height when keyboard visible
								marginBottom: keyboardVisible ? '1%' : '8%' // Use percentage margins for better scaling
							}
						]} 
						pointerEvents="none"
					>
						<Animated.View
							style={{ 
								transform: [{ scale: logoScale }], 
								opacity: logoOpacity,
								alignItems: 'center' 
							}}
						>
							<View style={[styles.logoCrop, { width: logoWidth, height: logoVisibleHeight }]}> 
								<Image
									source={logoSource}
									style={{ width: logoWidth, height: logoWidth, resizeMode: 'contain', transform: [{ translateY: logoVerticalShift }] }}
									accessibilityRole="image"
									accessibilityLabel="App logo"
								/>
							</View>
						</Animated.View>
					</View>
					{/* Form */}
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
						<Pressable style={[styles.forgot, keyboardVisible && styles.forgotKeyboard]} accessibilityRole="button" onPress={() => navigation.navigate('Forgot')}>
							<Text style={[styles.forgotText, { color: colors.text + '99' }]}> 
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
		</SafeAreaView>
	);
}
