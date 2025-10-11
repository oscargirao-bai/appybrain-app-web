import React, { useState } from 'react';
import { t } from '../../services/Translate.js';
import RankModal from './RankModal.jsx';

export default function RankDisplay({ trophies = 0, size = 170, style = {} }) {
  const [modalOpen, setModalOpen] = useState(false);

  // Rank every 50 trophies, clamped to 0..10
  const rankIndex = Math.max(0, Math.min(10, Math.floor((Number(trophies) || 0) / 50)));
  const shieldSrc = `/assets/ranks/shield${rankIndex}.svg`;

  return (
    <>
      <button 
        onClick={() => setModalOpen(true)} 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer', 
          padding: 0,
          ...style 
        }}
        aria-label="Ver níveis do brasão"
      >
        <img src={shieldSrc} alt={`Rank ${rankIndex}`} style={{ width: size, height: size }} />
      </button>
      {modalOpen && <RankModal visible={modalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
}
