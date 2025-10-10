import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';
import ApiManager from '../services/ApiManager.pure.js';

export default function LoadingScreen({ onNavigate }) {
  const [loadingText, setLoadingText] = useState('A validar sessão...');
  const [organizationLogoUrl, setOrganizationLogoUrl] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[LoadingScreen] Starting data load...');

        // Step 1: Validate session
        const sessionResponse = await ApiManager.validateSession();

        if (!sessionResponse || !sessionResponse.success) {
          console.error('[LoadingScreen] Session invalid');
          onNavigate?.('Login');
          return;
        }

        console.log('[LoadingScreen] Session valid, user:', sessionResponse.user);

        // Step 2: Load organization data (includes logo)
        setLoadingText('A carregar dados da organização...');
        const organizationData = await ApiManager.loadOrganizationData();
        
        if (organizationData && organizationData.logoUrl) {
          setOrganizationLogoUrl(organizationData.logoUrl);
          console.log('[LoadingScreen] Organization logo loaded:', organizationData.logoUrl);
        }

        // Step 3: Load all app data (9 sequential API calls)
        setLoadingText('A carregar conteúdo...');
        const appData = await ApiManager.loadAppData();
        
        console.log('[LoadingScreen] App data loaded:', {
          userInfo: !!appData.userInfo,
          disciplines: !!appData.disciplines,
          userStars: !!appData.userStars,
          tribes: !!appData.tribes,
          userChests: !!appData.userChests,
          notifications: !!appData.notifications,
          news: !!appData.news,
          rankings: !!appData.rankings,
          challenges: !!appData.challenges
        });

        // Ensure minimum loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[LoadingScreen] Data loaded successfully, navigating to Main');

        // Navigate to main app
        onNavigate?.('Main');
      } catch (error) {
        console.error('[LoadingScreen] Load failed:', error);
        onNavigate?.('Login');
      }
    };

    loadData();
  }, [onNavigate]);

  return (
    <div className="loading-screen">
      {organizationLogoUrl && (
        <div className="org-logo-container">
          <img 
            src={organizationLogoUrl} 
            alt="Logo da escola" 
            className="org-logo"
          />
        </div>
      )}
      <div className="skater-container">
        <div className="skater">🛹</div>
      </div>
      <div className="loading-text">
        <div className="pulse">{loadingText}</div>
      </div>
    </div>
  );
}
