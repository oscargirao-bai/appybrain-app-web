import React from 'react';

export default function RankingsModal({ visible, onClose }) {
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'#0007', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
      <div style={{ width: 380, maxWidth:'92vw', background:'#fff', borderRadius:16, padding:16 }}>
        <div style={{ fontWeight:800, marginBottom:8 }}>Classificações</div>
        <div style={{ opacity:.7, marginBottom:8 }}>Em breve: ranking por pontos/estrelas/XP</div>
        <div style={{ textAlign:'right' }}>
          <button onClick={onClose} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:10, padding:'8px 14px', cursor:'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
