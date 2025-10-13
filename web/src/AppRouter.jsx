import React, { useState, useRef, useEffect } from 'react';
import { useTheme, useThemeColors } from './services/Theme.jsx';
import DataManager from './services/DataManager.jsx';
// Screens
import LoginScreen from './screens/account/LoginScreen.jsx';
import PasswordScreen from './screens/account/PasswordScreen.jsx';
import ForgotScreen from './screens/account/ForgotScreen.jsx';
import LoadingScreen from './screens/LoadingScreen.jsx';
import LearnScreen from './screens/tabs/LearnScreen.jsx';
import BattleScreen from './screens/tabs/BattleScreen.jsx';
import CategoryScreen from './screens/learn/CategoryScreen.jsx';
import ContentScreen from './screens/learn/ContentScreen.jsx';
import TribeScreen from './screens/tabs/TribeScreen.jsx';
import ChallengeScreen from './screens/tabs/ChallengeScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import NewScreen from './screens/tabs/NewScreen.jsx';
import ShopScreen from './screens/tabs/ShopScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import HtmlScreen from './screens/HtmlScreen.jsx';
import CustomizeScreen from './screens/CustomizeScreen.jsx';
import QuizzScreen from './screens/quizz/QuizzScreen.jsx';
import ResultScreen1 from './screens/quizz/ResultScreen1.jsx';
import ResultScreen2 from './screens/quizz/ResultScreen2.jsx';
import NavBar from './components/General/NavBar.jsx';

// MainTabs component (equivalent to RN MainTabs)
function MainTabs({ route, navigation }) {
	const colors = useThemeColors();
	const initialTab = route?.params?.initialTab ?? 0;
	const [tab, setTab] = useState(initialTab);
		// Expose current tab globally to allow back navigation to return to correct tab
		useEffect(() => {
			window.__lastMainTab = tab;
		}, [tab]);
	const [userInteracted, setUserInteracted] = useState(false);

	// Get user access configuration
	const hasFullAccess = DataManager.hasFullAccess();
	
	// Define screens and icons based on access level
	const screens = hasFullAccess 
		? [
			{ id: 0, Comp: LearnScreen, name: 'Learn' },
			{ id: 1, Comp: BattleScreen, name: 'Battle' },
			{ id: 2, Comp: ChallengeScreen, name: 'Challenges' },
			{ id: 3, Comp: TribeScreen, name: 'Tribes' },
			{ id: 4, Comp: NewScreen, name: 'News' },
			{ id: 5, Comp: ShopScreen, name: 'Shop' },
		]
		: [
			{ id: 0, Comp: LearnScreen, name: 'Learn' },
			{ id: 3, Comp: TribeScreen, name: 'Tribes' },
			{ id: 4, Comp: NewScreen, name: 'News' },
			{ id: 5, Comp: ShopScreen, name: 'Shop' },
		];
	
	const icons = hasFullAccess 
		? ['book', 'swords', 'crosshair', 'tent', 'newspaper', 'shopping-bag']
		: ['book', 'tent', 'newspaper', 'shopping-bag'];

	// Ensure tab is within bounds of screens
	React.useEffect(() => {
		if (tab >= screens.length) {
			setTab(0);
			setUserInteracted(false);
		}
	}, [screens.length, tab]);

	// Handle route params changes ONLY if user hasn't manually interacted with tabs recently
	const lastRouteParamsRef = useRef();
	React.useEffect(() => {
		const currentParams = JSON.stringify(route?.params);
		const hasParamsChanged = currentParams !== lastRouteParamsRef.current;
		lastRouteParamsRef.current = currentParams;

		if (hasParamsChanged && route?.params?.screen && !userInteracted) {
			const targetScreenName = route.params.screen;
			const screenIndex = screens.findIndex(screen => screen.name === targetScreenName);
			if (screenIndex >= 0) {
				setTab(screenIndex);
			}
		}
	}, [route?.params, screens, userInteracted]);

	// Reset user interaction flag after a delay
	const userInteractionTimeoutRef = useRef();
	React.useEffect(() => {
		if (userInteracted) {
			if (userInteractionTimeoutRef.current) {
				clearTimeout(userInteractionTimeoutRef.current);
			}
			userInteractionTimeoutRef.current = setTimeout(() => {
				setUserInteracted(false);
			}, 2000);
		}

		return () => {
			if (userInteractionTimeoutRef.current) {
				clearTimeout(userInteractionTimeoutRef.current);
			}
		};
	}, [userInteracted]);

	// Get params for current screen
	const getScreenParams = (screenIndex) => {
		const screen = screens[screenIndex];
		if (!screen) return {};

		const screenName = screen.name;		if (route?.params?.screen === screenName && route?.params?.params) {
			return route.params.params;
		}
		
		return {};
	};

	return (
		<div style={{ 
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			width: '100%',
			backgroundColor: colors.background 
		}}>
			<div style={{ 
				flex: 1,
				display: 'flex',
				flexDirection: 'column',
				overflow: 'auto',
				paddingBottom: '80px',
				backgroundColor: colors.background 
			}}>
				<div style={{ 
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					backgroundColor: colors.background 
				}}>
					{/* Renderizar APENAS o screen ativo, não todos simultaneamente */}
					{screens.map(({ id, Comp }, screenIndex) => {
						// Só renderizar o tab atual para evitar problemas de hooks
						if (screenIndex !== tab) return null;
						
						return (
							<div
								key={id}
								style={{ 
									flex: 1,
									display: 'flex',
									flexDirection: 'column',
									position: 'relative',
									width: '100%',
									height: '100%',
									overflow: 'auto'
								}}
							>
								<Comp navigation={navigation} {...getScreenParams(screenIndex)} />
							</div>
						);
					})}
				</div>
			</div>
			<NavBar
				icons={icons}
				currentPage={tab}
				handleTabPress={(i) => {
					if (i >= 0 && i < screens.length) {
						setUserInteracted(true);
						setTab(i);
					}
				}}
			/>
		</div>
	);
}

