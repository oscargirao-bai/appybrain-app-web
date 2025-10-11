import React from 'react';
import Icon from './Icon.jsx';

export default function Button2({ icon, onPress, size = 40, style = {} }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,.13)',
        borderRadius: 10,
        background: '#fff',
        cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,.08)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...style
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <Icon name={icon} size={Math.round(size * 0.5)} color="#222" />
    </button>
  );
}
