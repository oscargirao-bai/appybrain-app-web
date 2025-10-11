import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';

export default function HistoryModal({ visible, onClose, pending = [], completed = [], onOpenBattle }) {
  const colors = useThemeColors();
  if (!visible) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: colors.backdrop + 'AA', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: colors.card, borderRadius: 16, padding: 16, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: colors.text }}>Histórico de Batalhas</h3>
        
        <div style={{ maxHeight: 'calc(80vh - 120px)', overflow: 'auto' }}>
          {pending.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 8 }}>Pendentes</h4>
              {pending.map((battle) => (
                <div key={battle.battleSessionId} style={{ background: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{battle.opponent?.nickname || 'Adversário'}</div>
                  <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{formatDate(battle.createdAt)}</div>
                </div>
              ))}
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 8 }}>Concluídas</h4>
              {completed.map((battle) => (
                <button
                  key={battle.battleSessionId}
                  onClick={() => onOpenBattle?.(battle.battleSessionId)}
                  style={{ width: '100%', background: colors.surface, padding: 12, borderRadius: 8, marginBottom: 8, border: `1px solid ${colors.border}`, cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{battle.opponent?.nickname || 'Adversário'}</div>
                  <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    {battle.myScore ?? 0} - {battle.opponentScore ?? 0} • {formatDate(battle.completedAt || battle.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          )}

          {pending.length === 0 && completed.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: colors.muted }}>Sem batalhas</div>
          )}
        </div>

        <button onClick={onClose} style={{ marginTop: 12, width: '100%', padding: 10, border: `1px solid ${colors.border}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: colors.text }}>
          Fechar
        </button>
      </div>
    </div>
  );
}
