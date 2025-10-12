import React, { useMemo } from 'react';


import { useThemeColors } from '../../services/Theme.jsx';
import ChallengeCard from './ChallengeCard';

// items: [{ id, title, description, coins, expiresAt }]
export default function ChallengeList({ title = 'DESAFIOS', items = [], onPressItem, showHeader = true }) {
  const colors = useThemeColors();

  const data = useMemo(() => items || [], [items]);
  const insets = useSafeAreaInsets();

  return (
    <div style={styles.wrapper}>
      {showHeader ? (
        <div style={styles.headerWrap}>
          <span style={{...styles.header, ...{ color: '#F05454' }}}>{title}</span>
          <div style={{...styles.headerUnderline, ...{ backgroundColor: '#F05454' }}} />
        </div>
      ) : null}
      <div         data={data}
        keyExtractor={(item, idx) => `challenge-${item.id || idx}`}
        renderItem={({ item }) => (
          <ChallengeCard
            title={item.title}
            description={item.description}
            coins={item.coins}
            expiresAt={item.expiresAt}
            availableUntil={item.availableUntil}
            availableFrom={item.availableFrom}
            imageUrl={item.imageUrl}
            userHasPlayed={item.userHasPlayed}
            onClick={onPressItem ? () => onPressItem(item) : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
        // Ensure the last item can be scrolled above the bottom tab bar / safe area
        // Use a larger buffer to account for the NavBar visible height and curved top
        contentContainerStyle={{ paddingBottom: Math.max(120, (insets.bottom || 0) + 140) }}
        // Also add an explicit footer spacer to guarantee the final item is reachable
        ListFooterComponent={() => <div style={{ height: Math.max(120, (insets.bottom || 0) + 140) }} />}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 8,
  },
  headerWrap: {
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  header: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerUnderline: {
    height: 2,
    width: 96,
    borderRadius: 2,
    marginTop: 2,
  },
};
