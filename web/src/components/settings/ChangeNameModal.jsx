import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import './ChangeNameModal.css';

/**
 * ChangeNameModal
 * Modal for changing user's display name
 * Props:
 *  - visible (bool)
 *  - currentName (string) - current user name to prefill
 *  - onCancel () => void
 *  - onConfirm (newName: string) => void
 */
export default function ChangeNameModal({ visible, currentName = '', onCancel, onConfirm }) {
  const colors = useThemeColors();
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (visible) {
      setNewName(currentName);
    }
  }, [visible, currentName]);

  const handleConfirm = () => {
    const trimmedName = newName.trim();
    if (trimmedName.length > 0) {
      onConfirm(trimmedName);
    }
  };

  const isValidName = newName.trim().length > 0;

  if (!visible) return null;

  return (
    <div className="change-name-modal-backdrop" style={{ backgroundColor: colors.backdrop + 'AA' }}>
      <div className="change-name-modal-overlay" onClick={onCancel} aria-label="Fechar modal" />
      <div
        className="change-name-modal-panel"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.text + '22',
        }}
      >
        <h3 className="change-name-modal-title" style={{ color: colors.text }}>
          Mudar Nome
        </h3>

        <input
          type="text"
          className="change-name-modal-input"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.text + '25',
            color: colors.text,
          }}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Novo nome"
          maxLength={50}
          autoFocus
        />

        <div className="change-name-modal-row">
          <button
            onClick={onCancel}
            className="change-name-modal-btn"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.text + '25',
            }}
            aria-label="Cancelar"
          >
            <span style={{ color: colors.text }}>Cancelar</span>
          </button>

          <button
            onClick={handleConfirm}
            disabled={!isValidName}
            className="change-name-modal-btn"
            style={{
              backgroundColor: isValidName ? colors.secondary : colors.surface,
              borderColor: isValidName ? colors.secondary + '55' : colors.text + '25',
              opacity: isValidName ? 1 : 0.5,
            }}
            aria-label="Confirmar mudança de nome"
          >
            <span style={{ color: isValidName ? colors.onSecondary : colors.text }}>
              Confirmar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
