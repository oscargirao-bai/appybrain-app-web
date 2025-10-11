import React from 'react';
import Icon from '../common/Icon.jsx';

export default function Area({ title, svgIcon, color = '#222', iconColor = '#222', onPress }){
  return (
    <button onClick={onPress} style={{
      display:'flex', alignItems:'center', gap:10,
      border:'1px solid rgba(0,0,0,.15)', borderRadius:14, padding:'10px 14px',
      background:'#fff', cursor:'pointer', minWidth:140, justifyContent:'flex-start'
    }}>
      <div style={{ width:32, height:32, borderRadius:8, background: color + '22', display:'grid', placeItems:'center' }}>
        <Icon name={svgIcon || 'book-open'} size={20} color={iconColor} />
      </div>
      <div style={{ fontWeight:700 }}>{title}</div>
    </button>
  );
}
