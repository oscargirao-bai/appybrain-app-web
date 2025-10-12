import React, { useMemo, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import RankModal from './RankModal.jsx';

export default function RankDisplay({ trophies = 0, size = 170, style }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [modalOpen, setModalOpen] = useState(false);

  const rankIndex = Math.max(0, Math.min(10, Math.floor((Number(trophies) || 0) / 50)));
  const title = translate('rank.rank', { n: rankIndex });

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)} 
        style={{...styles.container, ...style}}  
        aria-label="Ver níveis do brasão"
      >
        <img 
          src={`/assets/ranks/shield${rankIndex}.png`}
          alt={title}
          style={{ width: size, height: size }}
        />
      </button>
      {modalOpen && (
        <RankModal 
          visible={modalOpen} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}

const createStyles = (colors) => ({
  container: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  }
});
