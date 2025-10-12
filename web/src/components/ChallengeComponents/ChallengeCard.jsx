import React, { useMemo } from 'react';

import SvgIcon from '../../components/General/SvgIcon';
import { useThemeColors } from '../../services/Theme';

// ChallengeCard
// Props: { title, description, coins, expiresAt, availableUntil, imageUrl, onPress, userHasPlayed, availableFrom }
export default function ChallengeCard({ 
  title, 
  description, 
  coins = 0, 
  expiresAt, 
  availableUntil, 
  availableFrom,
  imageUrl, 
  onPress,
  userHasPlayed = 0
}) {
  const colors = useThemeColors();

  // Determine challenge state
  const now = new Date();
  const startTime = availableFrom ? new Date(availableFrom) : null;
  const endTime = availableUntil ? new Date(availableUntil) : null;
  
  const isCompleted = userHasPlayed === 1;
  const isExpired = endTime && now > endTime;
  const isNotStarted = startTime && now < startTime;
  const isAvailable = !isCompleted && !isExpired && !isNotStarted;

  const timeLeftLabel = useMemo(() => {
    // Use availableUntil from API or fallback to expiresAt
    const endTime = availableUntil || expiresAt;
    if (!endTime) return null;

    const now = Date.now();
    const end = typeof endTime === 'string' ? new Date(endTime).getTime() :
      typeof endTime === 'number' ? endTime : new Date(endTime).getTime();
    
    if (end <= now) return 'Expirado';
    
    let diff = Math.max(0, end - now);
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    diff -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diff / (60 * 1000));
    return `${days}d:${hours}h:${minutes}m`;
  }, [expiresAt, availableUntil]);

  return (
    <button       onClick={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: colors.text + (isAvailable ? '08' : '05'), 
          borderColor: colors.text + (isAvailable ? '15' : '08'),
          opacity: isAvailable ? 1 : 0.6 
        },
        pressed && isAvailable && { opacity: 0.9 },
      ]}
      accessibilityRole={isAvailable && onPress ? 'button' : undefined}
    >
      <div style={{...styles.leftIcon, ...{ 
          backgroundColor: colors.surface}}>
        {imageUrl ? (
          <img             source={{ uri: imageUrl }}
            style={{...styles.challengeImage, ...{ opacity: isAvailable ? 1 : 0.5 }}}
            style={{objectFit: "contain"}}
          />
        ) : (
          <SvgIcon name="file-text" size={26} color={isAvailable ? colors.secondary : colors.muted} />
        )}
        {isCompleted && (
          <div style={{...styles.statusBadge, ...{ backgroundColor: colors.success }}}>
            <SvgIcon name="check" size={12} color="white" />
          </div>
        )}
        {isExpired && !isCompleted && (
          <div style={{...styles.statusBadge, ...{ backgroundColor: colors.danger || '#FF6B6B' }}}>
            <SvgIcon name="x" size={12} color="white" />
          </div>
        )}
      </div>
      <div style={styles.main}>
        <span style={{...styles.title, ...{ color: isAvailable ? colors.secondary : colors.muted }}} numberOfLines={1}>
          {title}
        </span>
        {description ? (
          <span style={{...styles.desc, ...{ color: (isAvailable ? colors.text : colors.muted) + 'CC' }}} numberOfLines={2}>
            {description}
          </span>
        ) : null}
        <div style={styles.metaRow}>
          <div style={styles.metaGroup}>
            <SvgIcon name="coins" size={18} color={isAvailable ? colors.primary : colors.muted} />
            <span style={{...styles.metaText, ...{ 
                color: isAvailable ? colors.primary : colors.muted}}>
              {coins}
            </span>
          </div>
          {timeLeftLabel ? (
            <div style={{...styles.metaGroup, ...{ marginLeft: 14 }}}>
              <SvgIcon name="clock" size={18} color={colors.muted} />
              <span style={{...styles.metaText, ...{ color: colors.muted}}>
                {timeLeftLabel}
              </span>
            </div>
          ) : null}
          {isCompleted && (
            <div style={{...styles.metaGroup, ...{ marginLeft: 14 }}}>
              <span style={{...styles.statusText, ...{ color: colors.muted }}}>
                Completado
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

const styles = {
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  leftIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
};
