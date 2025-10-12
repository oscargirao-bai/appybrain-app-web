import React from 'react';

import SvgIcon from '../../components/General/SvgIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * Battle Help bar — three icon-only buttons:
 *  - Aumentar o tempo
 *  - Retirar 1 resposta errada
 *  - Trocar pergunta
 */
export default function Help({ onAddTime, onRemoveWrong, onSwapQuestion, disabled = false }) {
  const colors = useThemeColors();

  return (
    <div style={styles.wrap} pointerEvents="box-none">
      <IconButton
        icon="clock"
        label="Aumentar o tempo"
        onClick={onAddTime}
        disabled={disabled}
        colors={colors}
      />
      <IconButton
        icon="circle-minus"
        label="Retirar 1 resposta errada"
        onClick={onRemoveWrong}
        disabled={disabled}
        colors={colors}
      />
      <IconButton
        icon="refresh-ccw"
        label="Trocar pergunta"
        onClick={onSwapQuestion}
        disabled={disabled}
        colors={colors}
      />
    </div>
  );
}

function IconButton({ icon, label, onPress, disabled, colors }) {
  return (
    <button       
      aria-label={label}
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      style={{...styles.btn, borderColor: colors.text + '22'}}
    >
      <SvgIcon name={icon} size={20} color={colors.text} />
    </button>
  );
}

const styles = {
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
};
