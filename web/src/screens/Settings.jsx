import React, { useState, useCallback, useEffect } from 'react';
import { t } from '../services/Translate.js';
import { useThemeColors } from '../services/Theme.jsx';
import apiManagerInstance from '../services/ApiManager';
import DataManager from '../services/DataManager';
import Icon from '../components/common/Icon.jsx';
import Button3 from '../components/common/Button3';
import Button4 from '../components/common/Button4';
import ButtonLightDark from '../components/settings/ButtonLightDark';
import ButtonLanguage from '../components/settings/ButtonLanguage';
import PrivacyModal from '../components/settings/PrivacyModal';
import ChangeNameModal from '../components/settings/ChangeNameModal';
import MessageModal from '../components/common/MessageModal';
import '../styles/container.css';
import './Settings.css';

const VIBRATION_KEY = 'appybrain.vibration';

export default function Settings({ onNavigate }) {
  const colors = useThemeColors();
  const [vibration, setVibration] = useState(() => {
    const stored = localStorage.getItem(VIBRATION_KEY);
    return stored === null ? true : stored === '1';
  });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [changeNameOpen, setChangeNameOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '' });

  useEffect(() => {
    const updateData = () => {
      const userData = DataManager.getUser();
      setCurrentUserName(userData?.nickname || userData?.firstName || '');
    };
    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  const handleVibrationChange = useCallback((val) => {
    setVibration(val);
    localStorage.setItem(VIBRATION_KEY, val ? '1' : '0');
  }, []);

  const handleChangeName = async (newNickname) => {
    setChangeNameOpen(false);
    try {
      await apiManagerInstance.updateNickname(newNickname);
      await DataManager.refreshSection('userInfo');
      setCurrentUserName(newNickname);
    } catch (error) {
      console.error('Error updating nickname:', error);
      if (error.status === 409) {
        setMessageModal({
          title: t('error'),
          message: t('settings.nick_in_use'),
          visible: true,
        });
      } else {
        setMessageModal({
          title: t('error'),
          message: t('settings.nick_error'),
          visible: true,
        });
      }
    }
  };

  const handleLogout = useCallback(() => {
    const confirmed = window.confirm('Tem a certeza de que deseja terminar a sessão?');
    if (confirmed) {
      (async () => {
        try {
          await apiManagerInstance.logout();
          onNavigate('Login');
        } catch (error) {
          console.error('Logout error:', error);
          onNavigate('Login');
        }
      })();
    }
  }, [onNavigate]);

  const INSTAGRAM_URL = 'https://www.instagram.com/appy_brain/';
  const handleOpenInstagram = useCallback(() => {
    window.open(INSTAGRAM_URL, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="page-container-50">
      <div className="settings-screen" style={{ backgroundColor: colors.background }}>
        <div className="settings-header">
          <button className="settings-back-btn" onClick={() => onNavigate('Profile')} aria-label="Voltar">
            <Icon name="arrow-left" size={24} color={colors.text} />
          </button>
          <h1 className="settings-title" style={{ color: colors.text }}>
            {t('settings.settings')}
          </h1>
          <div style={{ width: 40 }} />
        </div>

      <div className="settings-content">
        <h3 className="settings-section-title" style={{ color: colors.text }}>
          {t('profile.overviewTitle')}
        </h3>
        <Button4 label={t('profile.customize')} onPress={() => onNavigate('Customize')} />
        <Button4 label={t('settings.customizeProfile')} onPress={() => setChangeNameOpen(true)} />

        <h3 className="settings-section-title" style={{ color: colors.text }}>
          {t('settings.general')}
        </h3>
        <Button3 icon="vibrate" label={t('settings.vibrations')} value={vibration} onValueChange={handleVibrationChange} />
        <ButtonLightDark />

        <h3 className="settings-section-title" style={{ color: colors.text, marginTop: 24 }}>
          {t('settings.account')}
        </h3>
        <Button4 label={t('settings.privacyPolicy')} onPress={() => setPrivacyOpen(true)} />
        <Button4 label={t('settings.logout')} onPress={handleLogout} danger />
      </div>

      <div className="settings-instagram-row">
        <button className="settings-instagram-btn" onClick={handleOpenInstagram}>
          <img src="/assets/Instagram_Glyph_Gradient.png" alt="Instagram" className="settings-instagram-img" />
          <span className="settings-instagram-text" style={{ color: colors.text }}>appy_brain</span>
        </button>
      </div>

      <ChangeNameModal visible={changeNameOpen} currentName={currentUserName} onCancel={() => setChangeNameOpen(false)} onConfirm={handleChangeName} />
      <PrivacyModal visible={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <MessageModal visible={messageModal.visible} title={messageModal.title} message={messageModal.message} onClose={() => setMessageModal({ visible: false, title: '', message: '' })} />
      </div>
    </div>
  );
}
