import React from 'react';
import Icon from './Icon.jsx';
import './NavBar.css';

export default function NavBar({ icons = [], currentPage = 0, handleTabPress }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner page-50">
        <div className="navbar-indicator" style={{ left: `${(currentPage / icons.length) * 100 + (100 / icons.length / 2)}%` }} />
        {icons.map((iconName, i) => {
          const isActive = i === currentPage;
          return (
            <button
              key={iconName + i}
              className={isActive ? 'navbar-btn active' : 'navbar-btn'}
              onClick={() => handleTabPress?.(i)}
              aria-label={`Tab ${i + 1}`}
            >
              <Icon name={iconName} size={24} color={isActive ? '#FFD700' : '#333'} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
