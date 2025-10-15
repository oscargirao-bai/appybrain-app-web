import React, { useState, useMemo, useCallback } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import UserList from '../General/UserList.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import { useRankingsData } from './useRankingsData.js';
import styles from './RankingsModal.styles.js';

const METRIC_OPTIONS = [
  { value: 'points', icon: 'trophy' },
  { value: 'stars', icon: 'star' },
  { value: 'xp', icon: null },
];

const TAB_OPTIONS = [
  { value: 'global', icon: 'globe' },
  { value: 'school', icon: 'school' },
  { value: 'class', icon: 'users' },
];

export default function RankingsModal({ visible, onClose, navigation }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const [metric, setMetric] = useState('points');
  const [tab, setTab] = useState('global');

  const { users, loading, setLoading, currentUserId } = useRankingsData({ visible, metric, tab });

  const metricLabels = useMemo(
    () => ({
      points: translate('rankings.metrics.points'),
      stars: translate('rankings.metrics.stars'),
      xp: translate('rankings.metrics.xp'),
    }),
    [translate],
  );

  const tabLabels = useMemo(
    () => ({
      global: translate('rankings.tabs.global'),
      school: translate('rankings.tabs.school'),
      class: translate('rankings.tabs.class'),
    }),
    [translate],
  );

  const handleUserPress = useCallback(
    async (user) => {
      if (!navigation || !user) return;
      if (user.id === currentUserId) return;

      setLoading(true);
      try {
        const userId = parseInt(user.id, 10);
        if (!Number.isFinite(userId)) {
          return;
        }
        const response = await ApiManager.getUserBadges(userId);
        if (response?.success && response?.user) {
          onClose();
          navigation.navigate('Profile', {
            externalUser: response.user,
            externalBadges: response.items || [],
          });
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    },
    [navigation, currentUserId, onClose, setLoading],
  );

  if (!visible) {
    return null;
  }

  const activeBackgroundBase = colors.card || colors.background || '#000000';

  return (
    <div style={styles.modalContainer}>
      <div style={{ ...styles.backdrop, backgroundColor: '#00000088' }}>
        <button
          type="button"
          style={styles.backdropHit}
          onClick={onClose}
          aria-label={translate('common.close')}
        />
        <div
          style={{
            ...styles.panel,
            backgroundColor: colors.card || colors.background,
            borderColor: colors.text + '22',
          }}
        >
          <div style={styles.titleRow}>
            <span style={{ ...styles.modalTitle, color: colors.text }}>
              {translate('rankings.title')}
            </span>
            {loading ? <span style={{ ...styles.loadingIndicator, color: colors.primary }}>...</span> : null}
          </div>
          <div style={styles.tabsRowCentered}>
            {METRIC_OPTIONS.map(({ value, icon }) => {
              const active = metric === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMetric(value)}
                  style={{
                    ...styles.tabBtn,
                    borderColor: active ? colors.primary + 'AA' : colors.text + '33',
                    backgroundColor: active ? activeBackgroundBase + 'AA' : 'transparent',
                  }}
                  aria-pressed={active}
                  aria-label={metricLabels[value]}
                >
                  {icon ? (
                    <LucideIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
                  ) : null}
                  <span style={{ ...styles.tabLabel, color: active ? colors.primary : colors.text }}>
                    {metricLabels[value]}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={styles.tabsRowCentered}>
            {TAB_OPTIONS.map(({ value, icon }) => {
              const active = tab === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  style={{
                    ...styles.tabBtn,
                    borderColor: active ? colors.primary + 'AA' : colors.text + '33',
                    backgroundColor: active ? activeBackgroundBase + 'AA' : 'transparent',
                  }}
                  aria-pressed={active}
                  aria-label={tabLabels[value]}
                >
                  <LucideIcon name={icon} size={16} color={active ? colors.primary : colors.text} />
                  <span style={{ ...styles.tabLabel, color: active ? colors.primary : colors.text }}>
                    {tabLabels[value]}
                  </span>
                </button>
              );
            })}
          </div>
          <div style={styles.listContainer}>
            <UserList
              users={users}
              metric={metric}
              currentUserId={currentUserId}
              emptyLabel={translate('rankings.empty')}
              onUserPress={navigation ? handleUserPress : undefined}
              showMedals
              denseRanking={false}
              showRelativeBar={metric !== 'xp'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
