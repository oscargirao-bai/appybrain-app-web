import React, { useEffect } from 'react';

import LinearGradient from '../../components/General/LinearGradient.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import Banner from '../../components/Profile/Banner.jsx';
import Info from '../../components/Learn/Info.jsx';
import DataManager from '../../services/DataManager.jsx';
import Stats from '../../components/ResultQuizz/Stats.jsx';
import Button1 from '../../components/General/Button1.jsx';
import Reward from '../../components/ResultQuizz/Reward.jsx';
import Quote from '../../components/ResultQuizz/Quote.jsx';

// Mock navigation hooks for web
const useNavigation = () => ({ navigate: () => {}, goBack: () => {}, replace: () => {} });
const useRoute = () => ({ params: {} });

export default function ResultScreen1() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    correct = null, 
    total = null, 
    totalSec = null, 
    quizType, 
    title: quizTitle,
    sessionResult = null // API response with stars, coins, etc.
  } = route.params || {};

  // Refresh user data when screen loads
  useEffect(() => {
    const refreshUserData = async () => {
      try {
        // Refresh both user info and stars to get latest values
        await Promise.all([
          DataManager.refreshSection('userInfo'),
          DataManager.refreshSection('userStars')
        ]);
        //console.log('ResultScreen1: User data and stars refreshed successfully');
      } catch (error) {
        console.error('ResultScreen1: Failed to refresh user data:', error);
      }
    };

    refreshUserData();
  }, []);
  
  const hasStats = typeof correct === 'number' && typeof total === 'number' && total > 0;
  const success = hasStats ? (correct / total) >= 0.5 : null;
  const ctaColor = success === null ? undefined : (success ? '#1BA45B' : '#EF4444');

  const title = 'Resultado';
  const summary =
    correct != null && total != null
      ? `${correct}/${total} corretas`
      : 'Terminaste o quiz!';

  //console.log('ResultScreen1 received sessionResult:', sessionResult);

  return (
    <div style={{...styles.safe, backgroundColor: colors.background}}> 
      {(() => {
        if (!hasStats) return null;
        const glowColors = success
          ? ['rgba(27,164,91,0.0)', 'rgba(27,164,91,0.12)', 'rgba(27,164,91,0.22)'] // green
          : ['rgba(239,68,68,0.0)', 'rgba(239,68,68,0.12)', 'rgba(239,68,68,0.24)']; // red
        return (
          <LinearGradient
            colors={glowColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{...styles.bottomGlow, pointerEvents: 'none'}}
          />
        );
      })()}
      <div style={styles.content}>
        <div style={styles.header}>
          {!!quizTitle && (
            <span style={{...styles.quizTitle, color: colors.text}}>
              {quizTitle}
            </span>
          )}
        </div>
        {/* Profile banner + info */}
        <div style={styles.bannerWrap}>
          <Banner
            avatarSource={getAvatarSource()}
            bannerImageSource={getBackgroundSource()}
            frameSource={getFrameSource()}
          />
        </div>
        <div style={styles.infoWrap}>
          <Info
            username={getUsername()}
            tribe={getTribeName()}
            coins={getStats().coins}
            stars={getStats().stars}
            trophies={getStats().points}
          />
        </div>
        <Stats correct={correct} total={total} totalSec={typeof totalSec === 'number' ? totalSec : null} />
        {/* Reward pill */}
        <div style={styles.rewardWrap}>
          {(() => {
            const rewardType = getRewardType(quizType);
            const rewardAmount = getRewardAmount(sessionResult, { correct, total });
            //console.log('Rendering Reward with:', { rewardType, rewardAmount, quizType, sessionResult });
            return (
              <Reward 
                type={rewardType} 
                amount={rewardAmount} 
              />
            );
          })()}
        </div>
        {/* Spacer to push quote to middle of remaining space */}
        <div style={styles.spacer}>
          <Quote percentage={hasStats ? Math.round((correct / total) * 100) : 50} />
        </div>
      </div>
      {/* Bottom action button */}
      <div style={styles.actions}>
        <Button1
          label="Sair"
          onClick={() => navigation.goBack()}
          color={ctaColor}
          style={{ minWidth: 220 }}
        />
      </div>
    </div>
  );
}

const styles = {
  safe: { flex: 1 },
  header: {
    paddingLeft: 12, paddingRight: 12,
    paddingTop: 12,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bannerWrap: { paddingLeft: 12, paddingRight: 12, paddingTop: 16 },
  infoWrap: { paddingLeft: 12, paddingRight: 12, marginTop: 0 },
  rewardWrap: { paddingLeft: 12, paddingRight: 12, marginTop: -10 },
  spacer: { 
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  content: { flex: 1 },
  container: {
    flex: 1,
    paddingLeft: 16, paddingRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 12, paddingRight: 12,
    paddingBottom: 12,
  },
  bottomGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },
  primaryBtn: {
    minWidth: 160,
    paddingTop: 12, paddingBottom: 12,
    paddingLeft: 18, paddingRight: 18,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
};

// Helpers to read user data and build image sources
function getUserProfile() {
  return DataManager.getUserProfile?.() || null;
}

function getStats() {
  return DataManager.getUserStats?.() || { points: 0, stars: 0, coins: 0 };
}

function getTribeName() {
  const tribe = DataManager.getUserTribe?.();
  return tribe?.name || 'Sem Tribo';
}

function getUsername() {
  const user = getUserProfile();
  if (!user) return 'Nickname';
  return user.nickname || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Nickname';
}

function safeImageSource(url) {
  if (!url || typeof url !== 'string') return null;
  return { uri: url };
}

function getAvatarSource() {
  const user = getUserProfile();
  return user?.avatarUrl ? safeImageSource(user.avatarUrl) : null;
}

function getBackgroundSource() {
  const user = getUserProfile();
  return user?.backgroundUrl ? safeImageSource(user.backgroundUrl) : null;
}

function getFrameSource() {
  const user = getUserProfile();
  return user?.frameUrl ? safeImageSource(user.frameUrl) : null;
}

// Updated reward amount function to use session result
function getRewardAmount(sessionResult, fallbackData) {
  //console.log('getRewardAmount called with:', { sessionResult, fallbackData });
  
  // If we have session result with specific reward data, use it
  if (sessionResult) {
    // For challenges: show coins earned
    if (typeof sessionResult.coins === 'number') {
      //console.log('Using coins from sessionResult:', sessionResult.coins);
      return sessionResult.coins;
    }
    // For learn quizzes: show stars earned
    if (typeof sessionResult.stars === 'number') {
      //console.log('Using stars from sessionResult:', sessionResult.stars);
      return sessionResult.stars;
    }
  }
  
  // Fallback to old calculation method
  const fallbackAmount = computeRewardAmount(fallbackData);
  //console.log('Using fallback amount:', fallbackAmount);
  return fallbackAmount;
}

// Reward helpers
function getRewardType(quizType) {
  // Heuristic: learn → stars, challenge → coins; default to stars
  if (quizType === 'challenge') return 'coins';
  if (quizType === 'learn') return 'stars';
  return 'stars';
}

function computeRewardAmount({ correct, total }) {
  // Basic rule: if we have correct/total, scale amount; else default 1
  if (typeof correct === 'number' && typeof total === 'number' && total > 0) {
    const ratio = Math.max(0, Math.min(1, correct / total));
    // Map to 1..3 for MVP (like stars tiers), rounding
    const base = Math.round(1 + ratio * 2);
    return base;
  }
  return 1;
}
