import React from 'react';
import { useTheme, useThemeColors } from '../../services/Theme.jsx';
import './ButtonLightDark.css';

/**
 * ButtonLightDark - selector 2 estados (Light / Dark) estilo segmented control
 */
export default function ButtonLightDark({ style, onChange }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const colors = useThemeColors();
  const active = resolvedTheme; // 'light' | 'dark'

  const handleSelect = (t) => {
    setTheme(t);
    onChange && onChange(t);
  };

  const lightActive = active === 'light';
  const darkActive = active === 'dark';

  return (
    <div
      className="button-light-dark-wrapper"
      style={{
        borderColor: colors.text + '22',
        backgroundColor: colors.text + '06',
        ...style,
      }}
    >
      <Segment
        label="Modo Claro"
        icon="sun"
        active={lightActive}
        onPress={() => handleSelect('light')}
        colors={colors}
        position="left"
      />
      <Segment
        label="Modo Escuro"
        icon="moon"
        active={darkActive}
        onPress={() => handleSelect('dark')}
        colors={colors}
        position="right"
      />
    </div>
  );
}

function Segment({ label, icon, active, onPress, colors, position }) {
  return (
    <button
      onClick={onPress}
      className={`button-light-dark-segment ${position === 'left' ? 'left' : 'right'} ${
        active ? 'active' : ''
      }`}
      style={{
        backgroundColor: active ? colors.secondary : 'transparent',
        boxShadow: active ? `0 2px 8px ${colors.secondary}44` : 'none',
      }}
      aria-label={label}
      aria-pressed={active}
    >
      <i data-lucide={icon} style={{ color: active ? '#fff' : colors.text }} />
      <span style={{ color: active ? '#fff' : colors.text }}>{label}</span>
    </button>
  );
}
