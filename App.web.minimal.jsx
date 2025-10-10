import React, { useEffect } from 'react';
import WebAppRouter from './src/WebAppRouter.jsx';
import ApiManager from './src/services/ApiManager';
import { ThemeProvider } from './src/services/Theme';
import { TranslationProvider } from './src/services/Translate';

export default function AppWebMinimal() {
    useEffect(() => {
        console.log('[AppWebMinimal] Initializing');
        ApiManager.init({ baseUrl: 'https://appybrain.skillade.com/' });
    }, []);

    console.log('[AppWebMinimal] Rendering');

    return (
        <ThemeProvider defaultTheme="dark">
            <TranslationProvider>
                <WebAppRouter />
            </TranslationProvider>
        </ThemeProvider>
    );
}
