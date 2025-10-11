import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
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
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop + 'AA' }]}> 
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar mensagem" />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.text + '22' }]}> 
          {title ? (
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          ) : null}
          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: colors.primary, borderColor: colors.primary + '55' },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
          >
            <Text style={[styles.btnText, { color: colors.onPrimary }]}>{buttonLabel}</Text>
          </Pressable>
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
});