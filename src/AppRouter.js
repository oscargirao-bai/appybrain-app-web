import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { navigationRef } from './services/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from './services/Theme';
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
import TribeScreen from './screens/tabs/TribeScreen';
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
import { useThemeColors } from './services/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

// Placeholder fallback components (to be implemented separately)
import { View, Text, Image } from 'react-native';

function Placeholder({ title }) {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<Text>{title}</Text>
		</View>
	);
}

// (Legacy inline SplashScreen removed; now using real SplashScreen component import)

function MainTabs({ route }) {
	const colors = useThemeColors();
	const { width } = useWindowDimensions();
	const initialTab = route?.params?.initialTab ?? 0;
	const [tab, setTab] = React.useState(initialTab); // This now represents the visible tab index
	const [userInteracted, setUserInteracted] = React.useState(false); // Track if user manually switched tabs

	// Get user access configuration
	const hasFullAccess = DataManager.hasFullAccess();
	
	// Debug logging
	//console.log('MainTabs: hasFullAccess =', hasFullAccess);
	//console.log('MainTabs: current tab =', tab);
	//console.log('MainTabs: userInteracted =', userInteracted);
	//console.log('MainTabs: route params =', route?.params);
	
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

	// Debug logging
	//console.log('MainTabs: screens =', screens.map(s => s.name));
	//console.log('MainTabs: icons =', icons);

	// Ensure tab is within bounds of screens
	React.useEffect(() => {
		if (tab >= screens.length) {
			//console.log('MainTabs: Tab out of bounds, resetting to 0');
			setTab(0); // Reset to first tab if current tab is out of bounds
			setUserInteracted(false); // Reset user interaction flag
		}
	}, [screens.length, tab]);

	// Prefetch remote images used by Banner to eliminate flash when switching tabs
	useEffect(() => {
		const bannerUri = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=60';
		const avatarUri = 'https://avatars.githubusercontent.com/u/9919?v=4';
		Image.prefetch(bannerUri);
		Image.prefetch(avatarUri);
	}, []);

	// Handle route params changes ONLY if user hasn't manually interacted with tabs recently
	const lastRouteParamsRef = React.useRef();
	React.useEffect(() => {
		const currentParams = JSON.stringify(route?.params);
		const hasParamsChanged = currentParams !== lastRouteParamsRef.current;
		lastRouteParamsRef.current = currentParams;

		// Only handle route params if they've actually changed and user hasn't recently interacted
		if (hasParamsChanged && route?.params?.screen && !userInteracted) {
			const targetScreenName = route.params.screen;
			//console.log('MainTabs: Route params changed, target screen =', targetScreenName);
			
			// Find the screen in the screens array
			const screenIndex = screens.findIndex(screen => screen.name === targetScreenName);
			if (screenIndex >= 0) {
				//console.log('MainTabs: Setting tab from route params to index =', screenIndex);
				setTab(screenIndex);
			}
		}
	}, [route?.params, screens, userInteracted]);

	// Reset user interaction flag after a delay to allow route params to work again
	const userInteractionTimeoutRef = React.useRef();
	React.useEffect(() => {
		if (userInteracted) {
			// Clear any existing timeout
			if (userInteractionTimeoutRef.current) {
				clearTimeout(userInteractionTimeoutRef.current);
			}
			// Set a new timeout to reset the flag after 2 seconds
			userInteractionTimeoutRef.current = setTimeout(() => {
				//console.log('MainTabs: Resetting user interaction flag');
				setUserInteracted(false);
			}, 2000);
		}

		// Cleanup timeout on unmount
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
		
		const screenName = screen.name;
		
		// If route params target this specific screen, return the nested params
		if (route?.params?.screen === screenName && route?.params?.params) {
			return route.params.params;
		}
		
		return {};
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			{/* Content respects safe area */}
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
				<View style={{ flex: 1, backgroundColor: colors.background }}>
					{screens.map(({ id, Comp }, screenIndex) => (
						<View
							key={id}
							style={{ flex: 1, position: screenIndex === tab ? 'relative' : 'absolute', inset: 0, opacity: screenIndex === tab ? 1 : 0, pointerEvents: screenIndex === tab ? 'auto' : 'none' }}
						>
							<Comp {...getScreenParams(screenIndex)} />
						</View>
					))}
				</View>
			</SafeAreaView>
			{/* NavBar outside the SafeAreaView to ignore bottom inset */}
			<NavBar
				icons={icons}
				currentPage={tab}
				handleTabPress={(i) => {
					//console.log('NavBar: Tab pressed, index =', i, 'screen =', screens[i]?.name);
					// Ensure the tab index is valid before setting
					if (i >= 0 && i < screens.length) {
						//console.log('NavBar: Setting user interaction flag and switching tab');
						// Mark that user has manually interacted with tabs
						setUserInteracted(true);
						// Set the tab immediately (no animation frame delay needed)
						setTab(i);
					}
				}}
			/>
		</View>
	);
}

const Stack = createNativeStackNavigator();

export default function AppRouter() {
	const { resolvedTheme, colors } = useTheme();
	const navTheme = resolvedTheme === 'light' ? DefaultTheme : DarkTheme;

	return (
		<NavigationContainer theme={navTheme} ref={navigationRef}>
			<Stack.Navigator
				initialRouteName="Loading"
				screenOptions={{
					headerShown: false,
					contentStyle: { backgroundColor: colors.background },
					// Desativar gesto de swipe-back (iOS) / edge swipe
					gestureEnabled: false,
					fullScreenGestureEnabled: false,
				}}
			>
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Forgot" component={ForgotScreen} />
				<Stack.Screen name="Password" component={PasswordScreen} />
				<Stack.Screen name="Loading" component={LoadingScreen} />
				<Stack.Screen name="MainTabs" component={MainTabs} />
				<Stack.Screen name="Settings" component={SettingsScreen} />
				<Stack.Screen name="Html" component={HtmlScreen} />
				<Stack.Screen name="Customize" component={CustomizeScreen} />
				<Stack.Screen name="Quizz" component={QuizzScreen} />
                <Stack.Screen name="Result1" component={ResultScreen1} />
				<Stack.Screen name="Result2" component={ResultScreen2} />
				<Stack.Screen name="Category" component={CategoryScreen} />
				<Stack.Screen name="Content" component={ContentScreen} />
                {/* Standalone Profile screen (not in tabs) */}
                <Stack.Screen name="Profile" component={ProfileScreen} />
			</Stack.Navigator >
		</NavigationContainer >
	);
}
