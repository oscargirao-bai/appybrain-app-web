import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function ConfirmModal({
  visible,
  message = 'Tem a certeza?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  destructive = false,
}) {
  const colors = useThemeColors();

  if (!visible) {
    return null;
  }

  return (
    <div style={styles.modalContainer}>
      <div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'AA'}}>
        <button style={styles.backdropHit} onClick={onCancel} aria-label="Fechar confirmação" />
        <div style={{...styles.panel, backgroundColor: colors.card}}>
          <span style={{...styles.message, color: colors.text}}>{message}</span>
          <div style={styles.row}>
            <button
              onClick={onCancel}
              style={{...styles.btn, backgroundColor: colors.surface, borderColor: colors.text + '25'}}
              aria-label={cancelLabel}
            >
              <span style={{...styles.btnText, color: colors.text}}>{cancelLabel}</span>
            </button>
            <button
              onClick={onConfirm}
              style={{
                ...styles.btn,
                backgroundColor: destructive ? colors.error : colors.success,
                borderColor: destructive ? (colors.error + '55') : (colors.success + '55'),
              }}
              aria-label={confirmLabel}
            >
              <span style={styles.btnTextWhite}>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
  },
  backdrop: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  backdropHit: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  panel: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  message: {
    fontSize: 17,
    fontFamily: family.medium,
    textAlign: 'center',
    display: 'block',
    marginBottom: 20,
    lineHeight: '22px',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 12,
    borderWidth: '1px',
    borderStyle: 'solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
	btnText: {
		fontSize: 15,
		fontFamily: family.bold,
		letterSpacing: '0.3px',
		fontWeight: '700',
	},
};