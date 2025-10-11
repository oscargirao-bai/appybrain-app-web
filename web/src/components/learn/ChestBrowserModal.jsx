import React, { useState, useEffect, useRef } from 'react';
import DataManager from '../../services/DataManager.js';
import ApiManager from '../../services/ApiManager.js';

const CHESTS = {
  bronze: '/assets/chests/chest-bronze.png',
  silver: '/assets/chests/chest-silver.png',
  gold: '/assets/chests/chest-gold.png',
  epic: '/assets/chests/chest-epic.png',
};
const CHESTS_OPENED = {
  bronze: '/assets/chests/chest-bronze-opened.png',
  silver: '/assets/chests/chest-silver-opened.png',
  gold: '/assets/chests/chest-gold-opened.png',
  epic: '/assets/chests/chest-epic-opened.png',
};

export default function ChestBrowserModal({ visible, onClose, onChestOpened, dataSource = 'stars' }) {
  const scrollRef = useRef(null);
  const [chests, setChests] = useState([]);
  const [loadingChestId, setLoadingChestId] = useState(null);
  const [progressData, setProgressData] = useState({ current: 0, nextThreshold: 100 });

  useEffect(() => {
    if (visible) {
      const chestData = DataManager.getUserChests();
      let sourceData = {};
      if (dataSource === 'points') {
        sourceData = chestData?.points || {};
      } else {
        sourceData = chestData?.stars || {};
      }
      const existingChests = sourceData?.chests || [];
      const allChests = [...existingChests];
      const nextThreshold = sourceData?.nextThreshold;
      const nextChestType = sourceData?.nextChestType || 'bronze';
      if (nextThreshold && !existingChests.find(c => c.milestone === nextThreshold)) {
        allChests.push({
          id: `upcoming-${nextThreshold}`,
          source: sourceData.source || 'stars',
          chestType: nextChestType,
          milestone: nextThreshold,
          grantedAt: null,
          openedAt: null,
          isUpcoming: true
        });
      }
      const sortedChests = allChests.sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
      setChests(sortedChests);
      const progressInfo = { current: sourceData?.current || 0, nextThreshold: sourceData?.nextThreshold || 100 };
      setProgressData(progressInfo);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 0);
    }
  }, [visible, dataSource]);

  const handleOpen = async (chest) => {
    if (!chest || chest.openedAt) return;
    setLoadingChestId(chest.id);
    try {
      const response = await ApiManager.openChest(chest.id);
      if (response?.success) {
        const rewards = [];
        if (response.coins > 0) rewards.push({ id: 'coins', type: 'coins', amount: response.coins });
        if (response.cosmeticId) rewards.push({ id: 'cosmetic', type: 'cosmetic', cosmeticId: response.cosmeticId, amount: 1 });
        await Promise.all([DataManager.refreshSection('userInfo'), DataManager.refreshSection('chests'), DataManager.refreshSection('shop')]);
        setLoadingChestId(null);
        onChestOpened && onChestOpened(rewards, chest.chestType);
        onClose && onClose();
      } else {
        setLoadingChestId(null);
        console.warn('Open chest API did not succeed', response);
      }
    } catch (e) {
      console.error('Error opening chest from browser modal', e);
      setLoadingChestId(null);
    }
  };

  const sortedChests = [...chests].sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
  const maxMilestone = sortedChests.length > 0 ? Math.max(...sortedChests.map(c => c.milestone || 0)) : 100;
  let pixelsPerUnit;
  if (dataSource === 'points') {
    pixelsPerUnit = 0.5;
  } else {
    pixelsPerUnit = 25;
  }
  const barHeight = maxMilestone * pixelsPerUnit;
  let currentChestIndex = -1;
  let nextChestIndex = 0;
  for (let i = 0; i < sortedChests.length; i++) {
    if (progressData.current >= (sortedChests[i].milestone || 0)) {
      currentChestIndex = i;
      nextChestIndex = i + 1;
    } else {
      nextChestIndex = i;
      break;
    }
  }
  let progressPercent = 0;
  if (sortedChests.length > 0) {
    progressPercent = progressData.current / maxMilestone;
  }
  const fillHeight = barHeight * progressPercent;

  if (!visible) return null;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.67)', display:'grid', placeItems:'center', zIndex:9999, padding:'16px' }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:20, width:400, maxWidth:'100%', maxHeight:'85vh', display:'flex', flexDirection:'column', border:'1px solid rgba(0,0,0,.13)' }}>
        <div style={{ fontSize:18, fontWeight:700, textAlign:'center', marginBottom:16 }}>Progressão de Baús</div>
        <div ref={scrollRef} style={{ flex:1, overflowY:'auto', paddingVertical:8, paddingBottom:56 }}>
          <div style={{ position:'relative', width:'100%', paddingLeft:68, paddingRight:68, display:'flex', flexDirection:'row' }}>
            <div style={{ width:'48%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:120, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:-8, position:'relative' }}>
                <div style={{ width:8, height:barHeight, borderRadius:4, background:'rgba(0,0,0,.1)', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:fillHeight, background:'rgba(0,0,200,.67)', borderRadius:4 }} />
                </div>
                <div style={{ position:'absolute', left:0, right:0, top:0, height:barHeight+24 }}>
                  {sortedChests.map((chest,index)=>{
                    const milestone = chest.milestone || 0;
                    const topPosition = milestone * pixelsPerUnit;
                    const canOpen = chest.grantedAt && !chest.openedAt && !chest.isUpcoming;
                    const isOpened = chest.openedAt;
                    const chestImage = isOpened ? (CHESTS_OPENED[chest.chestType]||CHESTS_OPENED.bronze) : (CHESTS[chest.chestType]||CHESTS.bronze);
                    return (
                      <div key={chest.id} style={{ position:'absolute', left:0, right:0, top:topPosition, transform:'translateY(-12px)', display:'flex', flexDirection:'row', alignItems:'center' }}>
                        <div style={{ position:'absolute', left:'50%', marginLeft:-7, display:'flex', alignItems:'center' }}>
                          <div style={{ width:14, height:4, borderRadius:3, background:'#fff' }} />
                        </div>
                        <div style={{ position:'absolute', left:'100%', marginLeft:-32, display:'flex', flexDirection:'row', alignItems:'center' }}>
                          {canOpen && <div className="chest-glow" style={{ position:'absolute', width:60, height:60, borderRadius:30, left:-4, top:-4, background:'rgba(0,0,200,.25)', zIndex:0, boxShadow:'0 0 15px rgba(0,0,200,.5)' }} />}
                          <button onClick={()=>canOpen?handleOpen(chest):null} disabled={!canOpen||loadingChestId===chest.id} style={{ position:'relative', zIndex:1, background:'transparent', border:'none', padding:0, cursor: canOpen?'pointer':'default', opacity: chest.isUpcoming?.6:1 }}>
                            <img src={chestImage} alt={chest.chestType} style={{ width:52, height:52, objectFit:'contain' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ width:'52%' }} />
          </div>
          <div style={{ height:20 }} />
        </div>
        <button onClick={onClose} style={{ marginTop:16, paddingVertical:12, border:'1px solid rgba(0,0,0,.13)', borderRadius:12, textAlign:'center', cursor:'pointer', fontSize:15, fontWeight:700, background:'#fff' }}>Fechar</button>
      </div>
    </div>
  );
}
