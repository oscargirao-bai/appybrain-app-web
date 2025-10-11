import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';

// Import SVGs as React components (requires react-native-svg-transformer + metro config)
import Shield0 from '../../../assets/ranks/shield0.svg';
import Shield1 from '../../../assets/ranks/shield1.svg';
import Shield2 from '../../../assets/ranks/shield2.svg';
import Shield3 from '../../../assets/ranks/shield3.svg';
import Shield4 from '../../../assets/ranks/shield4.svg';
import Shield5 from '../../../assets/ranks/shield5.svg';
import Shield6 from '../../../assets/ranks/shield6.svg';
import Shield7 from '../../../assets/ranks/shield7.svg';
import Shield8 from '../../../assets/ranks/shield8.svg';
import Shield9 from '../../../assets/ranks/shield9.svg';
import Shield10 from '../../../assets/ranks/shield10.svg';
import RankModal from './RankModal';

// Array of shield components by index 0..10
const shields = [
  Shield0,
  Shield1,
  Shield2,
  Shield3,
  Shield4,
  Shield5,
  Shield6,
  Shield7,
  Shield8,
  Shield9,
  Shield10,
];

export default function RankDisplay({ trophies = 0, size = 170, style }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [modalOpen, setModalOpen] = useState(false);

  // Rank every 50 trophies, clamped to 0..10
  const rankIndex = Math.max(0, Math.min(10, Math.floor((Number(trophies) || 0) / 50)));
  const title = translate('rank.rank', { n: rankIndex });
  const ShieldComponent = shields[rankIndex] || Shield10;

  return (
    <>
      <Pressable onPress={() => setModalOpen(true)} style={[styles.container, style]} accessibilityRole="button" accessibilityLabel="Ver níveis do brasão">
        <ShieldComponent width={size} height={size} />
      </Pressable>
      {/* Rank modal */}
      {modalOpen ? <RankModal visible={modalOpen} onClose={() => setModalOpen(false)} /> : null}
    </>
  );
}

const createStyles = (colors) => StyleSheet.create({
	container: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
    paddingBottom: 4,
	}
});

