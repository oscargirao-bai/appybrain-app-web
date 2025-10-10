import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LoginScreen from './screens/account/LoginScreen.web.js';

function PlaceholderScreen({ title }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );
}

export default function WebAppRouter() {
  const [currentScreen, setCurrentScreen] = useState('Login');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Forgot':
        return <PlaceholderScreen title="Recover password (TODO)" />;
      case 'Password':
        return <PlaceholderScreen title="Change password (TODO)" />;
      case 'Loading':
        return <PlaceholderScreen title="Loading..." />;
      case 'Login':
      default:
        return <LoginScreen onNavigate={setCurrentScreen} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
  },
});
