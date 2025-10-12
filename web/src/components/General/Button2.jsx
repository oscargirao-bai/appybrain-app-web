import React from 'react';

import SvgIcon from '../../components/General/SvgIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * Button2 – square icon button.
 * Props ONLY:
 *  - onPress
 *  - size (number, default 56)
 *  - iconName (lucide icon string)
 *  - style (optional extra styles)
 */
export default function Button2({ onPress, size = 56, iconName = 'menu', style }) {
  const colors = useThemeColors();
  const radius = 14;
  const iconSize = Math.round(size * 0.46);
  return (
    <button       onClick={onPress}
      
      aria-label={iconName || 'button'}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.background + 'F0',
          borderColor: colors.text + '22',
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
      hitSlop={8}
    >
      <div style={styles.inner}>
        {iconName ? <SvgIcon name={iconName} size={iconSize} color={colors.text} /> : null}
      </div>
    </button>
  );
}

const styles = {
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
};

