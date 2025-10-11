import React from 'react';

export default function ChestRewardModal({ visible, onClose, rewards = [], chestType = 'bronze' }){
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'#0009', display:'grid', placeItems:'center', zIndex:9999 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:20, width:360, maxWidth:'90%', boxShadow:'0 10px 30px rgba(0,0,0,.2)' }}>
        <h3 style={{ margin:'0 0 10px' }}>Recompensas</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {rewards.length === 0 && <div style={{ opacity:.7 }}>Sem recompensas</div>}
          {rewards.map((r,i)=> (
            <div key={i} style={{ display:'flex', justifyContent:'space-between' }}>
              <div>{r.type}</div>
              <div>x{r.amount || 1}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, textAlign:'right' }}>
          <button onClick={onClose} style={{ border:'1px solid #ccc', borderRadius:10, padding:'8px 12px', background:'#fff', cursor:'pointer' }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
