import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import './MessageModal.css';

/**
 * MessageModal
 * Simple modal to display a message with a single OK button
 * Props:
 *  - visible (bool)
 *  - message (string)
 *  - title (optional string)
 *  - onClose () => void (fires for "OK" & backdrop press)
 *  - buttonLabel (optional string) default 'OK'
 */
export default function MessageModal({
  visible,
  message = '',
  title = '',
  onClose,
  buttonLabel = 'OK',
}) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <div className="message-modal-backdrop" style={{ backgroundColor: colors.backdrop + 'AA' }}>
      <div className="message-modal-overlay" onClick={onClose} aria-label="Fechar mensagem" />
      <div
        className="message-modal-panel"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.text + '22',
        }}
      >
        {title ? (
          <h3 className="message-modal-title" style={{ color: colors.text }}>
            {title}
          </h3>
        ) : null}
        <p className="message-modal-message" style={{ color: colors.text }}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="message-modal-btn"
          style={{
            backgroundColor: colors.primary,
            borderColor: colors.primary + '55',
          }}
          aria-label={buttonLabel}
        >
          <span style={{ color: colors.onPrimary }}>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
