import React, { useState, useRef } from 'react';
import { useTheme, useThemeColors } from './services/Theme';
import DataManager from './services/DataManager';
// Screens
import LoginScreen from './screens/account/LoginScreen';
import PasswordScreen from './screens/account/PasswordScreen';
import ForgotScreen from './screens/account/ForgotScreen';
import LoadingScreen from './screens/LoadingScreen';
import LearnScreen from './screens/tabs/LearnScreen';
import BattleScreen from './screens/tabs/BattleScreen';
import CategoryScreen from './screens/learn/CategoryScreen';
import ContentScreen from './screens/learn/ContentScreen';
// import TribeScreen from './screens/tabs/TribeScreen';
import ChallengeScreen from './screens/tabs/ChallengeScreen';
import ProfileScreen from './screens/ProfileScreen';
import NewScreen from './screens/tabs/NewScreen';
import ShopScreen from './screens/tabs/ShopScreen';
import SettingsScreen from './screens/SettingsScreen';
import HtmlScreen from './screens/HtmlScreen';
import CustomizeScreen from './screens/CustomizeScreen';
import QuizzScreen from './screens/quizz/QuizzScreen';
import ResultScreen1 from './screens/quizz/ResultScreen1';
import ResultScreen2 from './screens/quizz/ResultScreen2';
import NavBar from './components/General/NavBar';

// MainTabs component (equivalent to RN MainTabs)
function MainTabs({ route, navigation }) {
	const colors = useThemeColors();
	const initialTab = route?.params?.initialTab ?? 0;
	const [tab, setTab] = useState(initialTab);
	const [userInteracted, setUserInteracted] = useState(false);

	// Get user access configuration
	const hasFullAccess = DataManager.hasFullAccess();
	
	// Define screens and icons based on access level
	const screens = hasFullAccess 
		? [
			{ id: 0, Comp: LearnScreen, name: 'Learn' },
			{ id: 1, Comp: BattleScreen, name: 'Battle' },
			{ id: 2, Comp: ChallengeScreen, name: 'Challenges' },
			// { id: 3, Comp: TribeScreen, name: 'Tribes' },
			{ id: 4, Comp: NewScreen, name: 'News' },
			{ id: 5, Comp: ShopScreen, name: 'Shop' },
		]
		: [
			{ id: 0, Comp: LearnScreen, name: 'Learn' },
			// { id: 3, Comp: TribeScreen, name: 'Tribes' },
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
		<div style={{ flex: 1, backgroundColor: colors.background }}>
			<div style={{ flex: 1, backgroundColor: colors.background }}>
				<div style={{ flex: 1, backgroundColor: colors.background }}>
					{screens.map(({ id, Comp }, screenIndex) => (
						<div
							key={id}
							style={{ 
								flex: 1, 
								position: screenIndex === tab ? 'relative' : 'absolute', 
								inset: 0, 
								opacity: screenIndex === tab ? 1 : 0, 
								pointerEvents: screenIndex === tab ? 'auto' : 'none' 
							}}
						>
							<Comp navigation={navigation} {...getScreenParams(screenIndex)} />
						</div>
					))}
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
	const navigationRef = useRef(null);

	// Navigation object (mimics RN navigation)
	const navigation = {
		navigate: (screenName, params = {}) => {
			setCurrentScreen(screenName);
			setScreenParams(params);
		},
		replace: (screenName, params = {}) => {
			setCurrentScreen(screenName);
			setScreenParams(params);
		},
		goBack: () => {
			// Simple back - could track history if needed
			setCurrentScreen('MainTabs');
		},
		reset: ({ routes }) => {
			if (routes && routes.length > 0) {
				setCurrentScreen(routes[0].name);
				setScreenParams(routes[0].params || {});
			}
		}
	};

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
		<div style={{ backgroundColor: colors.background }}>
			{renderScreen()}
		</div>
	);
}
