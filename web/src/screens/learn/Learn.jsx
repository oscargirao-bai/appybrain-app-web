import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/common/Icon.jsx';
import { t } from '../../services/Translate.js';
import { getAppData } from '../../services/DataStore.js';
import ApiManager from '../../services/ApiManager.js';
import './Learn.css';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import RankingsModal from '../../components/learn/RankingsModal.jsx';
import ChestBrowserModal from '../../components/learn/ChestBrowserModal.jsx';
import Chest from '../../components/General/Chest.jsx';
import { updateAppData } from '../../services/DataStore.js';
import Banner from '../../components/profile/Banner.jsx';
import Info from '../../components/learn/Info.jsx';

// Small inline SVG star that can be partially filled (0..1)
function Star({ fraction = 0, size = 28 }) {
  const frac = Math.max(0, Math.min(1, Number(fraction) || 0));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id="starFill">
          <rect x="0" y={24 - 24 * frac} width="24" height={24 * frac} />
        </clipPath>
      </defs>
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896 4.664 23.165l1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896 4.664 23.165l1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#FFC107" stroke="#222" strokeWidth="1.2" clipPath="url(#starFill)" />
    </svg>
  );
}

function StarsRow({ earned = 0, max = 3 }) {
  const ratio = max > 0 ? earned / max : 0;
  const v = ratio * 3; // convert to 0..3 stars visually
  const f1 = Math.min(1, Math.max(0, v - 0));
  const f2 = Math.min(1, Math.max(0, v - 1));
  const f3 = Math.min(1, Math.max(0, v - 2));
  return (
    <div className="stars">
      <div style={{ marginTop: 14 }}><Star fraction={f1} /></div>
      <div style={{ margin: '0 10px' }}><Star fraction={f2} /></div>
      <div style={{ marginTop: 14 }}><Star fraction={f3} /></div>
    </div>
  );
}

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

function ChestStarsRow({ starsEarned = 0, starsMax = 3, onMedals, onOpenChest, chestData }) {
  return (
    <div className="chest-line">
      <button className="chest-circle" aria-label="Baú" onClick={onOpenChest} style={{ cursor:'pointer', background:'transparent' }}>
        <Chest size={78} data={chestData} />
      </button>
      <StarsRow earned={starsEarned} max={starsMax} />
      <button className="medal-btn" onClick={onMedals} aria-label="Medalhas"><Icon name="medal" size={22} /></button>
    </div>
  );
}

function SubjectsRow({ subjects = [], onOpenFirst }) {
  const first = subjects[0] || null;
  if (!first) return null;
  return (
    <div className="subjects">
      <div className="subject-pill">
        <div className="icon"><Icon name="book-open" size={28} /></div>
        <div className="label">{first.title || first.name || '—'}</div>
      </div>
      <div className="cta-wrap">
        <button className="primary-cta" onClick={onOpenFirst}>{t('titles.learn')}</button>
      </div>
    </div>
  );
}

export default function Learn() {
  const [state, setState] = useState({ loading: true, subjects: [], user: null, totals: { earned: 0, max: 3 }, notifications: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const [rankOpen, setRankOpen] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const boot = getAppData();
      const data = boot || {};
      let subjects = [];
      const raw = data.disciplines;
      if (Array.isArray(raw)) subjects = raw;
      else if (raw?.areas) subjects = raw.areas;
      else if (raw?.data) subjects = raw.data;
      const notifications = Array.isArray(data?.notifications?.notifications)
        ? data.notifications.notifications.filter(n => !n.readAt).length
        : 0;
      const user = data?.userInfo?.user || null;
      // Totals for stars (fallback from user)
      const totals = data?.userStars?.totals || { earnedStars: user?.stars || 0, maxStars: 3 };
      setState({ loading: false, subjects, user, totals: { earned: totals.earnedStars || 0, max: totals.maxStars || 3 }, notifications });
    };
    load();
  }, []);

  if (state.loading) return <div className="learn-wrap"><div className="loading-label page-50">{t('common.loading')}</div></div>;

  const { user, subjects, notifications } = state;
  const openFirst = async () => {
    if (!subjects.length) return;
    try {
      await ApiManager.authJson('app/learn_content_list'); // no-op call to keep sequence discipline
      // On web MVP we just log; navigation to categories will be added later
      console.log('Open discipline', subjects[0]);
    } catch (e) {}
  };

  const handleChestOpened = async (rewards, chestType) => {
    // After opening, refresh userInfo, chests and shop in series like mobile
    try {
      const userInfo = await ApiManager.authJson('app/gamification_user_badges');
      const userChests = await ApiManager.authJson('app/gamification_user_chests');
      const cosmetics = await ApiManager.authJson('app/cosmetics_list');
      updateAppData({ userInfo, userChests, cosmetics });
    } catch (e) { console.warn('Refresh after open chest failed', e); }
  };

  return (
    <div className="learn-wrap">
      <div className="page-50">
        <HeaderBar title={t('titles.learn')} notifications={notifications} onOpenNotifications={() => setNotifOpen(true)} onOpenSettings={() => console.log('settings')} />
      </div>
      <div className="content page-50">
        <Banner avatarUrl={user?.avatarUrl} backgroundUrl={user?.backgroundUrl} />
        <Info username={user?.nickname || '—'} tribe={user?.tribes?.[0]?.name || t('common.noTribe')} stars={user?.stars || 0} coins={user?.coins || 0} />
        <ChestStarsRow chestData={getAppData()?.userChests} starsEarned={state.totals.earned} starsMax={state.totals.max} onMedals={() => setRankOpen(true)} onOpenChest={() => setChestOpen(true)} />
        <SubjectsRow subjects={subjects} onOpenFirst={openFirst} />
      </div>
      <BottomTabs onNavigate={() => {}} />
      <NotificationsModal visible={notifOpen} onClose={() => setNotifOpen(false)} items={(getAppData()?.notifications?.notifications)||[]} />
      <RankingsModal visible={rankOpen} onClose={() => setRankOpen(false)} />
      <ChestBrowserModal visible={chestOpen} onClose={() => setChestOpen(false)} onChestOpened={handleChestOpened} />
    </div>
  );
}

// Basic bottom tabs to match RN icons layout; no navigation yet
function BottomTabs({ current = 'Learn', onNavigate }) {
  const items = [
    { key: 'Learn', icon: 'book' },
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
