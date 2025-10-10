import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SimpleLoginScreen from './screens/account/SimpleLoginScreen';

const Stack = createStackNavigator();

export default function MinimalAppRouter() {
    console.log('[MinimalAppRouter] Rendering');

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={SimpleLoginScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
