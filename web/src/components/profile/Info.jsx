import React from 'react';

import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import SvgIcon from '../../components/General/SvgIcon';

/**
 * Profile Info (refactored): similar to Learn Info but:
 *  - No avatar square
 *  - No coins pill
 *  - Larger username
 *  - No outer bordered container; just minimal spacing
 * Props:
 *  - username
 *  - tribe
 *  - stars (number)
 *  - onEdit (optional)
 */
export default function Info({
  username = 'TomasGirao1234',
  tribe = 'Sem Tribo',
  stars,
  onEdit,
  style,
}) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <div style={{...styles.wrapper, ...style}}>
      <div style={styles.textBlock}>
        <div style={styles.nameRow}>
          <span style={styles.username}>{username}</span>
          <button onClick={onEdit} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          </button>
        </div>
        <span style={styles.tribe}>{tribe}</span>
      </div>
      {typeof stars === 'number' && (
        <div style={styles.starsPill} aria-label={`Estrelas: ${stars}`}>
          <SvgIcon name="star" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <span style={styles.starsText}>{stars}</span>
        </div>
      )}
    </div>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 6,
      paddingHorizontal: 2,
    },
    textBlock: { flex: 1, paddingRight: 8 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    username: {
      fontSize: 26,
      fontWeight: '800',
      fontFamily: family.bold,
      color: colors.text,
      flexShrink: 1,
    },
    tribe: {
      marginTop: 2,
      fontSize: 18,
      fontWeight: '500',
      fontFamily: family.medium,
      color: colors.text + '99',
    },
    starsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.text + '35',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: colors.background + '40',
      minWidth: 90,
      justifyContent: 'center',
    },
    starsText: { fontSize: 18, fontWeight: '800', fontFamily: family.bold, color: colors.text },
  };
}

