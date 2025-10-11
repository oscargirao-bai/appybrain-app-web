import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/account/Login.jsx';
import LoadingScreen from './screens/Loading.jsx';
import MainScreen from './screens/Main.jsx';
import ApiManager from './services/ApiManager.js';

export default function App() {
  const [screen, setScreen] = useState('Login');

  useEffect(() => {
    ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/api/' });
  }, []);

  const render = () => {
    switch (screen) {
      case 'Loading':
        return <LoadingScreen onNavigate={setScreen} />;
      case 'Main':
        return <MainScreen onNavigate={setScreen} />;
      case 'Login':
      default:
        return <LoginScreen onNavigate={setScreen} />;
    }
  };

  return <div>{render()}</div>;
}
