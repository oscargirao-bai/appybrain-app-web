import React, { useState, useEffect } from 'react';
import DataManager from '../services/DataManager.js';
import { useThemeColors } from '../services/Theme.jsx';
import Icon from '../components/common/Icon.jsx';
import Banner from '../components/profile/Banner.jsx';
import Info from '../components/profile/Info.jsx';
import MedalsList from '../components/profile/MedalsList.jsx';
import MedalModal from '../components/profile/MedalModal.jsx';

export default function Profile({ onNavigate }) {
  const colors = useThemeColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const updateData = () => {
      const userData = DataManager.getUser();
      const badgesData = DataManager.getUserBadges?.() || [];
      
      setUserInfo(userData);
      
      if (badgesData && badgesData.length > 0) {
        const transformedBadges = badgesData.map(badge => ({
          id: badge.id,
          icon: badge.icon,
          unlocked: badge.currentLevel > 0,
          new: false,
          title: badge.name,
          description: badge.description,
          level: badge.currentLevel,
          current: badge.currentCounter,
          target: badge.requiredOccurrences,
          hideLevel: badge.maxLevels === 1,
          code: badge.code,
          color: badge.color,
          iconColor: badge.iconColor,
          currentWins: badge.currentWins,
          maxLevels: badge.maxLevels,
          nextLevel: badge.nextLevel,
          nextLevelCoins: badge.nextLevelCoins
        }));
        setBadges(transformedBadges);
      } else {
        setBadges([]);
      }
    };

    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  const handleMedalPress = (medal) => {
    setSelectedMedal({
      id: medal.id,
      icon: medal.icon,
      title: medal.title,
      description: medal.description,
      level: medal.level,
      current: medal.current,
      target: medal.target,
      unlocked: medal.unlocked,
      hideLevel: medal.hideLevel,
      color: medal.color,
      iconColor: medal.iconColor
    });
    setModalVisible(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background, color: colors.text }}>
      <div className="page-50" style={{ paddingBottom: '80px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('Learn')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, width: 40 }}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, flex: 1, textAlign: 'center' }}>Perfil</h1>
        <button onClick={() => onNavigate('Settings')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, width: 40 }}>
          <Icon name="settings" size={24} />
        </button>
      </header>
      <div>
        <Banner 
          avatarUrl={userInfo?.avatarUrl} 
          backgroundUrl={userInfo?.backgroundUrl} 
          frameUrl={userInfo?.frameUrl}
          onClick={() => onNavigate('Customize')}
          topFlat
        />
        <div style={{ padding: '18px 16px 40px' }}>
          <Info 
            username={userInfo?.nickname}
            tribe={userInfo?.tribes?.[0]?.name || 'Sem Tribo'}
            stars={userInfo?.stars}
          />
          <MedalsList 
            medals={badges}
            onMedalPress={handleMedalPress} 
          />
        </div>
      </div>
      <MedalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        medal={selectedMedal}
      />
      </div>
    </div>
  );
}

