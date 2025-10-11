import React, { useState, useEffect } from 'react';
import DataManager from '../../services/DataManager.js';
import Icon from '../common/Icon.jsx';

function iconForType(type) {
  switch(type) {
    case 'chest': return 'gift';
    case 'tribe': return 'users';
    case 'battle': return 'swords';
    default: return 'bell';
  }
}

export default function NotificationsModal({ visible, onClose }){
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const update = () => setNotifications(DataManager.getSortedNotifications());
    update();
    const unsub = DataManager.subscribe(update);
    return unsub;
  }, []);
  const markRead = async (item) => {
    await DataManager.markNotificationAsRead(item.id);
    onClose();
  };
  const markAllRead = async () => {
    setLoading(true);
    await DataManager.markNotificationAsRead(0);
    setLoading(false);
  };
  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'#0008', display:'grid', placeItems:'center', zIndex:9999 }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:24, padding:16, width:440, maxWidth:'90%', maxHeight:'85vh', display:'flex', flexDirection:'column', border:'1px solid rgba(0,0,0,.13)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8, paddingVertical:4, position:'relative' }}>
          <div style={{ fontSize:18, fontWeight:700 }}>Notificações</div>
          <div style={{ position:'absolute', right:0, top:0, paddingVertical:2 }}>
            <button onClick={markAllRead} disabled={loading} style={{ padding:'6px 14px', border:'1px solid rgba(0,0,0,.2)', borderRadius:18, minHeight:32, background:'rgba(0,0,0,.03)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, cursor:'pointer' }}>{loading?'...':'Limpar'}</button>
          </div>
        </div>
        <div style={{ flexGrow:0, maxHeight:520, overflowY:'auto' }}>
          {notifications.length===0 && <div style={{ color:'rgba(0,0,0,.53)', textAlign:'center', paddingVertical:16 }}>Sem notificações</div>}
          {notifications.map((item,idx) => {
            const unread = item.readAt === null;
            return (
              <div key={item.id} onClick={()=>markRead(item)} style={{ display:'flex', border:'1px solid rgba(0,0,0,.08)', borderRadius:18, padding:'12px', gap:12, alignItems:'flex-start', marginBottom:10, background: unread ? 'rgba(255,215,0,.09)' : 'rgba(0,0,0,.02)', borderColor: unread ? 'rgba(255,215,0,.4)' : 'rgba(0,0,0,.08)', cursor:'pointer' }}>
                <div style={{ width:34, height:34, borderRadius:12, display:'grid', placeItems:'center', background: unread ? 'rgba(255,215,0,.2)' : 'rgba(255,255,255,.06)', marginTop:2 }}>
                  <Icon name={iconForType(item.type)} size={22} color={unread ? '#FFD700' : '#222'} />
                </div>
                <div style={{ flex:1, justifyContent:'flex-start' }}>
                  <div style={{ fontSize:14, fontWeight: unread?800:700, marginBottom:2 }}>{item.title}</div>
                  {item.message && <div style={{ fontSize:13, fontWeight:600, lineHeight:1.38, marginBottom:2, opacity:.87 }}>{item.message}</div>}
                  <div style={{ fontSize:12, fontWeight:500, lineHeight:1.33, opacity:.67 }}>{item.description||item.desc}</div>
                </div>
                {unread && <div style={{ width:10, height:10, borderRadius:5, background:'#FFD700', marginLeft:6 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
