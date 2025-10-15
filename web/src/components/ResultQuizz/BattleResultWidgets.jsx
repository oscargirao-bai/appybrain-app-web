import React, { useMemo } from 'react';

import Banner from '../Profile/Banner.jsx';
import Info from '../Learn/Info.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';
import { getHeroIcon } from '../../screens/quizz/helpers/battleResultHelpers.js';

const MAX_ROW_WIDTH = 420;
const BANNER_WIDTH_RATIO = 0.75;

export function BattleParticipantRow({
  side,
  bannerProps,
  info,
  delta,
  colors,
  pending,
}) {
  const { avatarSource, bannerImageSource, frameSource } = bannerProps;
  const { username, tribe, coins, stars, trophies } = info;
  const { value, isDraw } = delta;
  const isOpponent = side === 'opponent';
  const trophyTone = pending
    ? colors.text
    : isDraw
      ? '#F59E0B'
      : typeof value === 'number' && value !== 0
        ? (value > 0 ? '#1BA45B' : '#EF4444')
        : colors.text;
  const hasValue = typeof value === 'number' && !Number.isNaN(value);
  const sign = pending || !hasValue || value === 0 ? '' : value > 0 ? '+' : '-';
  const magnitude = pending ? '...' : hasValue ? String(Math.abs(value)) : '0';

  const wrapperStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 12,
    boxSizing: 'border-box',
  };

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
    maxWidth: MAX_ROW_WIDTH,
  };

  const trophyArea = (
    <div style={styles.trophyArea}>
      <div style={styles.trophyRow}>
        {sign && (
          <span style={{ ...styles.trophySign, color: trophyTone }}>{sign}</span>
        )}
        <LucideIcon name="trophy" size={18} color={colors.primary} style={{ marginRight: 4 }} />
        <span style={{ ...styles.trophyValue, color: trophyTone }}>
          {magnitude}
        </span>
      </div>
    </div>
  );

  const banner = (
    <Banner
      avatarSource={avatarSource}
      bannerImageSource={bannerImageSource}
      frameSource={frameSource}
      topFlat={false}
      onPress={isOpponent ? (() => {}) : undefined}
      style={{
        ...(isOpponent ? styles.bannerRight : styles.bannerLeft),
        width: `${BANNER_WIDTH_RATIO * 100}%`,
        maxWidth: MAX_ROW_WIDTH * BANNER_WIDTH_RATIO,
      }}
      aspectRatio={560 / 180}
    />
  );

  return (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        {isOpponent ? (
          <>
            {trophyArea}
            {banner}
          </>
        ) : (
          <>
            {banner}
            {trophyArea}
          </>
        )}
      </div>
      {/* Make the info box overlap the banner by using negative margin and center alignment */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: -34 }}>
        <div style={{ width: '100%', maxWidth: MAX_ROW_WIDTH * BANNER_WIDTH_RATIO }}>
          {/* Pass only username and tribe; hide coins/stars/trophies for the lower user */}
          <Info username={username} tribe={tribe} />
        </div>
      </div>
    </div>
  );
}

export function BattleMetrics({
  topSequence,
  bottomSequence,
  opponentStats,
  playerStats,
  colors,
  translate,
  compact,
}) {
  const dotSize = compact ? 22 : 26;
  const labelTime = translate('battle.result.time');
  const labelHelp = translate('battle.result.help');

  const opponentHelpContent = useMemo(
    () => <HelpIcons data={opponentStats.helps} colors={colors} />,
    [opponentStats.helps, colors],
  );
  const playerHelpContent = useMemo(
    () => <HelpIcons data={playerStats.helps} colors={colors} />,
    [playerStats.helps, colors],
  );

  return (
    <div
      style={{
        ...styles.vsSection,
        padding: compact ? '8px 12px' : '12px 20px',
        maxWidth: MAX_ROW_WIDTH,
      }}
    >
      <div style={styles.scoreBlock}>
        <ResultsDots sequence={topSequence} colors={colors} dotSize={dotSize} />
        <div style={styles.metricsRow}>
          <Metric label={labelTime} value={opponentStats.time} icon="clock" colors={colors} />
          <Metric label={labelHelp} value={opponentHelpContent} icon="lightbulb" colors={colors} />
        </div>
      </div>
      <div style={styles.vsDivider}>
        <div style={{ ...styles.vsBar, backgroundColor: colors.text + '22' }} />
        <span style={{ ...styles.vsText, color: colors.text + '99' }}>VS</span>
        <div style={{ ...styles.vsBar, backgroundColor: colors.text + '22' }} />
      </div>
      <div style={styles.scoreBlock}>
        <ResultsDots sequence={bottomSequence} colors={colors} dotSize={dotSize} />
        <div style={styles.metricsRow}>
          <Metric label={labelTime} value={playerStats.time} icon="clock" colors={colors} />
          <Metric label={labelHelp} value={playerHelpContent} icon="lightbulb" colors={colors} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, colors }) {
  const content = typeof value === 'string' ? <span style={{ ...styles.metricValue, color: colors.text }}>{value}</span> : value;
  return (
    <div style={styles.metricItem}>
      <LucideIcon name={icon} size={14} color={colors.text + '99'} style={{ marginRight: 6 }} />
      <span style={{ ...styles.metricLabel, color: colors.text + '99' }}>{label}</span>
      {content}
    </div>
  );
}

