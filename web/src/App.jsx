import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './services/Theme.jsx';
import LoginScreen from './screens/account/Login.jsx';
import LoadingScreen from './screens/Loading.jsx';
import LearnScreen from './screens/learn/Learn.jsx';
import BattleScreen from './screens/tabs/Battle.jsx';
import SettingsScreen from './screens/Settings.jsx';
import ProfileScreen from './screens/Profile.jsx';
import CategoryScreen from './screens/learn/Category.jsx';
import NavBar from './components/common/NavBar.jsx';
import ApiManager from './services/ApiManager.js';
import DataManager from './services/DataManager.js';
import './styles/container.css';

export default function App() {
  const [screen, setScreen] = useState('Login');
  const [screenParams, setScreenParams] = useState({});
  const [currentTab, setCurrentTab] = useState(0);
  const [previousScreen, setPreviousScreen] = useState('Learn');

  useEffect(() => {
    ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/api/' });
  }, []);

  const navigate = (screenName, params = {}) => {
    // Guardar screen atual antes de navegar para Settings ou Profile
    if ((screenName === 'Settings' || screenName === 'Profile') && screen !== 'Settings' && screen !== 'Profile') {
      setPreviousScreen(screen);
    }
    setScreen(screenName);
    setScreenParams(params);
  };

  // Check if user has full access (for showing all tabs)
  const hasFullAccess = DataManager.getUser()?.hasFullAccess !== false;
  
  // Define tabs based on access level (matching RN MainTabs)
  const tabs = hasFullAccess 
    ? [
        { name: 'Learn', icon: 'book-open' },
        { name: 'Battle', icon: 'swords' },
        { name: 'Challenges', icon: 'crosshair' },
        { name: 'Tribes', icon: 'tent' },
        { name: 'News', icon: 'newspaper' },
        { name: 'Shop', icon: 'shopping-bag' },
      ]
    : [
        { name: 'Learn', icon: 'book-open' },
        { name: 'Tribes', icon: 'tent' },
        { name: 'News', icon: 'newspaper' },
        { name: 'Shop', icon: 'shopping-bag' },
      ];

  const handleTabPress = (index) => {
    setCurrentTab(index);
    navigate(tabs[index].name);
  };

  const showNavBar = ['Learn', 'Battle', 'Challenges', 'Tribes', 'News', 'Shop'].includes(screen);

  const render = () => {
    switch (screen) {
      case 'Loading':
        return <LoadingScreen onNavigate={navigate} />;
      case 'Learn':
        return <LearnScreen onNavigate={navigate} />;
      case 'Settings':
        return <SettingsScreen onNavigate={navigate} previousScreen={previousScreen} />;
      case 'Profile':
        return <ProfileScreen onNavigate={navigate} />;
      case 'Category':
        return <CategoryScreen onNavigate={navigate} disciplineId={screenParams.disciplineId} />;
      case 'Battle':
        return <BattleScreen onNavigate={navigate} />;
      case 'Challenges':
      case 'Tribes':
      case 'News':
      case 'Shop':
        return <div className="page-50" style={{ padding: '40px 20px', textAlign: 'center' }}><h2>{screen}</h2><p>Em desenvolvimento...</p></div>;
      case 'Login':
      default:
        return <LoginScreen onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="page-container-50" style={{ paddingBottom: showNavBar ? '80px' : '0' }}>
        {render()}
        {showNavBar && (
          <NavBar 
            icons={tabs.map(t => t.icon)} 
            currentPage={currentTab} 
            handleTabPress={handleTabPress} 
          />
        )}
      </div>
    </ThemeProvider>
  );
}

