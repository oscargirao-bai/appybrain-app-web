import React from 'react';

const CHESTS = {
  bronze: '/assets/chests/chest-bronze.png',
  silver: '/assets/chests/chest-silver.png',
  gold: '/assets/chests/chest-gold.png',
  epic: '/assets/chests/chest-epic.png',
};

export default function ChestBrowserModal({ visible, onClose, onChestOpened, dataSource = 'stars' }) {
  if (!visible) return null;
  // Minimal UI: shows available chests fetched during boot (not wired to API open yet)
  const list = [
    { id: 'demo-1', type: 'bronze', milestone: 4 },
    { id: 'demo-2', type: 'silver', milestone: 8 },
  ];
  return (
    <div style={{ position:'fixed', inset:0, background:'#0007', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60 }}>
      <div style={{ width: 420, maxWidth:'92vw', background:'#fff', borderRadius:16, padding:16 }}>
        <div style={{ fontWeight:800, marginBottom:10 }}>Baús</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
          {list.map(c => (
            <button key={c.id} onClick={() => { onChestOpened?.([{ id:'coins', type:'coins', amount:5 }], c.type); onClose?.(); }} style={{ background:'#f9fbff', border:'1px solid #e5efff', borderRadius:12, padding:12, cursor:'pointer' }}>
              <img src={CHESTS[c.type]} alt={c.type} style={{ width:64, height:64, objectFit:'contain' }} />
              <div style={{ fontSize:12, opacity:.7, marginTop:6 }}>Marco: {c.milestone}</div>
            </button>
          ))}
        </div>
        <div style={{ textAlign:'right', marginTop:12 }}>
          <button onClick={onClose} style={{ border:'1px solid #ddd', background:'#fff', borderRadius:10, padding:'8px 14px', cursor:'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
