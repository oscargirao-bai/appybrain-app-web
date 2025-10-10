import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { navigationRef } from './services/navigationRef';
import { createStackNavigator } from '@react-navigation/stack';
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
import { useWindowDimensions, View } from 'react-native';

function MainTabs({ route }) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const initialTab = route?.params?.initialTab ?? 0;
  const [tab, setTab] = React.useState(initialTab);
  const [userInteracted, setUserInteracted] = React.useState(false);

  const hasFullAccess = DataManager.hasFullAccess();

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

  React.useEffect(() => {
    if (tab >= screens.length) {
      setTab(0);
      setUserInteracted(false);
    }
  }, [screens.length, tab]);

  const lastRouteParamsRef = React.useRef();
  React.useEffect(() => {
    const currentParams = JSON.stringify(route?.params);
    const hasParamsChanged = currentParams !== lastRouteParamsRef.current;
    lastRouteParamsRef.current = currentParams;
    if (hasParamsChanged && route?.params?.screen && !userInteracted) {
      const targetScreenName = route.params.screen;
      const screenIndex = screens.findIndex((s) => s.name === targetScreenName);
      if (screenIndex >= 0) setTab(screenIndex);
    }
  }, [route?.params, screens, userInteracted]);

  const userInteractionTimeoutRef = React.useRef();
  React.useEffect(() => {
    if (userInteracted) {
      if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
      userInteractionTimeoutRef.current = setTimeout(() => setUserInteracted(false), 2000);
    }
    return () => {
      if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
    };
  }, [userInteracted]);

  const getScreenParams = (screenIndex) => {
    const screen = screens[screenIndex];
    if (!screen) return {};
    const screenName = screen.name;
    if (route?.params?.screen === screenName && route?.params?.params) return route.params.params;
    return {};
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {screens.map(({ id, Comp }, idx) => (
            <View key={id} style={{ flex: 1, position: idx === tab ? 'relative' : 'absolute', inset: 0, opacity: idx === tab ? 1 : 0, pointerEvents: idx === tab ? 'auto' : 'none' }}>
              <Comp {...getScreenParams(idx)} />
            </View>
          ))}
        </View>
      </SafeAreaView>
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
    </View>
  );
}

const Stack = createStackNavigator();

export default function AppRouter() {
  const { resolvedTheme, colors } = useTheme();
  const navTheme = resolvedTheme === 'light' ? DefaultTheme : DarkTheme;

  // Trace router mount on web
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[boot] AppRouter mounted');
  }, []);

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}
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
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