export function ResultsDots({ sequence = [], colors, dotSize = 30 }) {
  if (!Array.isArray(sequence) || sequence.length === 0) return null;
  return (
    <div style={styles.dotsRow}>
      {sequence.map((status, index) => {
        const { background, border, iconName, iconColor } = resolveDotVisual(status, colors);
        return (
          <div
            key={`${status}-${index}`}
            style={{
              ...styles.dot,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: background,
              borderColor: border,
            }}
          >
            <LucideIcon name={iconName} size={12} color={iconColor} />
          </div>
        );
      })}
    </div>
  );
}

function resolveDotVisual(status, colors) {
  switch (status) {
    case 'correct':
      return { background: '#1BA45B22', border: '#1BA45B66', iconName: 'check', iconColor: '#1BA45B' };
    case 'timeout':
      return { background: '#F59E0B22', border: '#F59E0B66', iconName: 'minus', iconColor: '#F59E0B' };
    case 'unknown':
      return { background: colors.text + '11', border: colors.text + '55', iconName: 'help-circle', iconColor: colors.text };
    default:
      return { background: '#EF444422', border: '#EF444466', iconName: 'x', iconColor: '#EF4444' };
  }
}

export function HelpIcons({ data, colors }) {
  if (!data || (data.count ?? 0) === 0) {
    return <span style={{ ...styles.helpValue, color: colors.text }}>-</span>;
  }

  if (Array.isArray(data.heroes) && data.heroes.length > 0) {
    const displayed = data.heroes.slice(0, 4);
    const extra = data.heroes.length - displayed.length;
    return (
      <span style={styles.helpIconsRow}>
        {displayed.map((heroId, index) => {
          const iconName = getHeroIcon(heroId);
          if (!iconName) return null;
          return <LucideIcon key={`${heroId}-${index}`} name={iconName} size={14} color={colors.text} style={{ marginLeft: index === 0 ? 0 : 2 }} />;
        })}
        {extra > 0 && (
          <span style={{ ...styles.helpExtra, color: colors.text }}>{`+${extra}`}</span>
        )}
      </span>
    );
  }

  return <span style={{ ...styles.helpValue, color: colors.text }}>{data.count}</span>;
}

const styles = {
  bannerLeft: {
    width: '100%',
  },
  bannerRight: {
    width: '100%',
  },
  infoLeft: {
    width: '100%',
    maxWidth: MAX_ROW_WIDTH * BANNER_WIDTH_RATIO,
    alignSelf: 'flex-start',
  },
  infoRight: {
    width: '100%',
    maxWidth: MAX_ROW_WIDTH * BANNER_WIDTH_RATIO,
    alignSelf: 'flex-end',
  },
  trophyArea: {
    width: `${(1 - BANNER_WIDTH_RATIO) * 100}%`,
    minWidth: 96,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophySign: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: family.bold,
    marginRight: 2,
  },
  trophyValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: family.bold,
  },
  vsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    margin: '0 auto',
    borderRadius: 18,
  },
  scoreBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  dotsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: family.bold,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: family.bold,
  },
  vsDivider: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  vsBar: {
    flex: 1,
    height: 1,
    borderRadius: 2,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: family.bold,
    letterSpacing: 1,
  },
  helpValue: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: family.bold,
  },
  helpIconsRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpExtra: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: family.bold,
    marginLeft: 4,
  },
};

export default {
  BattleParticipantRow,
  BattleMetrics,
  ResultsDots,
  HelpIcons,
};
