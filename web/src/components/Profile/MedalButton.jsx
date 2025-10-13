import React from 'react';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';

// Visual sizes
const CIRCLE_SIZE = 58; // slightly smaller

export default function MedalButton({ item, onClick }) {
  const colors = useThemeColors();
  const isNew = !!item.justUnlocked;
  const badgeColor = item.color || colors.primary;
  const iconColor = item.iconColor || colors.text;

  return (
    <div style={styles.cell}>
      <button
        onClick={onClick}
        style={{
          ...styles.medalButton,
          opacity: item.unlocked ? 1 : 0.5,
        }}
        aria-label={`Medalha ${item.id}${item.unlocked ? ' desbloqueada' : ' bloqueada'}`}
      >
        <div style={{
          ...styles.medalOuter,
          borderColor: isNew ? badgeColor : badgeColor + '55',
        }}>
          <div style={{
            ...styles.medalInner,
            backgroundColor: item.unlocked ? badgeColor : '#00000022',
          }}>
            {item.icon && item.icon.includes('<svg') ? (
              <SvgIcon
                svgString={item.icon}
                size={34}
                color={item.unlocked ? iconColor : colors.text + '55'}
              />
            ) : (
              <LucideIcon
                name={item.icon}
                size={34}
                color={item.unlocked ? iconColor : colors.text + '55'}
              />
            )}
            {isNew && <div style={{ ...styles.newDot, borderColor: '#222' }} />}
          </div>
        </div>
      </button>
    </div>
  );
}

const styles = {
  cell: {
    paddingTop: 10,
    paddingBottom: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  medalOuter: {
    padding: 2,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'solid',
  },
  medalInner: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newDot: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFE247',
    borderWidth: 2,
    borderStyle: 'solid',
    boxShadow: '0 0 8px #FFE247',
  },
};
