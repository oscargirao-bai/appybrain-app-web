import React from 'react';
import Icon from '../common/Icon.jsx';

export default function Banner({ avatarUrl, backgroundUrl, frameUrl, bottomFlat=true, topFlat=false, onClick }) {
  const hasBg = !!backgroundUrl;
  const bgStyle = hasBg ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize:'cover', backgroundPosition:'center' } : { background:'linear-gradient(135deg,#FFE259,#FFD000)' };
  const topR = topFlat ? 0 : 22;
  const botR = bottomFlat ? 0 : 22;
  const borderRadius = `${topR}px ${topR}px ${botR}px ${botR}px`;
  return (
    <div onClick={onClick} style={{ position:'relative', width:'100%', height:180, ...bgStyle, borderRadius, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', cursor: onClick?'pointer':'default' }}>
      {frameUrl && <img src={frameUrl} alt="frame" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'stretch', pointerEvents:'none' }} />}
      <div style={{ position:'relative', width:108, height:108, border:'4px solid #fff', borderRadius:'50%', overflow:'hidden', background:'#E3F0FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Icon name="user" size={64} color="#1856A6" />}
      </div>
    </div>
  );
}
