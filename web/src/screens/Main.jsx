import React from 'react';
import NavBar from '../components/General/NavBar.jsx';

export default function Main({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 60 }}>
      <header style={{ padding: 16 }}>
        <img src="/assets/logo.png" alt="logo" style={{ width: 140 }} />
      </header>
      <main style={{ padding: 16 }}>
        <h2>App Principal (web)</h2>
        <p>Placeholder. Vamos replicar os ecrãs do RN um a um.</p>
      </main>
      <NavBar onNavigate={(k)=>console.log('nav->', k)} selected="Home" />
    </div>
  );
}
