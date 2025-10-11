import React from 'react';
import Icon from '../common/Icon.jsx';
import SvgIcon from '../common/SvgIcon.jsx';

export default function Area({ title, svgIcon, color = '#FFD700', iconColor = '#222', onPress }){
  return (
    <button onClick={onPress} style={{
      display:'flex', flexDirection:'row', alignItems:'center', gap:12,
      border:'none', background:'transparent', cursor:'pointer', padding:0, marginVertical:6, width:200
    }}>
      <div style={{ 
        width:65, height:65, borderRadius:'50%', 
        background: color, 
        border: `3px solid ${color}22`,
        display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        {svgIcon && svgIcon.includes('<svg') ? (
          <SvgIcon svgString={svgIcon} size={32} color={iconColor} />
        ) : (
          <Icon name={svgIcon || 'book-open'} size={32} color={iconColor} />
        )}
      </div>
      <div style={{ fontSize:20, fontWeight:700, textAlign:'left', flex:1, lineHeight:'22px' }}>{title}</div>
    </button>
  );
}
