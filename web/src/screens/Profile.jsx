import React from 'react';
import { t } from '../services/Translate.js';
import Icon from '../components/common/Icon.jsx';

export default function Profile({ onNavigate }) {
  return (
    <div className="page-50" style={{ minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => onNavigate('Learn')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Perfil</h1>
      </header>
      <div style={{ padding: '40px 0', textAlign: 'center' }}>
        <p>Página de perfil em desenvolvimento...</p>
      </div>
    </div>
  );
}
