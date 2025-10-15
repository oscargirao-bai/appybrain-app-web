import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

// Web: use image paths instead of importing SVG as React components
const shields = [
	'/assets/ranks/shield0.svg',
	'/assets/ranks/shield1.svg',
	'/assets/ranks/shield2.svg',
	'/assets/ranks/shield3.svg',
	'/assets/ranks/shield4.svg',
	'/assets/ranks/shield5.svg',
	'/assets/ranks/shield6.svg',
	'/assets/ranks/shield7.svg',
	'/assets/ranks/shield8.svg',
	'/assets/ranks/shield9.svg',
	'/assets/ranks/shield10.svg',
];

// points required to *reach* each rank (example: 0,50,100,...)
const POINTS_PER_RANK = 50;

export default function RankModal({ visible, onClose }) {
  const colors = useThemeColors();
  const width = window.innerWidth; const height = window.innerHeight;
  const panelMaxHeight = Math.floor(height * 0.8);
  const panelWidth = Math.min(520, width - 32);

  if (!visible) return null;

  return (
    <div style={styles.modalContainer}>
      <div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'AA'}}> 
        <button style={styles.backdropHit} onClick={onClose} aria-label="Fechar modal de níveis" />
        <div style={{...styles.panel, backgroundColor: colors.card, borderColor: colors.text + '22', maxHeight: panelMaxHeight, width: panelWidth}}>
          <span style={{...styles.title, color: colors.text}}>Níveis</span>
          <div style={{...styles.scrollContent, maxHeight: panelMaxHeight - 120, overflowY: 'auto'}}>
            <div style={styles.list}>
              {shields.map((shieldPath, idx) => (
                <div key={idx} style={{...styles.row, borderColor: colors.text + '12'}}>
                  <img src={shieldPath} alt={`Nível ${idx}`} width={64} height={64} />
                  <div style={styles.rowText}>
                    <span style={{...styles.rankTitle, color: colors.text}}>Nível {idx}</span>
                    <span style={{...styles.rankSubtitle, color: colors.text + 'AA'}}>{idx * POINTS_PER_RANK} pontos necessários</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button style={{...styles.closeBtn, borderColor: colors.text + '22'}} onClick={onClose}>
            <span style={{...styles.closeText, color: colors.text}}>Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  modalContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
  },
  backdrop: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  backdropHit: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  panel: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    padding: 16,
    borderWidth: '1px',
    borderStyle: 'solid',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: family.bold,
    textAlign: 'center',
    marginBottom: 12,
    display: 'block',
  },
  scrollContent: {
    width: '100%',
  },
  list: {
    paddingBottom: 12,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  rowText: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 16,
    fontFamily: family.bold,
    display: 'block',
  },
  rankSubtitle: {
    fontSize: 13,
    fontFamily: family.regular,
    marginTop: 2,
    display: 'block',
  },
  closeBtn: {
    marginTop: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    cursor: 'pointer',
  },
  closeText: {
    fontSize: 15,
    fontFamily: family.bold,
  },
};
