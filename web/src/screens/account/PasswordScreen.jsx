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
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;

  const currentPassword = route?.params?.currentPassword || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? 520 : 420;
  const logoWidth = Math.min(width * 0.5, 320);

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
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: containerMaxWidth, padding: 16, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={logoSource} alt="App logo" style={{ width: logoWidth, objectFit: 'contain', marginTop: 6, marginBottom: 8 }} />
            <h1 style={{ margin: 0, marginBottom: 8, fontSize: width < 420 ? 22 : 32, color: colors.text, textAlign: 'center' }}>
              {translate('password.changeTitle') || 'Alterar Palavra‑passe'}
            </h1>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 32 }}>
              <TextInputField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={translate('password.new') || 'Nova palavra‑passe'}
                secureTextEntry
                icon="password"
                containerStyle={{ maxWidth: 420, width: '100%', marginBottom: 8 }}
              />

              <TextInputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={translate('password.confirm') || 'Confirmar palavra‑passe'}
                secureTextEntry
                icon="password"
                containerStyle={{ maxWidth: 420, width: '100%', marginBottom: 8 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky submit for small screens: center the button and keep it visible */}
      <div style={{ padding: 12, boxSizing: 'border-box', background: 'transparent', position: width < 720 ? 'fixed' : 'static', bottom: width < 720 ? 8 : 'auto', left: width < 720 ? 8 : 'auto', right: width < 720 ? 8 : 'auto', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: containerMaxWidth, padding: 2, boxSizing: 'border-box' }}>
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
