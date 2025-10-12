import React from 'react';
// Modal converted to div
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * MessageModal
 * Simple modal to display a message with a single OK button
 * Props:
 *  - visible (bool)
 *  - message (string)
 *  - title (optional string)
 *  - onClose () => void  (fires for "OK" & backdrop press)
 *  - buttonLabel (optional string) default 'OK'
 */
export default function MessageModal({
  visible,
  message = '',
  title = '',
  onClose,
  buttonLabel = 'OK',
}) {
  const colors = useThemeColors();

  return (
    <Modal
      style={{display: visible ? "flex" : "none"}}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <div style={{...styles.backdrop, ...{ backgroundColor: colors.backdrop + 'AA' }}}> 
        <button style={StyleSheet.absoluteFill} onClick={onClose}  aria-label="Fechar mensagem" />
        <div style={{...styles.panel, ...{ backgroundColor: colors.card}}> 
          {title ? (
            <span style={{...styles.title, ...{ color: colors.text }}}>{title}</span>
          ) : null}
          <span style={{...styles.message, ...{ color: colors.text }}}>{message}</span>
          <button             onClick={onClose}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, borderColor: colors.primary + '55' },
              pressed && { opacity: 0.9 },
            ]}
            
            aria-label={buttonLabel}
          >
            <span style={{...styles.btnText, ...{ color: colors.onPrimary }}}>{buttonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  panel: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700',
    fontFamily: family.bold,
    textAlign: 'center', 
    marginBottom: 12,
    lineHeight: 24 
  },
  message: { 
    fontSize: 16, 
    fontWeight: '500',
    fontFamily: family.medium,
    textAlign: 'center', 
    marginBottom: 20, 
    lineHeight: 22 
  },
  btn: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700', fontFamily: family.bold },
};