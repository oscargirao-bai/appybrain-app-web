import React, { useState } from 'react';
import './LoginScreen.css';
import ApiManager from '../../services/ApiManager.pure.js';

export default function LoginScreen({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    try {
      const loginResult = await ApiManager.login(email, password);

      if (loginResult && loginResult.success) {
        if (loginResult.resetPassword === 1) {
          onNavigate?.('Password');
        } else {
          onNavigate?.('Loading');
        }
      } else {
        alert('Resposta inesperada do servidor.');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', {
        status: error?.status,
        message: error?.message,
        data: error?.data,
        originalError: error?.originalError
      });

      let errorMessage = 'Falha no login. Verifique as suas credenciais.';

      if (error?.status === 0) {
        errorMessage = 'Erro de rede ou CORS. A API não está acessível.\n\nDetalhes na consola do browser (F12).';
      } else if (error?.status === 401) {
        errorMessage = 'Email ou palavra-passe incorretos.';
      } else if (error?.status === 500) {
        errorMessage = 'Erro do servidor. Tente novamente mais tarde.';
      } else if (error?.status === 408) {
        errorMessage = 'Tempo limite excedido. Verifique a sua ligação à internet.';
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo-container">
          <img src="/assets/logo.png" alt="AppyBrain Logo" className="logo" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Palavra-passe"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <button
              type="button"
              className="forgot-link"
              onClick={() => onNavigate?.('Forgot')}
            >
              Esqueceste a palavra-passe?
            </button>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={!email || !password || isLoading}
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
