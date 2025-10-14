import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import DataManager from '../../services/DataManager.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import Banner from '../../components/Profile/Banner.jsx';
import Info from '../../components/Learn/Info.jsx';
import Button2 from '../../components/General/Button2.jsx';
import Button1 from '../../components/General/Button1.jsx';
import Subject2 from '../../components/Learn/Subject2.jsx';
import Chest from '../../components/General/Chest.jsx';
import NotificationsModal from '../../components/Learn/NotificationsModal.jsx';
import RankingsModal from '../../components/Learn/RankingsModal.jsx';
import ChestRewardModal from '../../components/General/ChestRewardModal.jsx';
import ChestBrowserModal from '../../components/General/ChestBrowserModal.jsx';
import RankDisplay from '../../components/Battle/RankDisplay.jsx';
import HistoryModal from '../../components/Battle/HistoryModal.jsx';
import Header from '../../components/General/Header.jsx';
import NotificationBadge from '../../components/General/NotificationBadge.jsx';

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
    // Add any other relevant fields from the battle data
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

export default function BattleScreen({ navigation, route }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [chestRewardOpen, setChestRewardOpen] = useState(false);
  const [chestRewards, setChestRewards] = useState([]);
  const [chestType, setChestType] = useState('bronze'); // Store the type of chest being opened
  const [chestBrowserOpen, setChestBrowserOpen] = useState(false);
  const [reopenBrowserAfterReward, setReopenBrowserAfterReward] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [battleHistory, setBattleHistory] = useState({ pending: [], completed: [] });
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Get route params for battle result opening
  const routeParams = route?.params || {};
  const { openBattleResult, timestamp, reopenHistory, highlightBattleId } = routeParams;
  
  //console.log('BattleScreen: Received params', { routeParams, propsParams, openBattleResult, timestamp });

  useEffect(() => {
    const updateData = () => {
      const userData = DataManager.getUser();
      setUserInfo(userData);

      const disciplinesData = DataManager.getDisciplines();
      setDisciplines(disciplinesData);

      const battleHistoryData = DataManager.getBattleHistory();
      setBattleHistory(battleHistoryData);

      const unreadCount = DataManager.getUnreadNotificationsCount();
      setUnreadNotificationsCount(unreadCount);
    };

    // Initial load
    updateData();

    // Subscribe to DataManager changes
    const unsubscribe = DataManager.subscribe(updateData);

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Handle opening battle result from navigation params (e.g., from notifications)
  useEffect(() => {
    /*
    console.log('BattleScreen: Battle result effect triggered', { 
      openBattleResult, 
      timestamp, 
      lastProcessedTimestamp, 
      pendingCount: battleHistory.pending.length,
      completedCount: battleHistory.completed.length
    });
    */
    // Only process if we have a new timestamp (avoid processing the same navigation twice)
    if (openBattleResult && timestamp && timestamp !== lastProcessedTimestamp && (battleHistory.pending.length > 0 || battleHistory.completed.length > 0)) {
      // Find the battle in either pending or completed arrays
      const allBattles = [...battleHistory.pending, ...battleHistory.completed];
      const targetBattle = allBattles.find(battle => battle.battleSessionId === openBattleResult);
      
      //console.log('BattleScreen: Looking for battle with ID:', openBattleResult, 'in', allBattles.length, 'battles');
      
      if (targetBattle) {
        //console.log('Navigating directly to battle result:', targetBattle.battleSessionId, 'timestamp:', timestamp);
        
        // Navigate directly to the battle result without opening HistoryModal
        setTimeout(() => {
          try {
            const battleData = DataManager.getBattleById(targetBattle.battleSessionId);
            const resultParams = transformBattleDataForResult(battleData);
            
            if (resultParams) {
              navigation.navigate('Result2', resultParams);
            } else {
              console.warn('Battle not found with id:', targetBattle.battleSessionId);
            }
          } catch (e) {
            console.error('Failed to navigate to battle result:', e);
          }
        }, 300); // Short delay to allow screen transition to complete
        
        setLastProcessedTimestamp(timestamp);
      } else {
        console.warn('Battle not found with id:', openBattleResult, 'Available battles:', allBattles.map(b => b.battleSessionId));
        setLastProcessedTimestamp(timestamp);
      }

      // Clear the navigation parameters to prevent reopening on subsequent visits
      navigation.setParams({ openBattleResult: undefined, timestamp: undefined });
    }
  }, [openBattleResult, battleHistory, timestamp, lastProcessedTimestamp, navigation]);

  // If MainTabs navigates here with a flag to reopen the history modal, open it
  useEffect(() => {
    if (reopenHistory) {
      // small delay to allow navigation to settle
      setTimeout(() => {
        setHistoryOpen(true);
      }, 120);
      // Optionally clear params to avoid repeated triggers (route params or props vary by navigation path)
      try {
        navigation.setParams && navigation.setParams({ reopenHistory: undefined, highlightBattleId: undefined });
      } catch (e) {}
    }
  }, [reopenHistory, highlightBattleId]);

  // Handle chest opening for battle points
  const handleChestOpen = async () => {
    // Open chest browser modal first
    setChestBrowserOpen(true);
    setReopenBrowserAfterReward(false);
  };

  const handleChestOpenedFromBrowser = (rewards, chestType) => {
    // Show rewards modal when browser modal signals a chest was opened
    setChestRewards(rewards || []);
    setChestType(chestType || 'bronze');
    setChestRewardOpen(true);
    setReopenBrowserAfterReward(true);
  };

  // Proportions (relative to full screen height)
  const HEADER_PCT = 0.10; // header handled by Header component
  const INFO_PCT = 0.10;
  const CHEST_LINE_PCT = 0.15;
  const TROPHY_PCT = 0.06;
  const RANK_PCT = 0.10;
  const BUTTON_PCT = 0.10;
  const CHEST_SIZE_PCT = 0.10; // chest component size
  const bannerPct = Math.max(0, 1 - (HEADER_PCT + INFO_PCT + CHEST_LINE_PCT + TROPHY_PCT + RANK_PCT + BUTTON_PCT));

  const bannerH = Math.round(windowHeight * bannerPct);
  const infoH = Math.round(windowHeight * INFO_PCT);
  const chestH = Math.round(windowHeight * CHEST_LINE_PCT);
  const trophyH = Math.round(windowHeight * TROPHY_PCT);
  const rankH = Math.round(windowHeight * RANK_PCT);
  const buttonH = Math.round(windowHeight * BUTTON_PCT);
  const chestSize = Math.round(windowHeight * CHEST_SIZE_PCT);
  
  // Responsive shield size - limit to avoid cutoff on smaller screens
  const maxShieldSize = Math.min(windowWidth * 0.4, windowHeight * 0.15, 170);
  const shieldSize = Math.max(120, maxShieldSize); // minimum 120, max based on screen size

  return (
    <div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>
      <Header
        title={translate('titles.battle')}
        style={{ paddingRight: 10 }}
        right={(
          <div style={{ position: 'relative' }}>
            <Button2 iconName="bell" size={40} onClick={() => setNotificationsOpen(true)} style={{ padding: 0 }} />
            <NotificationBadge count={unreadNotificationsCount} />
          </div>
        )}
        extraRight={(<Button2 iconName="settings" size={40} onClick={() => navigation.navigate('Settings')} style={{ padding: 0 }} />)}
      />
  <div style={styles.content}>
        <div style={styles.headerSection}>
          <div style={styles.bannerSection}>
            <Banner 
              topFlat={true} 
              avatarSource={userInfo?.avatarUrl ? { uri: userInfo.avatarUrl } : null}
              bannerImageSource={userInfo?.backgroundUrl ? { uri: userInfo.backgroundUrl } : null}
              frameSource={userInfo?.frameUrl ? { uri: userInfo.frameUrl } : null}
            />
          </div>
          <div style={styles.infoSection}>
            <Info
              username={userInfo?.nickname}
              tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
              trophies={userInfo?.points ?? 0}
              coins={userInfo?.coins ?? 0}
            />
          </div>
          <div style={styles.chestLine}>
            <button style={styles.chestPressable}
              onClick={handleChestOpen}
              
              aria-label="Baú de recompensas de batalha"
            >
              <Chest dataSource="points" size={chestSize} />
            </button>
            <div style={styles.buttonsRow}>
              <Button2
                size={54}
                iconName="history"
                onClick={() => setHistoryOpen(true)}
            style={styles.buttonSpacing}
            aria-label={translate('battle.history.title')}
            />
            <Button2
            size={54}
            iconName="medal"
            onClick={() => setRankingsOpen(true)}
            style={styles.buttonSpacing}
            />
            </div>
          </div>
        </div>
  <div style={styles.bottomSection}>
          <div style={styles.trophySection} />
          <div style={styles.rankSection}>
            <div style={styles.rankRow}>
              <RankDisplay trophies={userInfo?.trophies ?? 0} size={shieldSize} />
            </div>
          </div>
          <div style={styles.buttonSection}>
            <div style={styles.battleButtonWrap}>
              <Button1
                label={translate('titles.battle')}
            color="#339DFF"
                onClick={() => {
                  // Navigate to battle quiz
                  //console.log('Battle button pressed - starting battle quiz');
                  navigation.navigate('Quizz', { battleMode: true });
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <NotificationsModal visible={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <RankingsModal visible={rankingsOpen} onClose={() => setRankingsOpen(false)} />
      <HistoryModal
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        pending={battleHistory.pending}
        completed={battleHistory.completed}
        onOpenBattle={(battleSessionId) => {
          // Navigate to ResultScreen2 with battle data
          try {
            const battleData = DataManager.getBattleById(battleSessionId);
            const resultParams = transformBattleDataForResult(battleData);
            
            if (resultParams) {
              // Mark that this navigation originated from the HistoryModal so ResultScreen2 can return and reopen it
              navigation.navigate('Result2', { ...resultParams, openedFromHistory: true, openedFromHistoryBattleId: battleSessionId });
            } else {
              console.warn('Battle not found with id:', battleSessionId);
            }
          } catch (e) {
            console.error('Error opening battle session:', e);
            //console.log('Fallback: Open battle session:', battleSessionId);
          }
        }}
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
      <ChestBrowserModal visible={chestBrowserOpen} onClose={() => setChestBrowserOpen(false)} onChestOpened={handleChestOpenedFromBrowser} dataSource="points" />
    </div>
  );
}

const styles = {
  safe: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 0,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerSection: {
    width: '100%',
    marginBottom: 0,
  },
  bottomSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  buttonsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  chestPressable: {
    alignSelf: 'flex-start',
    marginTop: 6,
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
  },
  fullBleed: {
    marginLeft: -10, marginRight: -10,
    width: 'auto',
  },
  battleButtonWrap: {
    paddingBottom: 16,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  subjectsRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectItem: {},
  bannerSection: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0, paddingBottom: 0,
  },
  infoSection: {
    width: '100%',
    justifyContent: 'center',
    marginTop: 0,
  },
  chestLine: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    boxSizing: 'border-box',
  },
  trophySection: {
    display: 'none',
  },
  rankSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankRow: {
    width: '100%',
    maxWidth: 320,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingLeft: 12,
    paddingRight: 12,
    marginTop: -12,
  },
  buttonSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 24,
    flex: 0,
  },
  buttonSpacing: {
    marginLeft: 12,
  },
};
