import React, { useState, useEffect } from 'react';
import DataManager from '../../services/DataManager.js';
import Icon from '../common/Icon.jsx';

export default function RankingsModal({ visible, onClose }){
  const [tab, setTab] = useState('global'); // global|school|class
  const [metric, setMetric] = useState('points'); // points|stars|xp
  const [rankings, setRankings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const update = () => {
      const r = DataManager.getRankings(metric);
      setRankings(r?.ranking || []);
      setCurrentUser(r?.ranking?.find(u => u.me === 1));
    };
    update();
    const unsub = DataManager.subscribe(update);
    return unsub;
  }, [metric]);
  const currentOrgName = currentUser?.organizationName;
  const currentTeamName = currentUser?.teamName;
  const data = React.useMemo(() => {
    let filtered = rankings;
    if (tab==='school') filtered = rankings.filter(u => u.organizationName === currentOrgName);
    else if (tab==='class') filtered = rankings.filter(u => u.teamName === currentTeamName);
    return filtered.map(u => ({
      id: u.userId?.toString(),
      name: u.nickname,
      value: u.points||0,
      self: u.me===1,
      position: u.position,
      avatarUrl: u.avatarUrl
    }));
  }, [rankings, tab, currentOrgName, currentTeamName]);
  const MetricBtn = ({ label, value, icon }) => {
    const active = metric === value;
    return <button onClick={()=>setMetric(value)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid rgba(0,0,0,.2)', borderRadius:10, background: active?'rgba(0,0,0,.05)':'transparent', cursor:'pointer', borderColor: active?'#FFD700':'rgba(0,0,0,.2)' }}>
      {icon ? <Icon name={icon} size={16} color={active?'#FFD700':'#222'} /> : <span style={{ fontSize:13, fontWeight:700, color: active?'#FFD700':'#222' }}>XP</span>}
    </button>;
  };
  const TabBtn = ({ label, value, icon }) => {
    const active = tab === value;
    return <button onClick={()=>setTab(value)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', border:'1px solid rgba(0,0,0,.2)', borderRadius:10, background: active?'rgba(0,0,0,.05)':'transparent', cursor:'pointer', borderColor: active?'#FFD700':'rgba(0,0,0,.2)' }}>
      <Icon name={icon} size={16} color={active?'#FFD700':'#222'} />
      <span style={{ fontSize:13, fontWeight:700, color: active?'#FFD700':'#222' }}>{label}</span>
    </button>;
  };
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'#0008', display:'grid', placeItems:'center', zIndex:9999, padding:'40px 20px' }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:24, padding:18, width:480, maxWidth:'100%', maxHeight:'80vh', display:'flex', flexDirection:'column', border:'1px solid rgba(0,0,0,.13)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
          <div style={{ fontSize:18, fontWeight:700 }}>Rankings</div>
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
          <MetricBtn label="Pontos" value="points" icon="trophy" />
          <MetricBtn label="Estrelas" value="stars" icon="star" />
          <MetricBtn label="XP" value="xp" icon={null} />
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:16, flexWrap:'wrap' }}>
          <TabBtn label="Global" value="global" icon="globe" />
          <TabBtn label="Escola" value="school" icon="school" />
          <TabBtn label="Turma" value="class" icon="users" />
        </div>
        <div style={{ flex:1, minHeight:200, maxHeight:400, overflowY:'auto' }}>
          {data.length===0 && <div style={{ textAlign:'center', paddingVertical:16, opacity:.67 }}>Sem dados</div>}
          {data.map((u,idx)=> (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderBottom:'1px solid rgba(0,0,0,.08)', background: u.self?'rgba(255,215,0,.08)':'transparent' }}>
              <div style={{ fontWeight:700, fontSize:14, width:30 }}>{u.position}</div>
              {u.avatarUrl ? <img src={u.avatarUrl} alt="avatar" style={{ width:32, height:32, borderRadius:999, border:'2px solid rgba(0,0,0,.1)' }} /> : <div style={{ width:32, height:32, borderRadius:999, background:'#E3F0FF', border:'2px solid rgba(0,0,0,.1)' }} />}
              <div style={{ flex:1, fontWeight: u.self?700:500, fontSize:14 }}>{u.name}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{u.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
