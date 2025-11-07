import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { APP_VERSION } from '../version-app.js';
import { useTranslate } from './Translate.jsx';
import { useThemeColors } from './Theme.jsx';

const VersionContext = createContext({ 
  appVersion: 'dev', 
  updateAvailable: false, 
  manualCheck: () => {} 
});

const CHECK_INTERVAL_MS = 30000; // 30 segundos entre verificações
const CONFIRMATION_CHECK_DELAY = 3000; // 3 segundos para segunda confirmação
const SNOOZE_INTERVAL_MS = 60000; // 1 minuto antes de mostrar novamente

export const VersionProvider = ({ children }) => {
  const appVersion = APP_VERSION;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState(null);
  const [remoteCommit, setRemoteCommit] = useState(null);
  const lastCheckRef = useRef(0);
  const abortRef = useRef(null);
  const { translate: t } = useTranslate();
  const colors = useThemeColors();

  const mismatchRef = useRef(false);
  const snoozeUntilRef = useRef(0);
  const [showModal, setShowModal] = useState(false);

  const performCheck = async () => {
    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL_MS) {
      console.log('[VersionCheck] skipped (throttled)');
      return;
    }
    lastCheckRef.current = now;
    
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      
      const res = await fetch(`/version.json?ts=${Date.now()}`, { 
        cache: 'no-store', 
        signal: controller.signal 
      });
      
      if (!res.ok) return;
      
      const data = await res.json().catch(() => null);
      if (!data?.semanticVersion) return;
      
      const fetchedSemver = data.semanticVersion;
      
      const compareSemver = (a, b) => {
        const pa = a.split('.').map(n => parseInt(n, 10) || 0);
        const pb = b.split('.').map(n => parseInt(n, 10) || 0);
        const len = Math.max(pa.length, pb.length);
        for (let i = 0; i < len; i++) {
          const av = pa[i] ?? 0;
          const bv = pb[i] ?? 0;
          if (av > bv) return 1;
          if (av < bv) return -1;
        }
        return 0;
      };
      
      const cmp = compareSemver(fetchedSemver, appVersion);
      console.log('[VersionCheck] fetched version', { 
        fetched: fetchedSemver, 
        current: appVersion, 
        cmp 
      });
      
      if (cmp > 0) {
        // Remote version is newer
        if (!mismatchRef.current) {
          mismatchRef.current = true;
          console.log('[VersionCheck] first mismatch - scheduling confirmation');
          setTimeout(() => { 
            lastCheckRef.current = 0; 
            performCheck(); 
          }, CONFIRMATION_CHECK_DELAY);
          return;
        }
        
        console.log('[VersionCheck] confirmed mismatch');
        setRemoteVersion(fetchedSemver);
        setRemoteCommit(data.commitHash || null);
        setUpdateAvailable(true);
        
        if (Date.now() >= snoozeUntilRef.current) {
          setShowModal(true);
        }
      } else if (cmp === 0) {
        console.log('[VersionCheck] versions match');
        setRemoteVersion(null);
        setRemoteCommit(null);
        mismatchRef.current = false;
      } else {
        console.log('[VersionCheck] remote older - ignoring');
        mismatchRef.current = false;
        setRemoteVersion(null);
        setRemoteCommit(null);
        if (updateAvailable) setUpdateAvailable(false);
      }
    } catch (e) {
      console.log('[VersionCheck] fetch error (ignored)', e);
    }
  };

  const manualCheck = () => { 
    lastCheckRef.current = 0; 
    performCheck(); 
  };

  useEffect(() => {
    const clickHandler = () => performCheck();
    window.addEventListener('click', clickHandler, { capture: true });
    
    const visHandler = () => { 
      if (document.visibilityState === 'visible') manualCheck(); 
    };
    document.addEventListener('visibilitychange', visHandler);
    
    const interval = setInterval(() => { 
      performCheck(); 
    }, CHECK_INTERVAL_MS);
    
    performCheck();
    
    return () => {
      window.removeEventListener('click', clickHandler, { capture: true });
      document.removeEventListener('visibilitychange', visHandler);
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const remindTimeoutRef = useRef(null);
  
  const handleRemindLater = () => {
    snoozeUntilRef.current = Date.now() + SNOOZE_INTERVAL_MS;
    setShowModal(false);
    console.log('[VersionCheck] user snoozed update');
    
    if (remindTimeoutRef.current) {
      window.clearTimeout(remindTimeoutRef.current);
    }
    
    const ms = SNOOZE_INTERVAL_MS + 200;
    remindTimeoutRef.current = window.setTimeout(() => {
      if (updateAvailable && Date.now() >= snoozeUntilRef.current) {
        console.log('[VersionCheck] snooze expired - showing modal');
        setShowModal(true);
      }
    }, ms);
  };

  useEffect(() => {
    if (updateAvailable && Date.now() >= snoozeUntilRef.current) {
      setShowModal(true);
    }
  }, [updateAvailable, remoteVersion]);

  return (
    <VersionContext.Provider value={{ 
      appVersion, 
      updateAvailable, 
      manualCheck, 
      commitHash: remoteCommit 
    }}>
      {children}
      
      {updateAvailable && showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: colors.card,
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '28rem',
            width: '100%',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: colors.text,
                margin: 0
              }}>
                {t('version.updateAvailableTitle')}
              </h3>
            </div>
            
            <div style={{
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '14px',
              color: colors.text
            }}>
              <p style={{ margin: 0 }}>
                {t('version.updateModalMessage')}
              </p>
              
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div>{t('version.currentVersionLabel')} {appVersion}</div>
                {remoteVersion && <div>{t('version.newVersionLabel')} {remoteVersion}</div>}
                {remoteCommit && <div>hash: {remoteCommit}</div>}
              </div>
            </div>
            
            <div style={{
              padding: '16px 24px',
              display: 'flex',
              gap: '12px',
              backgroundColor: colors.surface,
              borderTop: `1px solid ${colors.border}`
            }}>
              <button
                onClick={handleRemindLater}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: colors.text,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {t('version.remindLater')}
              </button>
              
              <button
                onClick={handleReload}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: colors.error,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {t('version.reloadNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </VersionContext.Provider>
  );
};

export const useVersion = () => useContext(VersionContext);

export default VersionProvider;
