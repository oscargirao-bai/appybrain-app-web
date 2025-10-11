import React, { useMemo, useState } from 'react';

import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';

// Import SVGs as React components (requires react-native-svg-transformer + metro config)











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
      <button onClick={() => setModalOpen(true)} style={{...styles.container, ...style}}  aria-label="Ver níveis do brasão">
        <ShieldComponent width={size} height={size} />
      </button>
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
};

