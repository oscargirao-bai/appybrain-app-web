import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from './Icon.jsx';
import './NavBar.css';

export default function NavBar({ icons = [], currentPage = 0, handleTabPress }) {
  const colors = useThemeColors();
  return (
    <nav className="navbar" style={{ background: colors.card, borderTopColor: colors.border }}>
      <div className="navbar-inner page-50">
        <div className="navbar-indicator" style={{ left: `${(currentPage / icons.length) * 100 + (100 / icons.length / 2)}%`, background: colors.primary }} />
        {icons.map((iconName, i) => {
          const isActive = i === currentPage;
          return (
            <button
              key={iconName + i}
              className={isActive ? 'navbar-btn active' : 'navbar-btn'}
              onClick={() => handleTabPress?.(i)}
              aria-label={`Tab ${i + 1}`}
            >
              <Icon name={iconName} size={24} color={isActive ? colors.primary : colors.muted} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
