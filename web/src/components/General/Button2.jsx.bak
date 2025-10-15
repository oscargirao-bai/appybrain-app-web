import React from 'react';

import LucideIcon from './LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * Button2 – square icon button.
 * Props ONLY:
 *  - onPress
 *  - size (number, default 56)
 *  - iconName (lucide icon string)
 *  - style (optional extra styles)
 */
export default function Button2({ iconName, size = 56, iconSize, onPress, onClick, style = {} }) {
  const colors = useThemeColors();
  const radius = 14;
  const finalIconSize = iconSize || Math.round(size * 0.46);
  
  // Support both onPress (RN) and onClick (web)
  const handleClick = onClick || onPress;
  
  // Default: show subtle border like mobile
  const baseContainer = {
    ...styles.base,
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: colors.background + 'F0',
    borderColor: (colors.text || '#fff') + '22',
  };

  // Remove border only for notifications/settings icons (requested)
  const isBorderless = iconName === 'bell' || iconName === 'settings';
  const container = {
    ...baseContainer,
    ...(isBorderless ? { border: 'none' } : {}),
    ...(style || {}),
  };
  
  return (
    <button
      onClick={handleClick}
      style={container}
      aria-label={iconName || 'Button'}
      onMouseDown={(e) => (e.currentTarget.style.opacity = '0.85')}
      onMouseUp={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <div style={styles.inner}>
        {iconName ? <LucideIcon name={iconName} size={finalIconSize} color={colors.text} /> : null}
      </div>
    </button>
  );
}

const styles = {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    padding: 0,
  },
  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

