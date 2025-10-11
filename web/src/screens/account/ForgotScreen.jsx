import React, { useState, useEffect, useRef } from 'react';



import TextInputField from '../../components/LoginComponents/TextInput';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton';
import Button2 from '../../components/General/Button2';
import MessageModal from '../../components/General/MessageModal';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import ApiManager from '../../services/ApiManager';

// Local logo
const logoSource = require('../../../assets/logo.png');

export default function ForgotScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const width = window.innerWidth; const height = window.innerHeight;
	const [email, setEmail] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalMessage, setModalMessage] = useState('');
	const [isSuccess, setIsSuccess] = useState(false);

	const isTablet = width >= 768;
	// Use percentage-based sizing for responsive design - same as login screen
	const logoWidthPercent = isTablet ? 0.6 : 0.92; // 60% on tablet, 92% on mobile for bigger logo
	const logoWidth = width * logoWidthPercent;
	// Visual crop factors (tune these if you replace the asset with one already trimmed)
	const logoCropFactor = 0.55; // portion of square height we want visible
	const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
	const logoVerticalShift = -logoWidth * 0.20; // shift image up to hide bottom/extra whitespace

	// Logo scale animation when keyboard appears (frees vertical space without manual scroll)
	const logoScale = useRef(new Animated.Value(1)).current;
	const logoOpacity = useRef(new Animated.Value(1)).current;
	const [keyboardVisible, setKeyboardVisible] = useState(false);

	// Enhanced keyboard handling with animation
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
							toValue: 0.75, // Scale down to 50% (increased from 40%)
							useNativeDriver: true,
							tension: 100,
							friction: 8
						}),
						Animated.spring(logoOpacity, {
							toValue: 1, // Slight fade
							useNativeDriver: true,
							tension: 100,
							friction: 8
						})
					]).start();
				};
				listeners.push(listener);
			}
		};
		
		// Hide events
		['keyboardWillHide', 'keyboardDidHide'].forEach(eventName => {
			if (events.includes(eventName)) {
				const listener = Keyboard.addListener(eventName, () => {
					//console.log(`${eventName}: Restoring logo`);
					setKeyboardVisible(false);
					
					Animated.parallel([
						Animated.spring(logoScale, {
							toValue: 1, // Scale back to full size
							useNativeDriver: true,
							tension: 100,
							friction: 8
						}),
						Animated.spring(logoOpacity, {
							toValue: 1, // Restore full opacity
							useNativeDriver: true,
							tension: 100,
							friction: 8
						})
					]).start();
				};
				listeners.push(listener);
			}
		};
		
		return () => {
			listeners.forEach(listener => listener.remove());
		});
	}, [logoScale, logoOpacity]);

	async function handleSubmit() {
		if (!email) {
			window.alert(translate('forgot.fillEmail') || 'Por favor, introduza o seu email.'
			);
			return;
		}
		setIsLoading(true);
		try {
			// Use ApiManager's forgotPassword method
			const response = await ApiManager.forgotPassword(email);
			
			// Show modal with response message
			setModalMessage(response.message || 'Request processed');
			setIsSuccess(response.success || false);
			setModalVisible(true);
			
		} catch (error) {
			console.error('Forgot password error:', error);
			// Show error in modal
			setModalMessage(error.message || 'Não foi possível enviar o email.');
			setIsSuccess(false);
			setModalVisible(true);
		} finally {
			setIsLoading(false);
		}
	}

	// Handle modal close
	function handleModalClose() {
		setModalVisible(false);
		if (isSuccess) {
			// If success, go back to login screen
			navigation.goBack();
		}
		// If not success, stay on forgot password screen
	}

	return (
		<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>      
			<div style={styles.topBar}>
				<Button2
					iconName="arrow-left"
					size={44}
					onClick={() => {
						navigation?.replace?.('Login');
					}}
				/>
			</div>
			<div 				style={styles.flex}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
			>
				<div 					style={styles.flex}
					contentContainerStyle={[
						styles.scrollContent,
						keyboardVisible && styles.scrollContentKeyboard // Apply special styles when keyboard is visible
					]}
					keyboardShouldPersistTaps="handled"
					scrollEnabled={true}
					showsVerticalScrollIndicator={false}
				>
					{/* Logo */}
					<div 
						style={{...styles.logoArea, ...{ 
								height: keyboardVisible ? `${Math.round(logoVisibleHeight * 0.5)}px` : logoVisibleHeight}} 
						pointerEvents="none"
					>
						<Animated.View
							style={{ 
								transform: [{ scale: logoScale }], 
								opacity: logoOpacity,
								alignItems: 'center' 
							}}
						>
							<div style={{...styles.logoCrop, ...{ width: logoWidth}}>  
								<img 									source={logoSource}
									style={{ width: logoWidth, height: logoWidth, resizeMode: 'contain', transform: [{ translateY: logoVerticalShift }] }}
									
									aria-label="App logo"
								/>
							</div>
						</Animated.View>
					</div>
					{/* Form */}
					<div style={{...styles.formBlock, ...keyboardVisible && styles.formBlockKeyboard}}>
						<span style={{...styles.title, ...{ color: colors.text }}}>
							{translate('forgot.title') || 'Recuperar palavra‑passe'}
						</span>
						<div style={{...styles.inputsContainer, ...keyboardVisible && styles.inputsContainerKeyboard}}>
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
	topBar: { paddingHorizontal: '3%', paddingTop: '2%', zIndex: 10, elevation: 10 },
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
	title: {
		fontSize: 32, 
		fontWeight: '700', 
		letterSpacing: -1, 
		marginBottom: '6%', 
		textAlign: 'center' 
	},
	inputsContainer: {
		width: '100%',
		marginBottom: '2%' // Use percentage for inputs container margin
	},
	inputsContainerKeyboard: {
		marginBottom: '0.5%', // Very minimal spacing when keyboard is open using percentage
	},
};
