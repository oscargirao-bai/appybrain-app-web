import React, { useEffect, useState } from 'react';
import { useThemeColors } from '../services/Theme.jsx';
import ApiManager from '../services/ApiManager.js';
import DataManager from '../services/DataManager.js';
import './Loading.css';

export default function Loading({ onNavigate }) {
  const colors = useThemeColors();
  const [text, setText] = useState('A validar sessão...');
  const [orgLogo, setOrgLogo] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        // First, validate session in the background
        const sessionResult = await ApiManager.validateSession();
        
        // validateSession returns the user data object if valid, or false if invalid
        if (!sessionResult) {
          // Session is invalid or doesn't exist, redirect to login
          console.log('Session invalid, redirecting to login');
          onNavigate('Login');
          return;
        }
        
        // Session is valid, proceed with loading app data
        console.log('Session valid, loading app data');
        
        // Initialize DataManager with ApiManager
        DataManager.init(ApiManager);
        
        // Load organization data first (contains logo URL)
        setText('A carregar dados da organização...');
        await DataManager.loadOrganizationData();
        
        // Get organization logo URL early
        const orgLogoUrl = DataManager.getOrganizationLogoUrl?.();
        if (orgLogoUrl) {
          setOrgLogo(orgLogoUrl);
        }
        
        // Wait a bit and then switch to second loading text
        setTimeout(() => {
          setText('A carregar conteúdo...');
        }, 2500);
        
        // Load app data through DataManager (loads EVERYTHING: badges, content, stars, tribes, chests, notifications, news, ranking, challenges, cosmetics, quotes)
        await DataManager.loadAppData();
        
        // Ensure minimum loading time to show both texts
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate to main screen after data is loaded
        onNavigate('Learn');
      } catch (error) {
        console.error('Failed during app initialization:', error);
        // On error, redirect to login as fallback
        onNavigate('Login');
      }
    };
    run();
  }, [onNavigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
    <div className="loading-page">
      <div className="logo-top">
        <div className="logo-crop page-50">
          <img src="/assets/logo.png" alt="AppyBrain" />
        </div>
      </div>
      <div className="center page-50">
        {orgLogo && (
          <div className="org-card">
            <img src={orgLogo} alt="logo da escola" />
          </div>
        )}
        <div className="spinner-text">{text}</div>
      </div>
      <div className="bottom page-50">
        <img src="/assets/rainbow.png" alt="rainbow" className="rainbow" />
        <img src="/assets/skater.svg" alt="skater" className="skater" />
      </div>
    </div>
    </div>
  );
}

