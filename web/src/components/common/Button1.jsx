import React from 'react';

export default function Button1({ children, onPress, style = {}, textStyle = {} }) {
  return (
    <button
      onClick={onPress}
      className="button1"
      style={{
        position: 'relative',
        padding: '12px 24px',
        border: 'none',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #FFA500 0%, #FF6B00 100%)',
        color: '#fff',
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(255, 165, 0, 0.4)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        ...style
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      <span style={{ position: 'relative', zIndex: 1, ...textStyle }}>{children}</span>
      <div className="button1-shine" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)', borderRadius: '12px 12px 0 0', pointerEvents: 'none' }} />
    </button>
  );
}
