import React, { useState, useEffect } from 'react';


import TextInputField from '../../components/LoginComponents/TextInput.jsx';
import PrimaryButton from '../../components/LoginComponents/PrimaryButton.jsx';
import MessageModal from '../../components/General/MessageModal.jsx';
import Button2 from '../../components/General/Button2.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.jsx';

// Logo from public folder
const logoSource = '/assets/logo.png';

// Web mock for safe area
const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });

export default function PasswordScreen({ navigation, route }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const width = window.innerWidth; const height = window.innerHeight;
  const insets = useSafeAreaInsets();

  // Get current password from route params (passed from login screen)
  const currentPassword = route?.params?.currentPassword || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isTablet = width >= 768;
  const containerMaxWidth = isTablet ? 520 : 480;
  const logoWidth = Math.min(width * 0.6, 480);
  const baseLift = isTablet ? 40 : 90;

  // Keyboard handling to shift content so inputs remain visible
  const [keyboardShift, setKeyboardShift] = useState(0);
  useEffect(() => {
    const showEvent = false ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = false ? 'keyboardDidHide' : 'keyboardWillHide';
    const showSub = { remove: () => {} };
    const hideSub = { remove: () => {} };
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  async function onSubmit() {
    // Basic validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      window.alert(translate('password.fillFields') || 'Por favor, preencha todos os campos.'
      );
      return;
    }
    if (newPassword.length < 6) {
      window.alert(translate('password.minLength') || 'A palavra-passe deve ter pelo menos 6 caracteres.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      window.alert(translate('password.mismatchDesc') || 'Certifique-se de que ambas são iguais.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // Use ApiManager's changePassword method with the new API format
      const response = await ApiManager.changePassword(currentPassword, newPassword, confirmPassword);
      
      // Show modal with response message
      setModalMessage(response.message || 'Password updated');
      setIsSuccess(response.success || false);
      setModalVisible(true);
      
    } catch (error) {
      console.error('Password change error:', error);
      // Show error in modal
      setModalMessage(error.message || 'Falha ao alterar a palavra-passe.');
      setIsSuccess(false);
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle modal close
  function handleModalClose() {
    setModalVisible(false);
    if (isSuccess) {
      // If success, go back to login screen
      navigation?.replace?.('Login');
    }
    // If not success, stay on password screen
  }

  return (
    <div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>      
      <div style={styles.topBar}>
        <Button2
          iconName="arrow-left"
          size={44}
          onClick={() => {
            if (navigation?.canGoBack?.()) navigation.goBack();
            else navigation?.replace?.('Login');
          }}
        />
      </div>
      <div style={styles.flex}>
        <div style={styles.staticContainer}> 
          {/* Use web-friendly transform string instead of RN-style array/object */}
          <div style={{...styles.inner, maxWidth: containerMaxWidth, transform: `translateY(${-(keyboardShift + baseLift)}px)`}}>            
            {/* Brand Logo */}
            <img               
              src={logoSource}
              style={{ width: logoWidth, aspectRatio: 1, marginTop: 24, objectFit: "contain" }}
              
              aria-label="App logo"
            />
            <span style={{...styles.welcome, ...{ color: colors.text }}}>{translate('password.changeTitle') || 'Alterar Palavra‑passe'}</span>
            <div style={styles.form}>
              <TextInputField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={translate('password.new') || 'Nova palavra‑passe'}
                secureTextEntry
                icon="password"
              />
              <TextInputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={translate('password.confirm') || 'Confirmar palavra‑passe'}
                secureTextEntry
                icon="password"
              />
              <PrimaryButton
                title={translate('password.change') || 'Alterar palavra‑passe'}
                onClick={onSubmit}
                disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Message Modal */}
      <MessageModal
        visible={modalVisible}
        message={modalMessage}
        onClose={handleModalClose}
        buttonLabel={translate('common.ok') || 'OK'}
      />
    </div>
  );
}

const styles = {
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: { paddingLeft: 12, paddingRight: 12, paddingTop: 8, zIndex: 10, elevation: 10 },
  staticContainer: { flex: 1, alignItems: 'center', paddingLeft: 24, paddingRight: 24 },
  inner: { width: '100%', alignItems: 'center', flexGrow: 1 },
  welcome: { fontSize: 42, fontWeight: '700', letterSpacing: -1, textAlign: 'center' },
  form: { width: '100%', alignItems: 'center', marginTop: 8 },
};
