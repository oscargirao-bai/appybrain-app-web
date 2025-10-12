import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import { family } from '../../constants/font';

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

          return (
            <button
              key={t.id}
              onClick={() => handlePress(t)}
              style={{
                ...styles.tribeButton,
                backgroundColor: tribeColor + (isActive ? '22' : '11'),
                borderColor: tribeColor + (isActive ? '66' : '33'),
                transform: isActive ? 'scale(1)' : 'scale(0.94)',
                boxShadow: isActive ? `0 4px 12px ${tribeColor}44` : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  ...styles.tribeInner,
                  borderColor: tribeColor + (isActive ? '44' : '22'),
                }}
              >
                {t.icon && (
                  <div 
                    style={styles.iconBox}
                    dangerouslySetInnerHTML={{ __html: t.icon }}
                  />
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
    paddingBottom: 8,
  },
  tribeButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 16,
    borderWidth: '2px',
    borderStyle: 'solid',
    background: 'transparent',
    cursor: 'pointer',
    minWidth: 90,
  },
  tribeInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconBox: {
    width: 32,
    height: 32,
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
