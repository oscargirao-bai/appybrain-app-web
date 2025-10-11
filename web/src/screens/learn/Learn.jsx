import React, { useEffect, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../../components/common/Icon.jsx';
import { t } from '../../services/Translate.js';
import DataManager from '../../services/DataManager.js';
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
import Button1 from '../../components/common/Button1.jsx';
import Button2 from '../../components/common/Button2.jsx';

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

function ChestStarsRow({ onMedals, onOpenChest }) {
  return (
    <div className="chest-line">
      <button className="chest-circle" aria-label="Baú" onClick={onOpenChest} style={{ cursor:'pointer', background:'transparent', border:'none', padding:0 }}>
        <Chest size={78} dataSource="stars" />
      </button>
      <div className="stars"><Stars size={48} /></div>
      <Button2 icon="medal" onPress={onMedals} size={40} />
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

export default function Learn({ onNavigate, openNotifications }){
  const colors = useThemeColors();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [chestBrowserOpen, setChestBrowserOpen] = useState(false);
  const [chestRewardOpen, setChestRewardOpen] = useState(false);
  const [chestRewards, setChestRewards] = useState([]);
  const [chestType, setChestType] = useState('bronze');
  const [reopenBrowserAfterReward, setReopenBrowserAfterReward] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (openNotifications) {
      setTimeout(() => setNotificationsOpen(true), 300);
    }
  }, [openNotifications]);

  useEffect(() => {
    const updateData = () => {
      const userData = DataManager.getUser();
      setUserInfo(userData);
      const disciplinesData = DataManager.getDisciplines();
      setDisciplines(disciplinesData);
      const unreadNotificationsCount = DataManager.getUnreadNotificationsCount();
      setUnreadCount(unreadNotificationsCount);
    };
    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  const handleChestOpen = async () => {
    setChestBrowserOpen(true);
    setReopenBrowserAfterReward(false);
  };

  const handleChestOpenedFromBrowser = (rewards, type) => {
    setChestRewards(rewards || []);
    setChestType(type || 'bronze');
    setChestRewardOpen(true);
    setReopenBrowserAfterReward(true);
  };

  const openDiscipline = (disciplineId) => {
    console.log('Open discipline', disciplineId);
    onNavigate && onNavigate('Category', { disciplineId });
  };

  return (
    <div className="learn-screen" style={{ backgroundColor: colors.background, minHeight: '100vh' }}>
      <div className="page-50">
        <HeaderBar title={t('titles.learn')} notifications={unreadCount} onOpenNotifications={() => setNotificationsOpen(true)} onOpenSettings={() => onNavigate && onNavigate('Settings')} />
      </div>
      <div className="content page-50">
        <Banner avatarUrl={userInfo?.avatarUrl} backgroundUrl={userInfo?.backgroundUrl} frameUrl={userInfo?.frameUrl} onClick={() => onNavigate && onNavigate('Profile')} />
        <Info username={userInfo?.nickname || '—'} tribe={userInfo?.tribes?.[0]?.name || t('common.noTribe')} stars={userInfo?.stars || 0} coins={userInfo?.coins || 0} />
        <ChestStarsRow onMedals={() => setRankingsOpen(true)} onOpenChest={handleChestOpen} />
        <div style={{ height: 0 }} />
        <div style={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center', flex:0.7 }}>
          <SubjectsGrid disciplines={disciplines} onOpen={openDiscipline} />
        </div>
        <div style={{ width:'100%', display:'flex', justifyContent:'center', alignItems:'center', paddingBottom:8, paddingTop:2, flex:0.3 }}>
          <div style={{ paddingBottom:0, marginBottom:-20, marginTop:-2 }}>
            <Button1 onPress={() => { if (disciplines.length > 0) openDiscipline(disciplines[0].id); }}>{t('titles.learn')}</Button1>
          </div>
        </div>
      </div>
      <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
      <ChestRewardModal visible={chestRewardOpen} onClose={() => { setChestRewardOpen(false); if (reopenBrowserAfterReward) setTimeout(() => setChestBrowserOpen(true), 120); }} rewards={chestRewards} chestType={chestType} />
      <ChestBrowserModal visible={chestBrowserOpen} onClose={() => setChestBrowserOpen(false)} onChestOpened={handleChestOpenedFromBrowser} dataSource="stars" />
    </div>
  );
}

