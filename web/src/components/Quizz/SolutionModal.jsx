import React, { useState } from 'react';
import { useTheme, useThemeColors } from '../../services/Theme.jsx';
import MathJaxRenderer from '../General/MathJaxRenderer.jsx';
import { family } from '../../constants/font.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import MessageModal from '../General/MessageModal.jsx';
import { useTranslate } from '../../services/Translate.jsx';

export default function SolutionModal({
  visible,
  correctOption,
  explanation,
  quizId,
  onClose,
  onReport,
}) {
  const { resolvedTheme } = useTheme();
  const colors = useThemeColors();
  const { translate: t } = useTranslate();
  // option labels shown to the user (these exact strings will be sent as the payload)
  const OPTION_QUESTION = t('solution.options.question');
  const OPTION_NO_CORRECT = t('solution.options.noCorrect');
  const OPTION_ANSWER = t('solution.options.answer');
  const OPTION_EXPLANATION = t('solution.options.explanation');
  const [reporting, setReporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedErrors, setSelectedErrors] = useState([]);
  const [freeText, setFreeText] = useState('');

  const renderOption = () => {
    if (!correctOption) return null;
    if (correctOption.html) {
      return (
        <div style={{...styles.correctPill, backgroundColor: colors.secondary + '1A'}}> 
          <MathJaxRenderer 
            content={correctOption.html} 
            enabled={true} 
            compact={true} 
            inlineDisplay={true}
            textAlign="center"
            style={{ minHeight: 50, width: '100%', flexShrink: 0 }}
          />
        </div>
      );
    }
    return (
      <div style={{...styles.correctPill, backgroundColor: colors.secondary + '1A'}}> 
        <span style={{...styles.correctText, color: colors.secondary}}>
          {correctOption.text}
        </span>
      </div>
    );
  };

  const renderExplanation = () => {
    if (!explanation) return null;
    const isHtml = /<[^>]+>|\\\\|\$/.test(String(explanation));
    if (isHtml) {
      return (
        <div style={{...styles.explainerHtml, overflowY: 'auto'}}>
          <MathJaxRenderer 
            content={`<div style="text-align:left">${explanation}</div>`} 
            enabled={true} 
            compact={false} 
            baseFontSize={14} 
            style={{ width: '100%' }}
          />
        </div>
      );
    }
    return (
      <div style={styles.explainer}>
        <span style={{...styles.explainerText, color: colors.text}}>
          {explanation}
        </span>
      </div>
    );
  };

  const toggleOption = (label) => {
    setSelectedErrors((prev) => {
      if (prev.includes(label)) return prev.filter((p) => p !== label);
      return [...prev, label];
    });
  };

  const handleReport = async () => {
    // If form not shown yet, open it
    if (!showReportForm) {
      setShowReportForm(true);
      return;
    }

    // Submit selected errors - deve ter pelo menos uma opção selecionada OU texto livre
    if (!quizId || reporting) return;
    if (selectedErrors.length === 0 && !freeText.trim()) return;
    
    setReporting(true);
    try {
      // Construir mensagem: opções selecionadas + texto livre (se houver)
      const errorParts = [...selectedErrors];
      if (freeText.trim()) {
        errorParts.push(freeText.trim());
      }
      
      const payload = { quizId, error: errorParts.join('; ') };
      // send JSON body to api/app/error_report
      const resp = await ApiManager.makeAuthenticatedJSONRequest('api/app/error_report', {
        method: 'POST',
        body: payload,
      });
      // consider success when resp.success === true or resp is truthy
      setShowSuccessModal(true);
      onReport && onReport();
    } catch (error) {
      console.error('Report error:', error);
      alert('Erro ao reportar. Por favor tente novamente.');
    } finally {
      setReporting(false);
      setShowReportForm(false);
      setSelectedErrors([]);
      setFreeText('');
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose && onClose();
  };

  if (!visible || showSuccessModal) {
    return showSuccessModal ? (
      <MessageModal
        visible={showSuccessModal}
        title="Obrigado!"
        message="O teu reporte foi enviado com sucesso."
        onClose={handleSuccessModalClose}
      />
    ) : null;
  }
  return (
    <div style={styles.modalContainer}>
      <div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'CC'}}>
        <button 
          style={styles.backdropButton} 
          onClick={onClose}  
          aria-label="Fechar explicação" 
        />
        
        <div style={{...styles.panel, backgroundColor: colors.card}}>
          <div style={{...styles.header, borderBottomColor: colors.text + '22'}}>
            <span style={{...styles.headerTitle, color: colors.text}}>
              {showReportForm ? t('solution.reportTitle') : t('solution.title')}
            </span>
          </div>

          {!showReportForm ? (
            <div style={styles.body}>
              <span style={{...styles.label, color: colors.text}}>
                {t('solution.correctAnswer')}:
              </span>
              {renderOption()}
              {renderExplanation()}
            </div>
          ) : (
            <div style={{ ...styles.body, gap: 12 }}>
              <span style={{...styles.label, color: colors.text}}>
                {t('solution.reportQuestion')}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" checked={selectedErrors.includes(OPTION_QUESTION)} onChange={() => toggleOption(OPTION_QUESTION)} />
                  <span style={{ marginLeft: 8, color: colors.text }}>{OPTION_QUESTION}</span>
                </label>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" checked={selectedErrors.includes(OPTION_ANSWER)} onChange={() => toggleOption(OPTION_ANSWER)} />
                  <span style={{ marginLeft: 8, color: colors.text }}>{OPTION_ANSWER}</span>
                </label>
                {explanation ? (
                  <label style={styles.checkboxRow}>
                    <input type="checkbox" checked={selectedErrors.includes(OPTION_EXPLANATION)} onChange={() => toggleOption(OPTION_EXPLANATION)} />
                    <span style={{ marginLeft: 8, color: colors.text }}>{OPTION_EXPLANATION}</span>
                  </label>
                ) : null}
              </div>

              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={t('solution.freeTextPlaceholder')}
                rows={4}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surface,
                  color: colors.text,
                  fontFamily: family.regular,
                  fontSize: 14,
                  resize: 'vertical',
                  marginTop: 8,
                }}
              />
            </div>
          )}

          <div style={styles.footer}>
            <button
              onClick={() => {
                if (showReportForm) {
                  setShowReportForm(false);
                  setSelectedErrors([]);
                  setFreeText('');
                } else {
                  setShowReportForm(true);
                }
              }}
              style={{
                ...styles.leftBtn,
                borderColor: colors.border,
                background: resolvedTheme === 'dark' ? colors.surface : colors.card
              }}
            >
              <span style={{...styles.leftBtnText, color: colors.text}}>
                {showReportForm ? t('solution.cancel') : t('solution.report')}
              </span>
            </button>

            <button
              onClick={() => {
                if (!showReportForm) {
                  onClose && onClose();
                } else {
                  handleReport();
                }
              }}
              disabled={reporting || (showReportForm && selectedErrors.length === 0 && !freeText.trim())}
              style={{
                ...styles.rightBtn,
                backgroundColor: (showReportForm && selectedErrors.length === 0 && !freeText.trim())
                  ? (resolvedTheme === 'dark' ? '#3a3f47' : '#cccccc')
                  : colors.secondary,
                cursor: (showReportForm && selectedErrors.length === 0 && !freeText.trim()) ? 'not-allowed' : 'pointer'
              }}
            >
              <span style={{...styles.rightBtnText, color: colors.onSecondary}}>
                {reporting
                  ? t('solution.reporting')
                  : (showReportForm ? t('solution.submit') : t('solution.continue'))}
              </span>
            </button>
          </div>
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
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdropButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'transparent',
    border: 'none',
    cursor: 'default',
  },
  panel: {
    position: 'relative',
    width: '100%',
    maxWidth: 500,
    maxHeight: '90vh',
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: family.bold,
    fontWeight: '800',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20,
    overflowY: 'auto',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontFamily: family.bold,
    fontWeight: '700',
    marginBottom: 8,
  },
  correctPill: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctText: {
    fontSize: 16,
    fontFamily: family.bold,
    fontWeight: '700',
  },
  explainer: {
    paddingTop: 12,
  },
  explainerHtml: {
    maxHeight: 300,
    paddingTop: 12,
  },
  explainerText: {
    fontSize: 14,
    fontFamily: family.regular,
    lineHeight: 1.5,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  leftBtn: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    borderWidth: '2px',
    borderStyle: 'solid',
    background: 'transparent',
    cursor: 'pointer',
  },
  leftBtnText: {
    fontSize: 14,
    fontFamily: family.bold,
    fontWeight: '700',
  },
  rightBtn: {
    flex: 2,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
  },
  rightBtnText: {
    fontSize: 16,
    fontFamily: family.bold,
    fontWeight: '800',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
};
