import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

const POINTS_PER_RANK = 50;
const shields = Array.from({ length: 11 }, (_, i) => `/assets/ranks/shield${i}.svg`);

export default function RankModal({ visible, onClose }) {
  const colors = useThemeColors();
  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.backdrop + 'AA', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: colors.card, borderRadius: 16, padding: 16, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: colors.text }}>Níveis</h3>
        <div style={{ maxHeight: 'calc(80vh - 120px)', overflow: 'auto', paddingBottom: 12 }}>
          {shields.map((src, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${colors.border}` }}>
              <img src={src} alt={`Rank ${idx}`} style={{ width: 64, height: 64 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>Nível {idx}</div>
                <div style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{idx * POINTS_PER_RANK} pontos necessários</div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 12, width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: colors.text }}>
          Fechar
        </button>
      </div>
    </div>
  );
}
