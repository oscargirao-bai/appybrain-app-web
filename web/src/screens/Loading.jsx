import React, { useEffect, useRef, useState } from 'react';
import { useThemeColors } from '../services/Theme.jsx';
import { t } from '../services/Translate.js';
import ApiManager from '../services/ApiManager.js';
import DataManager from '../services/DataManager.js';

// Assets
const logo = '/assets/logo.png';
const bars = '/assets/rainbow.png';
const skater = '/assets/skater.svg';

// Loading/Splash screen that appears right after login
// Sketch reference: bright brand yellow background, centered logo, diagonal rainbow-ish bars bottom-right
export default function Loading({ onNavigate }) {
	const colors = useThemeColors();
	const [currentLoadingText, setCurrentLoadingText] = useState(t('loading.medals'));
	const [organizationLogoUrl, setOrganizationLogoUrl] = useState(null);
	const [logoOpacity, setLogoOpacity] = useState(0);
	const [orgLogoOpacity, setOrgLogoOpacity] = useState(0);
	const [skaterX, setSkaterX] = useState(-100);
	// Spinner replaces previous progress bar

	// Basic fade-in animation for logo and looping progress bar
	useEffect(() => {
		// Fade in the logo
		setTimeout(() => setLogoOpacity(1), 50);

		// Switch to second loading text after 50% of expected loading time
		const textSwitchTimer = setTimeout(() => {
			setCurrentLoadingText(t('loading.content'));
		}, 4000); // Switch after 4 seconds (increased from 2 seconds)
		
		// Session validation and data loading
		const initializeApp = async () => {
			try {
				// First, validate session in the background
				const isSessionValid = await ApiManager.validateSession();
				
				if (!isSessionValid) {
					// Session is invalid or doesn't exist, redirect to login
					//console.log('Session invalid, redirecting to login');
					onNavigate('Login');
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
					setCurrentLoadingText(t('loading.content'));
				}, 2500);
				
				// Load app data through DataManager
				await DataManager.loadAppData();
				
				// Ensure minimum loading time to show both texts
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				// Navigate to main tab navigator after data is loaded
				onNavigate('Learn');
			} catch (error) {
				console.error('Failed during app initialization:', error);
				// On error, redirect to login as fallback
				onNavigate('Login');
			}
		};
		
		initializeApp();
		
		// Cleanup timer on unmount
		return () => {
			clearTimeout(textSwitchTimer);
		};
	}, [onNavigate]);

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
					if (next > window.innerWidth + 100) {
						clearInterval(interval);
						setTimeout(loopAnim, 0);
						return -100;
					}
					return next;
				});
			}, 30);
		};
		loopAnim();
	}, []);

	const skaterWidth = 80;
	const skaterHeight = skaterWidth * (336/241);

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#FDD92B', position: 'relative', overflow: 'hidden' }}>
			{/* Top Appybrain logo */}
			<div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', opacity: logoOpacity, transition: 'opacity 650ms' }}>
				{/* Crop container: hides ~10% top & bottom by scaling to 125% height and shifting up 10% */}
				<div style={{ width: '100%', maxWidth: 600, margin: '0 auto', aspectRatio: 1, overflow: 'hidden' }}>
					<img
						src={logo}
						alt="Appybrain logo"
						style={{ position: 'absolute', width: '100%', height: '125%', top: '-10%', objectFit: 'contain' }}
					/>
				</div>
			</div>

			{/* Center block with school logo */}
			<div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', paddingLeft: 24, paddingRight: 24, minHeight: '100vh' }}>
				{organizationLogoUrl ? (
					<img
						src={organizationLogoUrl}
						alt="Logo da escola"
						onLoad={handleOrgLogoLoad}
						style={{ width: 400, maxWidth: '80%', aspectRatio: 1, opacity: orgLogoOpacity, transition: 'opacity 400ms', border: '10px solid #000', borderRadius: 20, backgroundColor: '#fff', objectFit: 'contain' }}
					/>
				) : null}
				<div style={{ width: 40, height: 40, border: '4px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginTop: 28 }} />
				<div style={{ marginTop: 20, fontSize: 18, fontWeight: 600, textAlign: 'center', opacity: 0.85, color: '#000' }}>{currentLoadingText}</div>
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

