import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';

/**
 * Battle Help bar — three icon-only buttons:
 *  - Aumentar o tempo
 *  - Retirar 1 resposta errada
 *  - Trocar pergunta
 */
export default function Help({ onAddTime, onRemoveWrong, onSwapQuestion, disabled = false }) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <IconButton
        icon="clock"
        label="Aumentar o tempo"
        onPress={onAddTime}
        disabled={disabled}
        colors={colors}
      />
      <IconButton
        icon="circle-minus"
        label="Retirar 1 resposta errada"
        onPress={onRemoveWrong}
        disabled={disabled}
        colors={colors}
      />
      <IconButton
        icon="refresh-ccw"
        label="Trocar pergunta"
        onPress={onSwapQuestion}
        disabled={disabled}
        colors={colors}
      />
    </View>
  );
}

function IconButton({ icon, label, onPress, disabled, colors }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          borderColor: colors.text + '22',
          backgroundColor: disabled ? colors.text + '04' : colors.text + '06',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Icon name={icon} size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 12,
    paddingBottom: 6
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
