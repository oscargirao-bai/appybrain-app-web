import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../common/Icon.jsx';
import { t } from '../../services/Translate.js';

export default function Info({ username='—', tribe, stars=0, coins=0, trophies }){
  const colors = useThemeColors();
  const nf = (n)=> new Intl.NumberFormat('pt-PT').format(n||0);
  
  // Use trophies if provided, otherwise stars
  const metricIcon = trophies !== undefined ? 'trophy' : 'star';
  const metricValue = trophies !== undefined ? trophies : stars;
  
  return (
    <div style={{ width:'100%', border:`0.5px solid ${colors.border}`, borderTop:0, borderRadius:'0 0 18px 18px', padding:'8px 10px', background:colors.card, display:'flex', alignItems:'stretch' }}>
      <div style={{ flex:1, paddingRight:6, justifyContent:'center' }}>
        <div style={{ fontSize:16, fontWeight:700, color:colors.text }}>{username}</div>
        <div style={{ marginTop:2, fontSize:14, color:colors.muted }}>{tribe || t('common.noTribe')}</div>
      </div>
      <div style={{ justifyContent:'center', alignItems:'flex-end', display:'flex' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:`0.5px solid ${colors.border}`, padding:'6px 10px', borderRadius:12, background:colors.surface, fontWeight:600, fontSize:14, color:colors.text }}>
            <Icon name={metricIcon} size={18} color="#FFD54F" /><span>{nf(metricValue)}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, border:`0.5px solid ${colors.border}`, padding:'6px 10px', borderRadius:12, background:colors.surface, fontWeight:600, fontSize:14, color:colors.text }}>
            <Icon name="coins" size={18} color="#FFD54F" /><span>{nf(coins)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
