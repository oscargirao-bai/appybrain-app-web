import React from 'react';

export default function NotificationsModal({ visible, onClose, items = [] }) {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'#0007', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ width: 360, maxWidth:'92vw', background:'#fff', borderRadius:16, padding:16 }}>
        <div style={{ fontWeight:800, marginBottom:8 }}>Notificações</div>
        {items.length === 0 ? (
          <div style={{ opacity:.7 }}>Sem notificações</div>
        ) : (
          <ul style={{ maxHeight: 320, overflow:'auto', margin:0, padding:0, listStyle:'none' }}>
            {items.map(n => (
              <li key={n.id} style={{ padding:'8px 0', borderBottom:'1px solid #eee' }}>
                <div style={{ fontWeight:600 }}>{n.title || n.type}</div>
                <div style={{ opacity:.7, fontSize:13 }}>{n.message || ''}</div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ textAlign:'right', marginTop:12 }}>
          <button onClick={onClose} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:10, padding:'8px 14px', cursor:'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
