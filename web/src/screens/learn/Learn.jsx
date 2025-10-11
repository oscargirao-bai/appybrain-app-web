import React, { useEffect, useState } from 'react';
import Icon from '../../components/common/Icon.jsx';
import { t } from '../../services/Translate.js';
import ApiManager from '../../services/ApiManager.js';
import './Learn.css';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import RankingsModal from '../../components/learn/RankingsModal.jsx';
import ChestBrowserModal from '../../components/learn/ChestBrowserModal.jsx';
import ChestRewardModal from '../../components/General/ChestRewardModal.jsx';
import Chest from '../../components/General/Chest.jsx';
import Banner from '../../components/profile/Banner.jsx';
import Info from '../../components/learn/Info.jsx';
import Stars from '../../components/learn/Stars.jsx';
import Area from '../../components/learn/Area.jsx';

// Small inline SVG star that can be partially filled (0..1)
function HeaderBar({ title, notifications = 0, onOpenNotifications, onOpenSettings }) {
  return (
    <header className="learn-header">
      <div className="title">{title}</div>
      <div className="actions">
        <button className="icon-btn" aria-label="Notificações" onClick={onOpenNotifications}>
          <Icon name="bell" size={22} />
          {notifications > 0 && <span className="badge">{notifications}</span>}
        </button>
        <button className="icon-btn" aria-label="Definições" onClick={onOpenSettings}>
          <Icon name="settings" size={22} />
        </button>
      </div>
    </header>
  );
}

function ChestStarsRow({ starsValue = 0, onMedals, onOpenChest, chestData }) {
  return (
    <div className="chest-line">
      <button className="chest-circle" aria-label="Baú" onClick={onOpenChest} style={{ cursor:'pointer', background:'transparent' }}>
        <Chest size={78} data={chestData} />
      </button>
      <div className="stars"><Stars value={starsValue} size={48} /></div>
      <button className="medal-btn" onClick={onMedals} aria-label="Medalhas"><Icon name="medal" size={22} /></button>
    </div>
  );
}

function SubjectsGrid({ disciplines = [], onOpen }) {
  if (!disciplines?.length) return null;
  return (
    <div style={{ width:'100%', display:'flex', flexWrap:'wrap', justifyContent:'space-around', padding:'0 20px' }}>
      {disciplines.map(d => (
        <div key={d.id} style={{ margin:8 }}>
          <Area title={d.title} svgIcon={d.icon} color={d.color} iconColor={d.iconColor} onPress={() => onOpen(d.id)} />
        </div>
      ))}
    </div>
  );
}

export default function Learn({ onNavigate }){
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [chestBrowserOpen, setChestBrowserOpen] = useState(false);
  const [chestRewardOpen, setChestRewardOpen] = useState(false);
  const [chestRewards, setChestRewards] = useState([]);
  const [chestType, setChestType] = useState('bronze');
  const [userInfo, setUserInfo] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // subscribe to data from ApiManager/DataStore sequence (same order as RN boot)
  useEffect(() => {
    const data = window.__APP_DATA__ || {}; // optional hydration
    const u = data?.userInfo?.user || null;
    setUserInfo(u);
    const disc = Array.isArray(data?.disciplines) ? data.disciplines : (data?.disciplines?.areas || data?.disciplines?.data || []);
    setDisciplines(disc);
    const n = Array.isArray(data?.notifications?.notifications)
      ? data.notifications.notifications.filter(n => !n.readAt).length
      : 0;
    setUnreadCount(n);
  }, []);

  const handleChestOpen = () => setChestBrowserOpen(true);
  const handleChestOpenedFromBrowser = (rewards, type) => {
    setChestRewards(rewards || []);
    setChestType(type || 'bronze');
    setChestRewardOpen(true);
  };

  const openDiscipline = async (disciplineId) => {
    // Serialize like RN: navigate to Category after ensuring API call is queued
    try {
      await ApiManager.authJson('app/learn_content_list');
      onNavigate && onNavigate('Category');
      console.log('Open discipline', disciplineId);
    } catch(e) {}
  };

  return (
    <div className="learn-wrap">
      <div className="page-50">
        <HeaderBar title={t('titles.learn')} notifications={unreadCount} onOpenNotifications={() => setNotificationsOpen(true)} onOpenSettings={() => onNavigate && onNavigate('Settings')} />
      </div>
      <div className="content page-50">
        <Banner avatarUrl={userInfo?.avatarUrl} backgroundUrl={userInfo?.backgroundUrl} />
        <Info username={userInfo?.nickname || '—'} tribe={userInfo?.tribes?.[0]?.name || t('common.noTribe')} stars={userInfo?.stars || 0} coins={userInfo?.coins || 0} />
        <ChestStarsRow chestData={window.__APP_DATA__?.userChests} starsValue={userInfo?.stars || 0} onMedals={() => setRankingsOpen(true)} onOpenChest={handleChestOpen} />
        <div style={{ height: 0 }} />
        <div style={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }} />
        <div style={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
          <SubjectsGrid disciplines={disciplines} onOpen={openDiscipline} />
        </div>
        <div style={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center', paddingBottom:8, paddingTop:2 }}>
          <div style={{ paddingBottom:0, marginBottom:-20, marginTop:-2, alignItems:'center', display:'flex' }}>
            <button className="primary-cta" onClick={() => { if (disciplines.length > 0) openDiscipline(disciplines[0].id); }}>{t('titles.learn')}</button>
          </div>
        </div>
      </div>
      <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} items={(window.__APP_DATA__?.notifications?.notifications)||[]} />
      <RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
      <ChestRewardModal visible={chestRewardOpen} onClose={() => { setChestRewardOpen(false); if (true) setTimeout(() => setChestBrowserOpen(true), 120); }} rewards={chestRewards} chestType={chestType} />
      <ChestBrowserModal visible={chestBrowserOpen} onClose={() => setChestBrowserOpen(false)} onChestOpened={handleChestOpenedFromBrowser} dataSource="stars" />
    </div>
  );
}

// Basic bottom tabs to match RN icons layout; no navigation yet
function BottomTabs({ current = 'Learn', onNavigate }) {
  const items = [
    { key: 'Learn', icon: 'book-open' },
    { key: 'Battle', icon: 'swords' },
    { key: 'Challenges', icon: 'crosshair' },
    { key: 'Tribes', icon: 'tent' },
    { key: 'News', icon: 'newspaper' },
    { key: 'Shop', icon: 'shopping-bag' },
  ];
  return (
    <nav className="tabs">
      <div className="tabs-inner page-50">
        {items.map(it => (
          <button key={it.key} className={current === it.key ? 'tab active' : 'tab'} onClick={() => onNavigate?.(it.key)}>
            <Icon name={it.icon} size={22} />
          </button>
        ))}
      </div>
    </nav>
  );
}
