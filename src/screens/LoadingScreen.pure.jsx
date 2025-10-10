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
    const loadAppData = async () => {
      try {
        // Validate session
        const isValid = await ApiManager.get('auth/validate');
        
        if (!isValid || !isValid.success) {
          console.error('Session invalid');
          onNavigate?.('Login');
          return;
        }

        // Load medals
        console.log('Loading medals...');
        await ApiManager.get('medals');

        // Load content
        setLoadingText('A carregar conteúdos...');
        console.log('Loading content...');
        await ApiManager.get('content');

        // Wait minimum time for smooth transition
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Navigate to main app
        console.log('Loading complete, navigating to main app');
        onNavigate?.('Main');
      } catch (error) {
        console.error('Loading error:', error);
        // If error, go back to login
        onNavigate?.('Login');
      }
    };

    loadAppData();

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
