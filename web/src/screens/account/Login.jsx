import React, { useState } from 'react';
import ApiManager from '../../services/ApiManager.js';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Login.css';

export default function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Por favor, preencha todos os campos.');
    setBusy(true);
    try {
      const res = await ApiManager.login(email, password);
      if (res?.success) {
        if (res.resetPassword === 1) onNavigate('Password');
        else onNavigate('Loading');
      } else {
        alert('Resposta inesperada do servidor.');
      }
    } catch (e) {
      alert(e?.message || 'Erro no login');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-crop">
          <img src="/assets/logo.png" alt="AppyBrain" className="logo-img" />
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label className="label"><Mail size={16}/> Email</label>
          <div className="field">
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" disabled={busy} />
          </div>

          <label className="label"><Lock size={16}/> Palavra-passe</label>
          <div className="field">
            <input type={show ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Palavra-passe" disabled={busy} />
            <button type="button" className="eye" onClick={()=>setShow(!show)} aria-label="toggle password">
              {show ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <div className="forgot">
            <button type="button" className="forgot-link" onClick={()=>onNavigate('Forgot')}>Esqueceste a palavra-passe?</button>
          </div>

          <button type="submit" className="primary" disabled={!email || !password || busy}>{busy ? 'A entrar...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  );
}
