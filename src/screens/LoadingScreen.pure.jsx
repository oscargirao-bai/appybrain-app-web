import React, { useEffect, useState, useRef } from 'react';
import './LoadingScreen.css';
import ApiManager from '../services/ApiManager.pure.js';

export default function LoadingScreen({ onNavigate }) {
  const [loadingText, setLoadingText] = useState('A carregar medalhas...');
  const [logoOpacity, setLogoOpacity] = useState(0);
  const skaterRef = useRef(null);

  useEffect(() => {
    // Fade in logo
    setTimeout(() => setLogoOpacity(1), 100);

    // Animate skater
    if (skaterRef.current) {
      skaterRef.current.style.animation = 'skate 3s linear infinite';
    }

    // Change loading text after 2s
    const textTimer = setTimeout(() => {
      setLoadingText('A carregar conteúdos...');
    }, 2000);

    // Load app data
    useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[LoadingScreen] Starting data load...');

        // Validate session
        const sessionResponse = await ApiManager.validateSession();

        if (!sessionResponse || !sessionResponse.success) {
          console.error('[LoadingScreen] Session invalid');
          onNavigate?.('Login');
          return;
        }

        console.log('[LoadingScreen] Session valid, user:', sessionResponse.user);

        // TODO: Load medals and content
        // const medals = await ApiManager.get('medals');
        // const content = await ApiManager.get('content');

        console.log('[LoadingScreen] Data loaded successfully');

        // Navigate to main app after short delay
        setTimeout(() => {
          onNavigate?.('Main');
        }, 1500);
      } catch (error) {
        console.error('[LoadingScreen] Load failed:', error);
        onNavigate?.('Login');
      }
    };

    loadData();
  }, [onNavigate]);

    return () => clearTimeout(textTimer);
  }, [onNavigate]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img 
          src="/assets/logo.png" 
          alt="AppyBrain Logo" 
          className="loading-logo"
          style={{ opacity: logoOpacity }}
        />

        <div className="loading-animation">
          <div ref={skaterRef} className="skater">
            🛹
          </div>
        </div>

        <p className="loading-text">{loadingText}</p>
      </div>

      <div className="rainbow-bars"></div>
    </div>
  );
}
