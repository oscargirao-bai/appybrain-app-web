import React, { useEffect, useRef, useState } from 'react';
import { useThemeColors } from '../services/Theme.jsx';
import { useTranslate } from '../services/Translate.jsx';
import ApiManager from '../services/ApiManager.jsx';
import DataManager from '../services/DataManager.jsx';
import { getPendingNotificationNavigation, clearPendingNotificationNavigation } from '../services/navigationRef.jsx';
import { executeNotificationNavigation } from '../services/Notifications.jsx';

// Assets
const logo = '/assets/logo.png';
const bars = '/assets/rainbow.png';
const skater = '/assets/skater.svg';

// Loading/Splash screen that appears right after login
// Sketch reference: bright brand yellow background, centered logo, diagonal rainbow-ish bars bottom-right
export default function LoadingScreen({ navigation }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const [logoOpacity, setLogoOpacity] = useState(0);
	const [orgLogoOpacity, setOrgLogoOpacity] = useState(0);
	const [currentLoadingText, setCurrentLoadingText] = useState(translate('loading.medals'));
	const [organizationLogoUrl, setOrganizationLogoUrl] = useState(null);
	const [skaterX, setSkaterX] = useState(-100);

	// Basic fade-in animation for logo and looping progress bar
	useEffect(() => {
		// Fade in the logo
		setTimeout(() => setLogoOpacity(1), 50);
		
		// Switch to second loading text after 50% of expected loading time
		const textSwitchTimer = setTimeout(() => {
			setCurrentLoadingText(translate('loading.content'));
		}, 4000);
		
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
	}, [navigation, translate]);

	// Responsive sizing based on screen dimensions
	const width = window.innerWidth;
	const height = window.innerHeight;
	const isSmallScreen = width < 375 || height < 667;
	const baseLogoWidth = Math.min(width * (isSmallScreen ? 0.40 : 0.48), 380);
	// Reduce AppyBrain logo to 75% of previous size
	const logoWidth = Math.min(baseLogoWidth * 1.5 * 0.75, width * 0.95);
	const baseOrgLogoWidth = Math.min(width * (isSmallScreen ? 0.30 : 0.34), 200);
	// Reduce school logo window to 80% of previous size
	const orgLogoWidth = baseOrgLogoWidth * 2 * 0.8;

	// Handler for when organization logo loads
	const handleOrgLogoLoad = () => {
		setTimeout(() => setOrgLogoOpacity(1), 50);
	};

	// Skater animation (horizontal loop)
	useEffect(() => {
		const loopAnim = () => {
			setSkaterX(-100);
			const interval = setInterval(() => {
				setSkaterX(prev => {
					const next = prev + 2;
					if (next > width + 100) {
						clearInterval(interval);
						setTimeout(loopAnim, 0);
						return -100;
					}
					return next;
				});
			}, 30);
		};
		loopAnim();
	}, [width]);

	// Reduce skater to 75% of previous size
	const skaterWidth = 80 * 0.75;
	const skaterHeight = skaterWidth * (336/241);

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#FDD92B', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
			{/* Top Appybrain logo pinned to very top (in flow) */}
			<div style={{ 
				display: 'flex', 
				alignItems: 'flex-start', 
				justifyContent: 'center',
				paddingTop: 4,
				opacity: logoOpacity, 
				transition: 'opacity 650ms' 
			}}>
				<img
					src={logo}
					alt="Appybrain logo"
					style={{ width: logoWidth, height: 'auto', objectFit: 'contain' }}
				/>
			</div>

			{/* Center block with school logo */}
			<div style={{ 
				display: 'flex', 
				flex: 1, 
				flexDirection: 'column',
				justifyContent: 'flex-start', 
				alignItems: 'center', 
				paddingTop: 60,
				paddingLeft: 24, 
				paddingRight: 24
			}}>
				{organizationLogoUrl ? (
					<img
						src={organizationLogoUrl}
						alt="Logo da escola"
						onLoad={handleOrgLogoLoad}
						style={{ 
							width: orgLogoWidth, 
							maxWidth: '80%', 
							aspectRatio: 1, 
							opacity: orgLogoOpacity, 
							transition: 'opacity 400ms', 
							border: '10px solid #000', 
							borderRadius: 20, 
							backgroundColor: '#fff', 
							objectFit: 'contain' 
						}}
					/>
				) : null}
				<div style={{ 
					width: 40, 
					height: 40, 
					border: '4px solid #000', 
					borderTopColor: 'transparent', 
					borderRadius: '50%', 
					animation: 'spin 1s linear infinite', 
					marginTop: 28 
				}} />
				<div style={{ 
					marginTop: 20, 
					fontSize: 18, 
					fontWeight: 600, 
					textAlign: 'center', 
					opacity: 0.85, 
					color: '#000' 
				}}>
					{currentLoadingText}
				</div>
			</div>

			{/* Decorative bottom bar with skater animation */}
			<div style={{ position: 'absolute', right: 0, bottom: 0, left: 0 }}>
				<img
					src={bars}
					alt=""
					style={{ position: 'absolute', right: 0, bottom: 0, width: '100%', height: 50, objectFit: 'cover' }}
				/>
				<img
					src={skater}
					alt=""
					style={{ position: 'absolute', left: skaterX, bottom: 50, width: skaterWidth, height: skaterHeight }}
				/>
			</div>

			<style>{`
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
}
