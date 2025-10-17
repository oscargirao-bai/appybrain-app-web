import React, { useEffect, useState } from 'react';

export default function StoreRedirect() {
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (isAndroid) setPlatform('android');
    else if (isIOS) setPlatform('ios');
    else setPlatform('web');
  }, []);

  useEffect(() => {
    // No automatic redirect: user must click the store logo to open the store.
    // This keeps control with the user and avoids accidental navigations.
  }, [platform]);

  const renderStore = () => {
    if (platform === 'android') {
      return (
        <a href="https://play.google.com/store/apps/details?id=com.baidigital.appybrain" target="_blank" rel="noreferrer">
          <img src="/assets/googlestore.jpg" alt="Google Play" style={{ maxWidth: 220, width: '60%' }} />
        </a>
      );
    }
    if (platform === 'ios') {
      return (
        <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">
          <img src="/assets/applestore.jpg" alt="App Store" style={{ maxWidth: 220, width: '60%' }} />
        </a>
      );
    }
    return null;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 40,
      background: '#ffffff',
      color: '#0b0b0b'
    }}>
      <a href="https://www.appybrain.pt" target="_blank" rel="noopener noreferrer">
        <img src="/assets/logo.png" alt="AppyBrain" style={{ width: 240, height: 240, objectFit: 'contain' }} />
      </a>
      <div style={{ marginTop: 28, textAlign: 'center', maxWidth: 420, padding: '0 16px' }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Esta App está disponível em:</div>
        <div style={{ marginTop: 18 }}>
          {renderStore()}
        </div>
        {/* instruction removed as requested */}
      </div>
      {/* On desktop/web show nothing else (normal app loads) */}
    </div>
  );
}
