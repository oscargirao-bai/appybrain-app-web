import React, { useState } from 'react';
import ApiManager from '../../services/ApiManager.js';

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Preenche email e palavra-passe');
    setBusy(true);
    try {
      const res = await ApiManager.login(email, password);
      if (res?.success) {
        if (res.resetPassword === 1) onNavigate('Password');
        else onNavigate('Loading');
      } else {
        alert('Login inválido');
      }
    } catch (e) {
      alert(e?.message || 'Erro no login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={onSubmit} style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <img src="/assets/logo.png" alt="logo" style={{ width: 200, alignSelf: 'center', marginBottom: 16 }} />
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={busy} />
        <input type="password" placeholder="Palavra-passe" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={busy} />
        <button type="submit" disabled={!email || !password || busy}>{busy ? 'A entrar...' : 'Entrar'}</button>
      </form>
    </div>
  );
}
