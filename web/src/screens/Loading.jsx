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
        const valid = await ApiManager.validateSession();
        if (!valid || !valid.success) {
          console.warn('Session validation failed, redirecting to login');
          return onNavigate('Login');
        }

        setText('A carregar dados da organização...');
        const org = await ApiManager.loadOrganizationData();
        if (org?.logoUrl) setOrgLogo(org.logoUrl);

        setText('A carregar conteúdo...');
        const data = await ApiManager.loadAppData();
        
        // Hydrate DataManager with loaded data
        DataManager.setData(data);
        
        // Ensure at least 5 seconds visible after logo appears
        if (org?.logoUrl) {
          await new Promise(r => setTimeout(r, 5000));
        }
        
        onNavigate('Learn');
      } catch (error) {
        console.error('Failed during app initialization:', error);
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

