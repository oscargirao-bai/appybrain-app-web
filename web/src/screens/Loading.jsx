import React, { useEffect, useState } from 'react';
import ApiManager from '../services/ApiManager.js';
import { setAppData, setOrganization } from '../services/DataStore.js';
import './Loading.css';

export default function Loading({ onNavigate }) {
  const [text, setText] = useState('A validar sessão...');

  useEffect(() => {
    const run = async () => {
      const valid = await ApiManager.validateSession();
      if (!valid || !valid.success) return onNavigate('Login');

      setText('A carregar dados da organização...');
      const org = await ApiManager.loadOrganizationData();
      setOrganization(org);

      setText('A carregar conteúdo...');
      const data = await ApiManager.loadAppData();
      setAppData(data);

      onNavigate('Learn');
    };
    run();
  }, [onNavigate]);

  return (
    <div className="loading-page">
      <div className="logo-top">
        <div className="logo-crop">
          <img src="/assets/logo.png" alt="AppyBrain" />
        </div>
      </div>
      <div className="center">
        <div className="spinner-text">{text}</div>
      </div>
      <div className="bottom">
        <img src="/assets/rainbow.png" alt="rainbow" className="rainbow" />
        <img src="/assets/skater.svg" alt="skater" className="skater" />
      </div>
    </div>
  );
}
