import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import './ButtonLanguage.css';

const DEFAULT_OPTIONS = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
];

/**
 * ButtonLanguage
 * Mostra linha com ícone de idioma, label "Idioma" e pill à direita com idioma atual
 * Ao clicar abre modal simples de seleção
 */
export default function ButtonLanguage({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  style,
  modalTitle,
}) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(value || 'pt');

  useEffect(() => {
    if (value && value !== internal) setInternal(value);
  }, [value, internal]);

  const currentCode = value || internal;
  const current = options.find((o) => o.code === currentCode) || options[0];

  const handleSelect = (code) => {
    setOpen(false);
    if (onChange) {
      if (code !== currentCode) onChange(code);
    } else {
      setInternal(code);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="button-language-card"
        style={{
          borderColor: colors.text + '22',
          backgroundColor: colors.text + '06',
          ...style,
        }}
        aria-label={`${t('settings.language')}: ${current.label}`}
      >
        <div className="button-language-left-row">
          <i data-lucide="languages" style={{ color: colors.text }} />
          <span className="button-language-label" style={{ color: colors.text }}>
            {t('settings.language')}
          </span>
        </div>
        <div
          className="button-language-pill"
          style={{
            borderColor: colors.text + '33',
            backgroundColor: colors.text + '05',
          }}
        >
          <span className="button-language-pill-text" style={{ color: colors.text }}>
            {current.label}
          </span>
          <i data-lucide="chevron-down" style={{ color: colors.text + 'AA' }} />
        </div>
      </button>

      {open && (
        <div className="button-language-modal">
          <div className="button-language-backdrop" onClick={() => setOpen(false)} />
          <div
            className="button-language-modal-card"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.text + '22',
            }}
          >
            <h3 className="button-language-modal-title" style={{ color: colors.text }}>
              {modalTitle || t('settings.language')}
            </h3>
            <div className="button-language-options">
              {options.map((item) => {
                const active = item.code === currentCode;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelect(item.code)}
                    className={`button-language-option ${active ? 'active' : ''}`}
                    style={{
                      borderColor: colors.text + '15',
                      backgroundColor: active ? colors.secondary + '22' : 'transparent',
                    }}
                    aria-pressed={active}
                  >
                    <span
                      className="button-language-option-text"
                      style={{
                        color: colors.text,
                        fontWeight: active ? '700' : '500',
                      }}
                    >
                      {item.label}
                    </span>
                    {active && <i data-lucide="check" style={{ color: colors.secondary }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
