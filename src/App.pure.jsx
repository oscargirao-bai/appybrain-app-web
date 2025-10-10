import React, { useState } from 'react';
import LoginScreen from './screens/account/LoginScreen.pure.jsx';
import LoadingScreen from './screens/LoadingScreen.pure.jsx';
import './App.css';

function PlaceholderScreen({ title }) {
  return (
    <div className="placeholder-screen">
      <h2>{title}</h2>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');

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
