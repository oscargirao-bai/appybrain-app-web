import React, { useEffect, useState } from 'react';
import ApiManager from '../services/ApiManager.js';
import { setAppData, setOrganization } from '../services/DataStore.js';

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
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFD93D 0%, #FFC947 100%)' }}>
      <div>
        <div style={{ fontSize: 48, textAlign: 'center' }}>🛹</div>
        <p style={{ textAlign: 'center', fontWeight: 600 }}>{text}</p>
      </div>
    </div>
  );
}
