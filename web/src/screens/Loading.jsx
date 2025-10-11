import React, { useEffect, useState } from 'react';
import ApiManager from '../services/ApiManager.js';
import { setAppData, setOrganization } from '../services/DataStore.js';
import './Loading.css';

export default function Loading({ onNavigate }) {
  const [text, setText] = useState('A validar sessão...');
  const [orgLogo, setOrgLogo] = useState(null);

  useEffect(() => {
    const run = async () => {
      const valid = await ApiManager.validateSession();
      if (!valid || !valid.success) return onNavigate('Login');

      setText('A carregar dados da organização...');
      const org = await ApiManager.loadOrganizationData();
      setOrganization(org);
      if (org?.logoUrl) setOrgLogo(org.logoUrl);

      setText('A carregar conteúdo...');
      const data = await ApiManager.loadAppData();
      setAppData(data);
      // Ensure at least 5 seconds visible after logo appears
      if (org?.logoUrl) {
        await new Promise(r => setTimeout(r, 5000));
      }
      onNavigate('Learn');
    };
    run();
  }, [onNavigate]);

  return (
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
  );
}
