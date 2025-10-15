import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import DataManager from '../../services/DataManager.jsx';

export default function DisciplineCircle({ 
  title, 
  iconName = 'book-open', 
  svgIcon, 
  color, 
  iconColor,
  disciplineId,
  onPress,
  onClick, // Support both onPress (RN) and onClick (web)
  style 
}) {
  const colors = useThemeColors();
  
  // Use onClick if provided, otherwise onPress
  const handleClick = onClick || onPress;

  const circleBackgroundColor = color ? addAlpha(color, 0.2) : colors.card;
  const circleColor = color || colors.border;
  const finalIconColor = iconColor || colors.text;

  const containerStyle = {
    ...styles.container,
    ...(style || {})
  };

  const circleStyle = {
    ...styles.circle,
    backgroundColor: circleColor,
    borderColor: circleBackgroundColor,
  };

  const titleStyle = {
    ...styles.title,
    color: colors.text
  };

  return (
    <button style={containerStyle} onClick={handleClick} aria-label={title}>
      <div style={styles.contentRow}>
        <div style={circleStyle}>
          {svgIcon ? (
            <SvgIcon 
              svgString={svgIcon} 
              size={32} 
              color={finalIconColor} 
            />
          ) : (
            <LucideIcon 
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
    justifyContent: 'flex-start',
    width: 200, // Match mobile
    marginTop: 6,
    marginBottom: 6,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
  },
  contentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circle: {
    width: 65, // Match mobile (was 56)
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3, // Match mobile border
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Match mobile
  },
  title: {
    fontFamily: family.bold,
    fontSize: 20, // Match mobile (was 16)
    fontWeight: '700',
    textAlign: 'left',
    lineHeight: '22px', // Match mobile
    flex: 1,
  },
};
