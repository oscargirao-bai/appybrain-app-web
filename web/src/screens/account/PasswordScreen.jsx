import React, { useState } from 'react';

import TextInputField from '../../components/LoginComponents/TextInput.jsx';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton.jsx';
import MessageModal from '../../components/General/MessageModal.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.jsx';

const logoSource = '/assets/logo.png';

export default function PasswordScreen({ navigation, route }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const width = window.innerWidth > 600 ? 600 : window.innerWidth;

  const currentPassword = route?.params?.currentPassword || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isTablet = width >= 768;
  const logoWidthPercent = isTablet ? 0.6 : 0.92;
  const logoWidth = Math.min(width * logoWidthPercent, 720);
  const logoCropFactor = 0.8;
  const logoVisibleHeight = Math.round(logoWidth * logoCropFactor);
  const logoVerticalShift = -logoWidth * 0.06;

  async function onSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert(translate('password.fillFields') || 'Por favor, preencha todos os campos.');
      return;
    }
    if (newPassword.length < 6) {
      window.alert(translate('password.minLength') || 'A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert(translate('password.mismatchDesc') || 'Certifique-se de que ambas as palavras-passe são iguais.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiManager.changePassword(currentPassword, newPassword, confirmPassword);
      setModalMessage(response?.message || translate('password.changedSuccess') || 'Password updated');
      setIsSuccess(Boolean(response?.success));
      setModalVisible(true);
    } catch (error) {
      console.error('Password change error:', error);
      setModalMessage(error?.message || translate('password.changeError') || 'Falha ao alterar a palavra-passe.');
      setIsSuccess(false);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleModalClose() {
    setModalVisible(false);
    if (isSuccess) navigation?.replace?.('Login');
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: width > 420 ? 'center' : 'flex-start',
        padding: width > 420 ? '4% 6% 12%' : '6% 6% 10%'
      }}>
        {/* Logo (same positioning as login) */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          paddingTop: '2%',
          marginBottom: '6%',
          height: Math.min(logoVisibleHeight, 260)
        }}>
          <div style={{ overflow: 'hidden', width: logoWidth, height: logoVisibleHeight, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <img
              src={logoSource}
              alt="App logo"
              style={{ width: logoWidth, height: logoWidth, objectFit: 'contain', transform: `translateY(${logoVerticalShift}px)` }}
            />
          </div>
        </div>

        {/* Form (fields placed same location as login) */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', marginBottom: '2%' }}>
            <TextInputField
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={translate('password.new') || 'Nova palavra‑passe'}
              label={translate('password.new') || 'Nova palavra‑passe'}
              secureTextEntry
              icon="password"
              containerStyle={{ maxWidth: Math.min(480, width - 48) }}
            />

            <TextInputField
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={translate('password.confirm') || 'Confirmar palavra‑passe'}
              label={translate('password.confirm') || 'Confirmar palavra‑passe'}
              secureTextEntry
              icon="password"
              containerStyle={{ maxWidth: Math.min(480, width - 48) }}
            />
          </div>

          <PrimaryButton
            title={translate('password.change') || 'Alterar palavra‑passe'}
            onClick={onSubmit}
            disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
            loading={isLoading}
          />
        </div>
      </div>

      <MessageModal visible={modalVisible} message={modalMessage} onClose={handleModalClose} buttonLabel={translate('common.ok') || 'OK'} />
    </div>
  );
}
