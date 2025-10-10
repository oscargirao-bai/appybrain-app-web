import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, useWindowDimensions, Platform, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../services/Theme';
import { useTranslate } from '../services/Translate';
import { family } from '../constants/font';
import ApiManager from '../services/ApiManager';
import DataManager from '../services/DataManager';
import { getPendingNotificationNavigation, clearPendingNotificationNavigation } from '../services/navigationRef';
import { executeNotificationNavigation } from '../services/Notifications';

// Try to import SVG, fallback to null if not available (web compatibility)
let Skater = null;
try {
	Skater = require('../../assets/skater.svg').default;
} catch (e) {
	console.warn('[LoadingScreen] Skater SVG not available:', e.message);
}

// Assets
const logo = require('../../assets/logo.png');
const bars = require('../../assets/rainbow.png');

// Loading/Splash screen that appears right after login
// Sketch reference: bright brand yellow background, centered logo, diagonal rainbow-ish bars bottom-right
export default function LoadingScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const { width, height } = useWindowDimensions();
	const logoFade = useRef(new Animated.Value(0)).current;
	const orgLogoFade = useRef(new Animated.Value(0)).current;
	const [currentLoadingText, setCurrentLoadingText] = useState(translate('loading.medals'));
	const [organizationLogoUrl, setOrganizationLogoUrl] = useState(null);
	// Spinner replaces previous progress bar

	// Basic fade-in animation for logo and looping progress bar
	useEffect(() => {
		// Trace entering LoadingScreen
		try { console.log('[boot] LoadingScreen start'); } catch(_) {}
		// Fade in the logo
		Animated.timing(logoFade, { toValue: 1, duration: 650, useNativeDriver: true }).start();

		// (Spinner is native; no custom loop animation required)
		
		// Switch to second loading text after 50% of expected loading time
		const textSwitchTimer = setTimeout(() => {
			setCurrentLoadingText(translate('loading.content'));
		}, 4000); // Switch after 4 seconds (increased from 2 seconds)
		
		// Session validation and data loading
		const initializeApp = async () => {
			try {
				// First, validate session in the background
				const isSessionValid = await ApiManager.validateSession();
				
				if (!isSessionValid) {
					// Session is invalid or doesn't exist, redirect to login
					//console.log('Session invalid, redirecting to login');
					navigation?.replace?.('Login');
					return;
				}
				
				// Session is valid, proceed with loading app data
				//console.log('Session valid, loading app data');
				
				// Initialize DataManager with ApiManager
				DataManager.init(ApiManager);
				
				// Load organization data first (contains logo URL)
				await DataManager.loadOrganizationData();
				
				// Get organization logo URL early
				const orgLogoUrl = DataManager.getOrganizationLogoUrl();
				if (orgLogoUrl) {
					setOrganizationLogoUrl(orgLogoUrl);
				}
				
				// Wait a bit and then switch to second loading text
				setTimeout(() => {
					setCurrentLoadingText(translate('loading.content'));
				}, 2500);
				
				// Load app data through DataManager
				await DataManager.loadAppData();
				
				// Ensure minimum loading time to show both texts
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// Check if there's a pending notification navigation
				const pendingNavigation = getPendingNotificationNavigation();
				
				if (pendingNavigation) {
					console.log('[LoadingScreen] Found pending notification navigation:', pendingNavigation);
					
					// Clear the pending navigation
					clearPendingNotificationNavigation();
					
					// Navigate to main tabs first
					navigation?.replace?.('MainTabs');
					
					// Execute the notification navigation after a brief delay
					setTimeout(() => {
						executeNotificationNavigation(pendingNavigation);
					}, 300);
				} else {
					// Navigate to main tab navigator after data is loaded
					navigation?.replace?.('MainTabs');
				}
			} catch (error) {
				console.error('Failed during app initialization:', error);
				// On error, redirect to login as fallback
				navigation?.replace?.('Login');
			}
		};
		
		initializeApp();
		
		// Cleanup timer on unmount
		return () => {
			clearTimeout(textSwitchTimer);
		};
	}, [logoFade, navigation, translate]);

	// Responsive sizing based on screen dimensions
	const isSmallScreen = width < 375 || height < 667;
	// Base width then enlarged by 50%
	const baseLogoWidth = Math.min(width * (isSmallScreen ? 0.40 : 0.48), 380);
	const logoWidth = Math.min(baseLogoWidth * 1.5, width * 0.95); // increase 50%, cap at 95% screen width
	const baseOrgLogoWidth = Math.min(width * (isSmallScreen ? 0.30 : 0.34), 200);
	const orgLogoWidth = baseOrgLogoWidth * 2; // requested double size

	// Handler for when organization logo loads
	const handleOrgLogoLoad = () => {
		Animated.timing(orgLogoFade, { 
			toValue: 1, 
			duration: 400, 
			useNativeDriver: true 
		}).start();
	};

	// No progress bar; spinner used instead

	// Skater animation (horizontal loop)
	const skaterTranslate = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		const loopAnim = () => {
			// Move from -20% width to 100% width (off-screen right)
			skaterTranslate.setValue(0);
			Animated.timing(skaterTranslate, {
				toValue: 1,
				duration: 6000,
				easing: Animated.Easing?.linear || undefined,
				useNativeDriver: true,
			}).start(() => loopAnim());
		};
		loopAnim();
	}, [skaterTranslate]);

	const skaterWidth = 80; // scale relative to bar height (50)
	const skaterHeight = skaterWidth * (336/241); // preserve aspect ratio
	const translateX = skaterTranslate.interpolate({
		inputRange: [0,1],
		outputRange: [-skaterWidth * 1.2, width + skaterWidth * 0.2],
	});
	const translateY = 0; // position above bars

	return (
		<SafeAreaView style={[styles.safe, { backgroundColor: '#FDD92B' }]}>  
			{/* Top Appybrain logo */}
			<Animated.View style={[styles.topLogoWrapper, { opacity: logoFade }]}>  
				{/* Crop container: hides ~10% top & bottom by scaling to 125% height and shifting up 10% */}
					<View style={{ width: logoWidth, aspectRatio: 1, overflow: 'hidden' }}>
						<Image
							source={logo}
							resizeMode="contain"
							style={{ position: 'absolute', width: '100%', height: '125%', top: '-10%' }}
							accessibilityRole="image"
							accessibilityLabel="Appybrain logo"
						/>
					</View>
			</Animated.View>

			{/* Center block with school logo */}
			<View style={styles.centerArea}> 
				{organizationLogoUrl ? (
					<Animated.Image
						source={{ uri: organizationLogoUrl }}
						resizeMode="contain"
						style={{ width: orgLogoWidth, aspectRatio: 1, opacity: orgLogoFade, borderWidth: 10, borderColor: '#000', borderRadius: 20, backgroundColor: '#fff' }}
						onLoad={handleOrgLogoLoad}
						accessibilityRole="image"
						accessibilityLabel="Logo da escola"
					/>
				) : null}
				<ActivityIndicator size="large" color={colors.black} style={{ marginTop: 28 }} accessibilityLabel="A carregar" />
				<Text style={[styles.loadingText, { color: colors.black }]}>{currentLoadingText}</Text>
			</View>

			{/* Decorative bottom bar with skater animation */}
			<View style={{ position: 'absolute', right: 0, bottom: 0, left: 0 }}>
				<Image
					source={bars}
					resizeMode="cover"
					style={[styles.bars, { width: '100%', height: 50 }]}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				/>
				<Animated.View style={{ position: 'absolute', left: 0, bottom: 50, transform: [{ translateX }, { translateY }] }}>
					{Skater && <Skater width={skaterWidth} height={skaterHeight} />}
				</Animated.View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1 },
	topLogoWrapper: {
		position: 'absolute',
		top: 0, // flush to safe area top
		paddingTop: Platform.OS === 'android' ? 0 : 0,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	centerArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
		// Removed paddingBottom so content stays truly centered between top logo and bottom skater/bar overlay
	},
	loadingText: {
		marginTop: 20,
		fontSize: 18,
		fontWeight: '600',
		fontFamily: family.semibold,
		textAlign: 'center',
		opacity: 0.85,
	},
	bars: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		height: 260,
	},
});

