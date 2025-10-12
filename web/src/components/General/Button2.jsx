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
export default function Button2({ iconName, iconSize = 22, onPress, onClick, style = {} }) {
  const colors = useThemeColors();
  
  // Support both onPress (RN) and onClick (web)
  const handleClick = onClick || onPress;
  
  return (
    <button
      onClick={handleClick}
      style={{...styles.container, ...style}}
      aria-label="Button"
    >
      <div style={styles.inner}>
        {iconName ? <LucideIcon name={iconName} size={iconSize} color={colors.text} /> : null}
      </div>
    </button>
  );
}

const styles = {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid',
    cursor: 'pointer',
  },
  inner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

