import React from 'react';
import Icon from '../common/Icon.jsx';

export default function Info({ username = 'User', tribe = 'Sem Tribo', stars, onEdit, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 2px', ...style }}>
      <div style={{ flex: 1, paddingRight: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, flexShrink: 1 }}>{username}</h2>
          {onEdit && <button onClick={onEdit} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><Icon name="pencil" size={18} /></button>}
        </div>
        <p style={{ marginTop: 2, fontSize: 18, fontWeight: 500, opacity: 0.6, margin: 0 }}>{tribe}</p>
      </div>
      {typeof stars === 'number' && (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', border: '1px solid rgba(0,0,0,.2)', padding: '8px 16px', borderRadius: 18, background: 'rgba(255,255,255,.25)', minWidth: 90, justifyContent: 'center' }}>
          <Icon name="star" size={22} color="#FFD700" style={{ marginRight: 8 }} />
          <span style={{ fontSize: 18, fontWeight: 800 }}>{stars}</span>
        </div>
      )}
    </div>
  );
}
