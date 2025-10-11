import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import './Button4.css';

/**
 * Button4 - Simple pill button (full-width) usado para ações secundárias em Settings
 * Props:
 *  - label (string)
 *  - onPress (function)
 *  - danger (bool) para colorir texto com tom secundário/danger
 */
export default function Button4({ label, onPress, danger, style }) {
  const colors = useThemeColors();

  return (
    <button
      onClick={onPress}
      className="button4-root"
      style={{
        borderColor: colors.text + '25',
        backgroundColor: colors.card + '55',
        ...style,
      }}
      aria-label={label}
    >
      <span
        className="button4-label"
        style={{ color: danger ? colors.error || '#ff4d50' : colors.text }}
      >
        {label}
      </span>
    </button>
  );
}
