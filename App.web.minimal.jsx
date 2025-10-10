import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MinimalAppRouter from './src/MinimalAppRouter';
import ApiManager from './src/services/ApiManager';

export default function AppWebMinimal() {
    useEffect(() => {
        console.log('[AppWebMinimal] Initializing');
        ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/' });
    }, []);

    console.log('[AppWebMinimal] Rendering');

    return (
        <SafeAreaProvider>
            <MinimalAppRouter />
        </SafeAreaProvider>
    );
}
