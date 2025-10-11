import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import './Button3.css';

/**
 * Button3 - Card estilo linha com ícone + título em negrito itálico + switch à direita
 * Props:
 *  - icon (lucide icon name)
 *  - label (string)
 *  - value (boolean)
 *  - onValueChange (function)
 *  - disabled (boolean)
 */
export default function Button3({
  icon = 'volume-2',
  label = 'Efeitos Sonoros',
  value = false,
  onValueChange,
  disabled = false,
}) {
  const colors = useThemeColors();

  const handleToggle = () => {
    if (disabled) return;
    onValueChange && onValueChange(!value);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className="button3-card"
      style={{
        borderColor: colors.text + '22',
        backgroundColor: colors.text + '06',
        opacity: disabled ? 0.5 : 1,
      }}
      aria-label={label}
      aria-checked={value}
      role="switch"
    >
      <div className="button3-left-row">
        <i data-lucide={icon} style={{ color: colors.text }} />
        <span className="button3-label" style={{ color: colors.text }}>
          {label}
        </span>
      </div>
      <label className="button3-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={handleToggle}
          disabled={disabled}
        />
        <span
          className="button3-slider"
          style={{
            backgroundColor: value ? colors.secondary + '66' : colors.text + '33',
          }}
        >
          <span
            className="button3-thumb"
            style={{
              backgroundColor: value ? colors.secondary : colors.text,
            }}
          />
        </span>
      </label>
    </button>
  );
}
