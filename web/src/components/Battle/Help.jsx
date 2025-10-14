import React from 'react';

import LucideIcon from '../../components/General/LucideIcon.jsx';
import { useTheme } from '../../services/Theme.jsx';

/**
 * Battle Help bar — three icon-only buttons:
 *  - Aumentar o tempo
 *  - Retirar 1 resposta errada
 *  - Trocar pergunta
 */
export default function Help({ onAddTime, onRemoveWrong, onSwapQuestion, disabled = false }) {
  const { colors, resolvedTheme } = useTheme();

  return (
    <div style={styles.wrap} pointerEvents="box-none">
      <IconButton
        icon="clock"
        label="Aumentar o tempo"
        onClick={onAddTime}
        disabled={disabled}
        colors={colors}
        theme={resolvedTheme}
      />
      <IconButton
        icon="circle-minus"
        label="Retirar 1 resposta errada"
        onClick={onRemoveWrong}
        disabled={disabled}
        colors={colors}
        theme={resolvedTheme}
      />
      <IconButton
        icon="refresh-ccw"
        label="Trocar pergunta"
        onClick={onSwapQuestion}
        disabled={disabled}
        colors={colors}
        theme={resolvedTheme}
      />
    </div>
  );
}

function IconButton({ icon, label, onClick, disabled, colors, theme }) {
  const addAlpha = (hex, alpha) => (typeof hex === 'string' && hex.startsWith('#') && hex.length === 7 ? `${hex}${alpha}` : hex);
  const backgroundColor = disabled ? addAlpha(colors.text, '04') : addAlpha(colors.text, '06');
  const baseIconColor = theme === 'dark' ? colors.secondary : colors.text;
  const iconColor = disabled ? addAlpha(baseIconColor, '66') : baseIconColor;
  return (
    <button
      aria-label={label}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        ...styles.btn,
        borderColor: colors.text + '22',
        backgroundColor,
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <LucideIcon name={icon} size={20} color={iconColor} />
    </button>
  );
}

const styles = {
  wrap: {
    display: 'flex',
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
