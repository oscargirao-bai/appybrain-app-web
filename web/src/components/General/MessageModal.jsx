import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function MessageModal({
  visible,
  message = '',
  title = '',
  onClose,
  buttonLabel = 'OK',
}) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'AA'}}>
      <button
        style={styles.backdropButton}
        onClick={onClose}
        aria-label="Fechar mensagem"
      />
      <div style={{...styles.panel, backgroundColor: colors.card}}>
        {title ? (
          <span style={{...styles.title, color: colors.text}}>{title}</span>
        ) : null}
        <span style={{...styles.message, color: colors.text}}>{message}</span>
        <button
          onClick={onClose}
          style={{
            ...styles.btn,
            backgroundColor: colors.primary,
            borderColor: colors.primary + '55',
          }}
          aria-label={buttonLabel}
        >
          <span style={{...styles.btnText, color: colors.onPrimary}}>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    zIndex: 1000,
  },
  backdropButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    background: 'transparent',
    border: 'none',
    cursor: 'default',
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1,
    borderStyle: 'solid',
    position: 'relative',
    zIndex: 1001,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: family.bold,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: '24px',
    display: 'block',
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: family.medium,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: '22px',
    display: 'block',
  },
  btn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 18,
    paddingTop: 13,
    paddingBottom: 13,
    paddingLeft: 16,
    paddingRight: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'transparent',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: family.bold,
  },
};
