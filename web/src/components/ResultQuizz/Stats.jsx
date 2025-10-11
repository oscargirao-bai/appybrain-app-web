import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.value}>{correctText}</Text>
        <Text style={styles.label}>Acertos</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.value}>{timeText}</Text>
        <Text style={styles.label}>Tempo Total</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 12,
    marginVertical: 12,
  },
  item: {
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
