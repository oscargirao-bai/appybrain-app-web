import React from 'react';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import SvgIcon from '../General/SvgIcon';
import DataManager from '../../services/DataManager';

export default function DisciplineCircle({ 
  title, 
  iconName = 'book-open', 
  svgIcon, 
  color, 
  iconColor,
  disciplineId,
  onPress, 
  style 
}) {
  const colors = useThemeColors();

  const circleBackgroundColor = color ? addAlpha(color, 0.2) : colors.card;
  const circleColor = color || colors.border;
  const finalIconColor = iconColor || colors.text;

  const containerStyle = {
    ...styles.container,
    ...(style || {})
  };

  const circleStyle = {
    ...styles.circle,
    backgroundColor: circleColor
  };

  const titleStyle = {
    ...styles.title,
    color: colors.text
  };

  return (
    <button style={containerStyle} onClick={onPress} aria-label={title}>
      <div style={styles.contentRow}>
        <div style={circleStyle}>
          {svgIcon ? (
            <SvgIcon 
              svgString={svgIcon} 
              size={32} 
              color={finalIconColor} 
            />
          ) : (
            <SvgIcon 
              name={iconName} 
              size={32} 
              color={finalIconColor} 
            />
          )}
        </div>
        <span style={titleStyle}>{title}</span>
      </div>
    </button>
  );
}

function addAlpha(hexOrRgba, alpha) {
  if (!hexOrRgba) return `rgba(0,0,0,${alpha})`;
  if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) {
    return hexOrRgba.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
      const parts = inner.split(',').map(p => p.trim());
      const [r, g, b] = parts;
      return `rgba(${r},${g},${b},${alpha})`;
    });
  }
  let h = hexOrRgba.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const int = parseInt(h, 16);
  const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  contentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: family.bold,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'left',
  },
};
