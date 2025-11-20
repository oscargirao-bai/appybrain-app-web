import React, { useMemo } from 'react';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import { family } from '../../constants/font.jsx';

export default function ChallengeCard({ 
  title, 
  description, 
  coins = 0, 
  expiresAt, 
  availableUntil, 
  availableFrom,
  imageUrl, 
  onPress,
  userHasPlayed = 0,
  progress = null,
  sessionId = null,
  tournament = false,
  minimumPoints = null,
  onRankingPress
}) {
  const colors = useThemeColors();
  const { translate } = useTranslate();

  const now = new Date();
  const startTime = availableFrom ? new Date(availableFrom) : null;
  const endTime = availableUntil ? new Date(availableUntil) : null;
  
  const isCompleted = userHasPlayed === 1;
  const isExpired = endTime && now > endTime;
  const isNotStarted = startTime && now < startTime;
  const isAvailable = !isCompleted && !isExpired && !isNotStarted;
  
  const timeLeftLabel = useMemo(() => {
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
    <button
      onClick={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      style={{
        ...styles.card,
        backgroundColor: colors.text + (isAvailable ? '08' : '05'),
        borderColor: colors.text + (isAvailable ? '15' : '08'),
        opacity: isAvailable ? 1 : 0.6,
        cursor: isAvailable ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          ...styles.leftIcon,
          backgroundColor: colors.surface,
          borderColor: colors.text + (isAvailable ? '22' : '10'),
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{...styles.challengeImage, opacity: isAvailable ? 1 : 0.5}}
          />
        ) : (
          <LucideIcon name="file-text" size={26} color={isAvailable ? colors.secondary : colors.muted} />
        )}
        {isCompleted && (
          <div style={{...styles.statusBadge, backgroundColor: colors.success}}>
            <LucideIcon name="check" size={12} color="white" />
          </div>
        )}
        {isExpired && !isCompleted && (
          <div style={{...styles.statusBadge, backgroundColor: colors.danger || '#FF6B6B'}}>
            <LucideIcon name="x" size={12} color="white" />
          </div>
        )}
      </div>
      <div style={styles.main}>
        <span style={{
          ...styles.title,
          color: isAvailable ? colors.secondary : colors.muted,
        }}>
          {title}
        </span>
        {description && (
          <span style={{
            ...styles.description,
            color: colors.text + (isAvailable ? 'CC' : '88'),
          }}>
            {description}
          </span>
        )}
        <div style={styles.footer}>
          {coins > 0 && (
            <div style={styles.coinsBox}>
              <LucideIcon name="coins" size={14} color={colors.accent} />
              <span style={{...styles.coinsText, color: colors.accent}}>
                {coins}
              </span>
            </div>
          )}
          {timeLeftLabel && (
            <span style={{...styles.timeLabel, color: colors.text + '99'}}>
              {timeLeftLabel}
            </span>
          )}
        </div>
        {progress && sessionId && isAvailable && (
          <div style={{...styles.progressRow, borderTopColor: colors.text + '15'}}>
            <span style={{...styles.progressText, color: colors.secondary}}>
              Perguntas: {progress}
            </span>
          </div>
        )}
        {tournament && minimumPoints !== null && (
          <div style={{...styles.tournamentRow, borderTopColor: colors.text + '15'}}>
            {onRankingPress && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRankingPress();
                }}
                style={{
                  ...styles.rankingButton,
                  backgroundColor: colors.accent,
                }}
                onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <LucideIcon name="medal" size={20} color="#FFFFFF" />
              </button>
            )}
            <div style={styles.tournamentContent}>
              <span style={{...styles.minimumPointsText, color: colors.accent}}>
                {translate('challenge.minimumPoints', { points: minimumPoints })}
              </span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: '1px',
    borderStyle: 'solid',
    paddingTop: 6,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
    gap: 12,
    alignItems: 'flex-start',
    background: 'transparent',
    textAlign: 'left',
    width: '100%',
  },
  leftIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: '1px',
    borderStyle: 'solid',
    flexShrink: 0,
  },
  challengeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    objectFit: 'contain',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: family.bold,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    fontSize: 12,
    fontFamily: family.regular,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  coinsBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: family.bold,
  },
  timeLabel: {
    fontSize: 11,
    fontFamily: family.regular,
  },
  progressRow: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    marginTop: 8,
    paddingTop: 8,
  },
  progressText: {
    fontSize: 13,
    fontFamily: family.bold,
    fontWeight: '600',
  },
  tournamentRow: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    marginTop: 8,
    paddingTop: 8,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tournamentContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  minimumPointsText: {
    fontSize: 12,
    fontFamily: family.regular,
    fontWeight: '500',
  },
  rankingButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
};
