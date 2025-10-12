import React from 'react';
// Modal converted to div
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * ConfirmModal
 * Props:
 *  - visible (bool)
 *  - message (string | ReactNode)
 *  - onCancel () => void   (fires for "Não" & backdrop press)
 *  - onConfirm () => void  (fires for "Sim")
 *  - confirmLabel (optional string) default 'Sim'
 *  - cancelLabel  (optional string) default 'Não'
 *  - destructive (bool) -> color emphasis on confirm (uses error color)
 */
export default function ConfirmModal({
  visible,
  message = 'Tens a certeza?',
  onCancel,
  onConfirm,
  confirmLabel = 'Sim',
  cancelLabel = 'Não',
  destructive = false,
}) {
  const colors = useThemeColors();

  return (
    <Modal
      style={{display: visible ? "flex" : "none"}}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <div style={{...styles.backdrop, ...{ backgroundColor: colors.backdrop + 'AA' }}}> 
        <button style={StyleSheet.absoluteFill} onClick={onCancel}  aria-label="Fechar confirmação" />
        <div style={{...styles.panel, ...{ backgroundColor: colors.card}}> 
          <span style={{...styles.message, ...{ color: colors.text }}}>{message}</span>
          <div style={styles.row}> 
            <button               onClick={onCancel}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.surface, borderColor: colors.text + '25' },
                pressed && { opacity: 0.85 },
              ]}
              
              aria-label={cancelLabel}
            >
              <span style={{...styles.btnText, ...{ color: colors.text }}}>{cancelLabel}</span>
            </button>
            <button               onClick={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive
                  ? { backgroundColor: colors.error, borderColor: colors.error + '55' }
                  : { backgroundColor: colors.secondary, borderColor: colors.secondary + '55' },
                pressed && { opacity: 0.9 },
              ]}
              
              aria-label={confirmLabel}
            >
              <span style={{...styles.btnText, ...{ color: destructive ? colors.onError : colors.onSecondary }}}>{confirmLabel}</span>
            </button>
          </div>
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
  message: { fontSize: 16, fontWeight: '600', fontFamily: family.semibold, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  row: { flexDirection: 'row', gap: 14 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontWeight: '700', fontFamily: family.bold },
};
