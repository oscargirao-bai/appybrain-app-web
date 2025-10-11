import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * ChangeNameModal
 * Modal for changing user's display name
 * Props:
 *  - visible (bool)
 *  - currentName (string) - current user name to prefill
 *  - onCancel () => void
 *  - onConfirm (newName: string) => void
 */
export default function ChangeNameModal({
  visible,
  currentName = '',
  onCancel,
  onConfirm,
}) {
  const colors = useThemeColors();
  const [newName, setNewName] = useState(currentName);

  // Reset name when modal opens
  React.useEffect(() => {
    if (visible) {
      setNewName(currentName);
    }
  }, [visible, currentName]);

  const handleConfirm = () => {
    const trimmedName = newName.trim();
    if (trimmedName.length > 0) {
      onConfirm(trimmedName);
    }
  };

  const isValidName = newName.trim().length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop + 'AA' }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" accessibilityLabel="Fechar modal" />
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.text + '22' }]}>
          <Text style={[styles.title, { color: colors.text }]}>Mudar Nome</Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.text + '25',
                color: colors.text
              }
            ]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Novo nome"
            placeholderTextColor={colors.muted}
            maxLength={50}
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.row}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.surface, borderColor: colors.text + '25' },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
            >
              <Text style={[styles.btnText, { color: colors.text }]}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              disabled={!isValidName}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: isValidName ? colors.secondary : colors.surface,
                  borderColor: isValidName ? colors.secondary + '55' : colors.text + '25',
                  opacity: isValidName ? 1 : 0.5
                },
                pressed && isValidName && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Confirmar mudança de nome"
            >
              <Text style={[styles.btnText, { color: isValidName ? colors.onSecondary : colors.text }]}>
                Confirmar
              </Text>
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
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: family.bold,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: family.semibold,
    marginBottom: 20,
  },
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