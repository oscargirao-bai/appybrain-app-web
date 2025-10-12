import React from 'react';
// Modal converted to div
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font';












const shields = [Shield0, Shield1, Shield2, Shield3, Shield4, Shield5, Shield6, Shield7, Shield8, Shield9, Shield10];

// points required to *reach* each rank (example: 0,50,100,...)
const POINTS_PER_RANK = 50;

export default function RankModal({ visible, onClose }) {
  const colors = useThemeColors();
  const width = window.innerWidth; const height = window.innerHeight;
  const panelMaxHeight = Math.floor(height * 0.8);
  const panelWidth = Math.min(520, width - 32);

  return (
    <div style={{display: visible ? "flex" : "none"}} transparent animationType="fade" onRequestClose={onClose}>
      <div style={{...styles.backdrop, ...{ backgroundColor: colors.backdrop + 'AA' }}}> 
        <button style={StyleSheet.absoluteFill} onClick={onClose} />
        <div style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.text + '22', maxHeight: panelMaxHeight, width: panelWidth }] }>
          <span style={{...styles.title, ...{ color: colors.text }}}>Níveis</span>
          <div contentContainerStyle={styles.list} style={{ maxHeight: panelMaxHeight - 120 }}>
            {shields.map((ShieldComp, idx) => (
              <div key={idx} style={{...styles.row, ...{ borderColor: colors.text + '12' }}}>
                <ShieldComp width={64} height={64} />
                <div style={styles.rowText}>
                  <span style={{...styles.rankTitle, ...{ color: colors.text }}}>Nível {idx}</span>
                  <span style={{...styles.rankSubtitle, ...{ color: colors.text + 'AA' }}}>{idx * POINTS_PER_RANK} pontos necessários</span>
                </div>
              </div>
            ))}
          </div>
          <button style={{...styles.closeBtn, ...{ borderColor: colors.text + '22' }}} onClick={onClose}>
            <span style={{...styles.closeText, ...{ color: colors.text }}}>Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  panel: { width: '100%', maxWidth: 520, borderRadius: 16, padding: 16, borderWidth: 1 },
  title: { fontSize: 18, fontFamily: family.bold, textAlign: 'center', marginBottom: 12 },
  list: { paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1 },
  rowText: { flex: 1 },
  rankTitle: { fontSize: 16, fontFamily: family.bold },
  rankSubtitle: { fontSize: 13, fontFamily: family.regular, marginTop: 2 },
  closeBtn: { marginTop: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 10, alignItems: 'center' },
  closeText: { fontSize: 15, fontFamily: family.bold },
};
