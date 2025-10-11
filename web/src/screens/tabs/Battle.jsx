import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import DataManager from '../../services/DataManager.js';
import Banner from '../../components/profile/Banner.jsx';
import Info from '../../components/learn/Info.jsx';
import Button2 from '../../components/common/Button2.jsx';
import Button1 from '../../components/common/Button1.jsx';
import Chest from '../../components/General/Chest.jsx';
import Icon from '../../components/common/Icon.jsx';
import NotificationsModal from '../../components/learn/NotificationsModal.jsx';
import RankingsModal from '../../components/learn/RankingsModal.jsx';
import ChestRewardModal from '../../components/General/ChestRewardModal.jsx';
import ChestBrowserModal from '../../components/learn/ChestBrowserModal.jsx';
import RankDisplay from '../../components/battle/RankDisplay.jsx';
import HistoryModal from '../../components/battle/HistoryModal.jsx';
import NotificationBadge from '../../components/common/NotificationBadge.jsx';

// Helper function to transform battle data for ResultScreen2
function transformBattleDataForResult(battleData) {
  if (!battleData) return null;
  
  const sessionResult = {
    battleSessionId: battleData.battleSessionId,
    myScore: battleData.myScore || battleData.score,
    opponentScore: battleData.opponentScore || battleData.rivalScore,
    opponent: battleData.opponent || battleData.rival,
    outcome: battleData.outcome || battleData.status,
    pointsDelta: battleData.pointsDelta || battleData.trophiesDelta,
    coins: battleData.coins,
    totalQuestions: battleData.totalQuestions || battleData.total,
    myTotalSec: battleData.myTotalSec || battleData.totalSec,
    opponentTotalSec: battleData.opponentTotalSec || battleData.rivalTotalSec,
    myHelps: battleData.myHelps || battleData.helpsUsed,
    opponentHelps: battleData.opponentHelps || battleData.rivalHelps,
    myAnswers: battleData.myAnswers || battleData.answers,
    opponentAnswers: battleData.opponentAnswers || battleData.rivalAnswers,
    ...battleData
  };

  return {
    correct: battleData.myScore || battleData.score || 0,
    total: battleData.totalQuestions || battleData.total || 0,
    totalSec: battleData.myTotalSec || battleData.totalSec || 0,
    quizType: 'battle',
    title: 'Batalha 1v1',
    battleSessionId: battleData.battleSessionId,
    sessionResult: sessionResult
  };
}

export default function Battle({ onNavigate, openBattleResult, timestamp, reopenHistory, highlightBattleId }) {
  const colors = useThemeColors();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chestRewardOpen, setChestRewardOpen] = useState(false);
  const [chestRewards, setChestRewards] = useState([]);
  const [chestType, setChestType] = useState('bronze');
  const [chestBrowserOpen, setChestBrowserOpen] = useState(false);
  const [reopenBrowserAfterReward, setReopenBrowserAfterReward] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [battleHistory, setBattleHistory] = useState({ pending: [], completed: [] });
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const updateData = () => {
      const userData = DataManager.getUser();
      setUserInfo(userData);

      const battleHistoryData = DataManager.getBattleHistory?.() || { pending: [], completed: [] };
      setBattleHistory(battleHistoryData);

      const unreadCount = DataManager.getUnreadNotificationsCount?.() || 0;
      setUnreadNotificationsCount(unreadCount);
    };

    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  // Handle opening battle result from navigation params
  useEffect(() => {
    if (openBattleResult && timestamp && timestamp !== lastProcessedTimestamp && (battleHistory.pending.length > 0 || battleHistory.completed.length > 0)) {
      const allBattles = [...battleHistory.pending, ...battleHistory.completed];
      const targetBattle = allBattles.find(battle => battle.battleSessionId === openBattleResult);
      
      if (targetBattle) {
        setTimeout(() => {
          try {
            const battleData = DataManager.getBattleById?.(targetBattle.battleSessionId);
            const resultParams = transformBattleDataForResult(battleData);
            
            if (resultParams) {
              onNavigate('Result2', resultParams);
            }
          } catch (e) {
            console.error('Failed to navigate to battle result:', e);
          }
        }, 300);
        
        setLastProcessedTimestamp(timestamp);
      } else {
        setLastProcessedTimestamp(timestamp);
      }
    }
  }, [openBattleResult, battleHistory, timestamp, lastProcessedTimestamp, onNavigate]);

  // Handle reopening history modal
  useEffect(() => {
    if (reopenHistory) {
      setTimeout(() => {
        setHistoryOpen(true);
      }, 120);
    }
  }, [reopenHistory]);

  const handleChestOpen = () => {
    setChestBrowserOpen(true);
    setReopenBrowserAfterReward(false);
  };

  const handleChestOpenedFromBrowser = (rewards, chestType) => {
    setChestRewards(rewards || []);
    setChestType(chestType || 'bronze');
    setChestRewardOpen(true);
    setReopenBrowserAfterReward(true);
  };

  const handleOpenBattle = (battleSessionId) => {
    try {
      const battleData = DataManager.getBattleById?.(battleSessionId);
      const resultParams = transformBattleDataForResult(battleData);
      
      if (resultParams) {
        onNavigate('Result2', { ...resultParams, openedFromHistory: true, openedFromHistoryBattleId: battleSessionId });
      }
    } catch (e) {
      console.error('Error opening battle session:', e);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, color: colors.text }}>
      <div className="page-50" style={{ paddingBottom: '80px' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div style={{ fontSize: 20, fontWeight: 700, flex: 1, textAlign: 'center', marginLeft: '-48px' }}>{t('titles.battle')}</div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            <button onClick={() => setNotificationsOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6, position: 'relative' }}>
              <Icon name="bell" size={22} />
              <NotificationBadge count={unreadNotificationsCount} />
            </button>
            <button onClick={() => onNavigate('Settings')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 6 }}>
              <Icon name="settings" size={22} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div>
          <Banner 
            avatarUrl={userInfo?.avatarUrl}
            backgroundUrl={userInfo?.backgroundUrl}
            frameUrl={userInfo?.frameUrl}
            topFlat
          />
          <Info
            username={userInfo?.nickname}
            tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
            trophies={userInfo?.points ?? 0}
            coins={userInfo?.coins ?? 0}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
            <button onClick={handleChestOpen} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Chest dataSource="points" size={78} />
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button2 size={54} icon="clock" onPress={() => setHistoryOpen(true)} />
              <Button2 size={54} icon="medal" onPress={() => setRankingsOpen(true)} />
            </div>
          </div>
        </div>

        {/* Rank Display */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
          <RankDisplay trophies={userInfo?.trophies ?? 0} size={170} />
        </div>

        {/* Battle Button */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 0, marginBottom: -20, marginTop: -2 }}>
          <Button1 onPress={() => onNavigate('Quizz', { battleMode: true })}>{t('titles.battle')}</Button1>
        </div>
      </div>

      {/* Modals */}
      <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
      <HistoryModal
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        pending={battleHistory.pending}
        completed={battleHistory.completed}
        onOpenBattle={handleOpenBattle}
      />
      <ChestRewardModal 
        visible={chestRewardOpen} 
        onClose={() => {
          setChestRewardOpen(false);
          if (reopenBrowserAfterReward) {
            setTimeout(() => setChestBrowserOpen(true), 120);
          }
        }} 
        rewards={chestRewards}
        chestType={chestType}
      />
      <ChestBrowserModal 
        visible={chestBrowserOpen} 
        onClose={() => setChestBrowserOpen(false)} 
        onChestOpened={handleChestOpenedFromBrowser} 
        dataSource="points" 
      />
    </div>
  );
}
