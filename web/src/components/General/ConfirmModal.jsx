import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
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
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop + 'AA' }]}> 
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Fechar confirmação" />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.text + '22' }]}> 
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          <View style={styles.row}> 
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.surface, borderColor: colors.text + '25' },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={[styles.btnText, { color: colors.text }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                destructive
                  ? { backgroundColor: colors.error, borderColor: colors.error + '55' }
                  : { backgroundColor: colors.secondary, borderColor: colors.secondary + '55' },
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={[styles.btnText, { color: destructive ? colors.onError : colors.onSecondary }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
});
