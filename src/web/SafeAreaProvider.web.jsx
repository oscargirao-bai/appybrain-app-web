import React from 'react';
import { View } from 'react-native';

// Web-safe SafeAreaProvider that doesn't use native modules
export const SafeAreaProvider = ({ children, style }) => {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
};

export default SafeAreaProvider;
