import React from 'react';

import { useThemeColors } from '../../services/Theme';

/**
 * Stats component for quiz results
 * Props:
 *  - correct: number | null
 *  - total: number | null
 *  - totalSec: number | null (will be formatted to 1 decimal, like 16.6s)
 */
export default function Stats({ correct = null, total = null, totalSec = null }) {
  const colors = useThemeColors();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const correctText =
    correct != null && total != null ? `${correct}/${total}` : '--';
  const timeText =
    typeof totalSec === 'number' ? `${totalSec.toFixed(1)}s` : '--';

  return (
    <div style={styles.container}>
      <div style={styles.item}>
        <span style={styles.value}>{correctText}</span>
        <span style={styles.label}>Acertos</span>
      </div>
      <div style={styles.item}>
        <span style={styles.value}>{timeText}</span>
        <span style={styles.label}>Tempo Total</span>
      </div>
    </div>
  );
}

const createStyles = (colors) => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingTop: 12,
    paddingBottom: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  value: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text + 'AA',
  },
});
