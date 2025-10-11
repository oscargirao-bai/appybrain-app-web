import React from 'react';

export default function NotificationBadge({ count = 0 }) {
  if (count === 0) return null;
  
  return (
    <span style={{
      position: 'absolute',
      top: 0,
      right: 0,
      background: '#ff3b30',
      color: '#fff',
      borderRadius: 10,
      fontSize: 10,
      padding: '0 6px',
      lineHeight: '16px',
      minWidth: 16,
      textAlign: 'center',
      fontWeight: 600
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}