// Simple router without React Navigation (web version)
export default function AppRouter() {
	const { resolvedTheme, colors } = useTheme();
	const [currentScreen, setCurrentScreen] = useState('Loading');
	const [screenParams, setScreenParams] = useState({});
	const [navigationHistory, setNavigationHistory] = useState(['Loading']);
	const navigationRef = useRef(null);

	// Navigation object (mimics RN navigation)
	const navigation = {
		navigate: (screenName, params = {}) => {
			setNavigationHistory(prev => [...prev, screenName]);
			setCurrentScreen(screenName);
			setScreenParams(params);
		},
		replace: (screenName, params = {}) => {
			setCurrentScreen(screenName);
			setScreenParams(params);
		},
		goBack: () => {
			setNavigationHistory(prev => {
				if (prev.length <= 1) {
					// Sem histórico: volta para MainTabs e tenta restaurar o último tab usado
					const lastTab = typeof window !== 'undefined' && typeof window.__lastMainTab === 'number' ? window.__lastMainTab : 0;
					setCurrentScreen('MainTabs');
					setScreenParams({ initialTab: lastTab });
					return ['MainTabs'];
				} else {
					// Voltar ao ecrã anterior
					const newHistory = prev.slice(0, -1);
					const previousScreen = newHistory[newHistory.length - 1];
					setCurrentScreen(previousScreen);
					return newHistory;
				}
			});
		},
		reset: ({ routes }) => {
			if (routes && routes.length > 0) {
				setCurrentScreen(routes[0].name);
				setScreenParams(routes[0].params || {});
				setNavigationHistory([routes[0].name]);
			}
		}
	};

	// Listen for custom navigation events (e.g., from Banner component)
	useEffect(() => {
		const handleNavigateToProfile = () => {
			navigation.navigate('Profile');
		};

		window.addEventListener('navigate-to-profile', handleNavigateToProfile);

		return () => {
			window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
		};
	}, []);

	const renderScreen = () => {
		const commonProps = { navigation, route: { params: screenParams } };

		switch (currentScreen) {
			case 'Login':
				return <LoginScreen {...commonProps} />;
			case 'Forgot':
				return <ForgotScreen {...commonProps} />;
			case 'Password':
				return <PasswordScreen {...commonProps} />;
			case 'Loading':
				return <LoadingScreen {...commonProps} />;
			case 'MainTabs':
				return <MainTabs {...commonProps} />;
			case 'Settings':
				return <SettingsScreen {...commonProps} />;
			case 'Html':
				return <HtmlScreen {...commonProps} />;
			case 'Customize':
				return <CustomizeScreen {...commonProps} />;
			case 'Quizz':
				return <QuizzScreen {...commonProps} />;
			case 'Result1':
				return <ResultScreen1 {...commonProps} />;
			case 'Result2':
				return <ResultScreen2 {...commonProps} />;
			case 'Category':
				return <CategoryScreen {...commonProps} />;
			case 'Content':
				return <ContentScreen {...commonProps} />;
			case 'Profile':
				return <ProfileScreen {...commonProps} />;
			default:
				return <LoadingScreen {...commonProps} />;
		}
	};

	return (
		<div style={{ 
			display: 'flex',
			flexDirection: 'column',
			height: '100%',
			width: '100%',
			backgroundColor: colors.background 
		}}>
			{renderScreen()}
		</div>
	);
}
