import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import ChallengeCard from './ChallengeCard.jsx';

// items: [{ id, title, description, coins, expiresAt }]
export default function ChallengeList({ title = 'DESAFIOS', items = [], onPressItem, showHeader = true, style }) {
  const colors = useThemeColors();

  const data = useMemo(() => items || [], [items]);

  return (
    <div style={{ ...styles.wrapper, ...(style || {}) }}>
      {showHeader ? (
        <div style={styles.headerWrap}>
          <span style={{...styles.header, ...{ color: '#F05454' }}}>{title}</span>
          <div style={{...styles.headerUnderline, ...{ backgroundColor: '#F05454' }}} />
        </div>
      ) : null}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        paddingBottom: '140px',
        overflowY: 'auto',
        flex: 1,
      }}>
        {data.map((item, idx) => (
          <ChallengeCard
            key={`challenge-${item.id || idx}`}
            title={item.title}
            description={item.description}
            coins={item.coins}
            expiresAt={item.expiresAt}
            availableUntil={item.availableUntil}
            availableFrom={item.availableFrom}
            imageUrl={item.imageUrl}
            userHasPlayed={item.userHasPlayed}
            onPress={onPressItem ? () => onPressItem(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  headerWrap: {
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 6,
    paddingRight: 6,
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
