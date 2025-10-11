import React, { useEffect, useState } from 'react';
import LoginScreen from './screens/account/LoginScreen.pure.jsx';
import LoadingScreen from './screens/LoadingScreen.pure.jsx';
import './App.css';
import ApiManager from './services/ApiManager.pure.js';

function PlaceholderScreen({ title }) {
  return (
    <div className="placeholder-screen">
      <h2>{title}</h2>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');

  // Determine initial screen based on existing session
  useEffect(() => {
    const decideInitial = async () => {
      try {
        await ApiManager.init();
        if (ApiManager.isAuthenticated()) {
          console.log('[App] Existing session detected. Going to Loading.');
          setCurrentScreen('Loading');
        } else {
          console.log('[App] No session. Staying on Login.');
        }
      } catch (e) {
        console.warn('[App] Failed to init ApiManager:', e);
      }
    };
    decideInitial();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Forgot':
        return <PlaceholderScreen title="Recuperar palavra-passe (TODO)" />;
      case 'Password':
        return <PlaceholderScreen title="Alterar palavra-passe (TODO)" />;
      case 'Loading':
        return <LoadingScreen onNavigate={setCurrentScreen} />;
      case 'Main':
        return <PlaceholderScreen title="App Principal (TODO)" />;
      case 'Login':
      default:
        return <LoginScreen onNavigate={setCurrentScreen} />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
}
