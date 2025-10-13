import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import { family } from '../../constants/font.jsx';

export default function TribesHeader({ 
  title = 'Tribos', 
  allTribes = [], 
  userTribe, 
  isInTribe = false,
  onSelect 
}) {
  const colors = useThemeColors();
  const width = window.innerWidth;
  const horizontalPadding = width >= 768 ? 28 : 16;

  // Sort tribes: user's tribe first, then others
  const sortedTribes = useMemo(() => {
    if (!isInTribe || !userTribe) {
      return allTribes;
    }
    
    const userTribeData = allTribes.find(t => t.id === userTribe.id);
    const otherTribes = allTribes.filter(t => t.id !== userTribe.id);
    
    return userTribeData ? [userTribeData, ...otherTribes] : allTribes;
  }, [allTribes, userTribe, isInTribe]);

  // Use the sorted list of tribes
  const [active, setActive] = useState(userTribe?.id || sortedTribes[0]?.id || null);
  
  useEffect(() => {
    // Only set initial active tribe if none is selected yet
    if (!active && sortedTribes.length > 0) {
      // Set default to user's tribe if they have one, otherwise first tribe
      const defaultTribe = (isInTribe && userTribe) ? userTribe.id : sortedTribes[0].id;
      setActive(defaultTribe);
    }
  }, [sortedTribes, active, isInTribe, userTribe]);

  // Update active when active changes
  useEffect(() => {
    if (active) {
      const selectedTribe = sortedTribes.find(t => t.id === active);
      if (selectedTribe && onSelect) {
        onSelect(selectedTribe);
      }
    }
  }, [active, sortedTribes, onSelect]);

  const handlePress = useCallback((tribe) => {
    setActive(tribe.id);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <span style={{...styles.title, color: colors.text}}>{title}</span>
      </div>
      <div 
        style={{
          ...styles.scrollView,
          paddingLeft: horizontalPadding,
          paddingRight: horizontalPadding,
        }}
      >
        {sortedTribes.map((t) => {
          const isActive = t.id === active;
          const tribeColor = t.color || colors.primary;
          const tribeIconColor = t.iconColor || colors.background;

          return (
            <button
              type="button"
              key={t.id}
              onClick={() => handlePress(t)}
              style={{
                ...styles.tribeButton,
                backgroundColor: tribeColor,
                borderColor: tribeColor + (isActive ? 'aa' : '66'),
                transform: isActive ? 'scale(1)' : 'scale(0.82)',
                boxShadow: isActive ? `0 10px 22px ${tribeColor}55` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  ...styles.tribeInner,
                  borderColor: tribeColor + (isActive ? '55' : '33'),
                }}
              >
                {t.icon && (
                  <div style={styles.iconBox}>
                    <SvgIcon svgString={t.icon} size={60} color={tribeIconColor} />
                  </div>
                )}
              </div>
              <span 
                style={{
                  ...styles.tribeLabel, 
                  color: colors.text,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {t.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    marginBottom: 20,
    paddingTop: 4,
    paddingBottom: 10,
    overflow: 'visible',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: family.bold,
  },
  scrollView: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    overflowX: 'auto',
    paddingTop: 16,
    paddingBottom: 16,
  },
  tribeButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: 24,
    borderWidth: '2px',
    borderStyle: 'solid',
    background: 'transparent',
    cursor: 'pointer',
    minWidth: 90,
    overflow: 'visible',
  },
  tribeInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconBox: {
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tribeLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: family.semibold,
    textAlign: 'center',
  },
};
