import React from 'react';
import Icon from '../common/Icon.jsx';
import { t } from '../../services/Translate.js';

export default function Info({ username='—', tribe, stars=0, coins=0 }){
  const nf = (n)=> new Intl.NumberFormat('pt-PT').format(n||0);
  return (
    <div style={{ width:'100%', border:'0.5px solid rgba(0,0,0,.18)', borderTop:0, borderRadius:'0 0 18px 18px', padding:'8px 10px', background:'#fff', display:'flex', alignItems:'stretch' }}>
      <div style={{ flex:1, paddingRight:6, justifyContent:'center' }}>
        <div style={{ fontSize:16, fontWeight:700 }}>{username}</div>
        <div style={{ marginTop:2, fontSize:14, opacity:.65 }}>{tribe || t('common.noTribe')}</div>
      </div>
      <div style={{ justifyContent:'center', alignItems:'flex-end', display:'flex' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:'0.5px solid rgba(0,0,0,.2)', padding:'6px 10px', borderRadius:12, background:'rgba(255,255,255,.25)', fontWeight:600, fontSize:14 }}>
            <Icon name="star" size={18} color="#FFD54F" /><span>{nf(stars)}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:'0.5px solid rgba(0,0,0,.2)', padding:'6px 10px', borderRadius:12, background:'rgba(255,255,255,.25)', fontWeight:600, fontSize:14 }}>
            <Icon name="coins" size={18} color="#FFD54F" /><span>{nf(coins)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
