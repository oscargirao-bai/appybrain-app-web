import React, { useState } from 'react';
import { useThemeColors } from '../../services/Theme';
import MathJaxRenderer from '../General/MathJaxRenderer';
import { family } from '../../constants/font';
import ApiManager from '../../services/ApiManager';
import MessageModal from '../General/MessageModal';

export default function SolutionModal({
  visible,
  correctOption,
  explanation,
  quizId,
  onClose,
  onReport,
}) {
  const colors = useThemeColors();
  const [reporting, setReporting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handleReport = async () => {
    if (!quizId || reporting) return;
    setReporting(true);
    try {
      await ApiManager.reportQuiz({ quizId });
      setShowSuccessModal(true);
      onReport && onReport();
    } catch (error) {
      console.error('Report error:', error);
      alert('Erro ao reportar. Por favor tente novamente.');
    } finally {
      setReporting(false);
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
              Explicação
            </span>
          </div>

          <div style={styles.body}>
            <span style={{...styles.label, color: colors.text}}>
              Resposta correta:
            </span>
            {renderOption()}
            {renderExplanation()}
          </div>

          <div style={styles.footer}>
            <button
              onClick={handleReport}
              disabled={reporting}
              style={{
                ...styles.reportBtn,
                borderColor: colors.text + '33',
                opacity: reporting ? 0.6 : 1,
              }}
            >
              <span style={{...styles.reportBtnText, color: colors.text}}>
                {reporting ? 'A reportar...' : 'Reportar erro'}
              </span>
            </button>

            <button
              onClick={onClose}
              style={{
                ...styles.continueBtn,
                backgroundColor: colors.primary,
              }}
            >
              <span style={styles.continueBtnText}>
                Continuar
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
  reportBtn: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    borderWidth: '2px',
    borderStyle: 'solid',
    background: 'transparent',
    cursor: 'pointer',
  },
  reportBtnText: {
    fontSize: 14,
    fontFamily: family.bold,
    fontWeight: '700',
  },
  continueBtn: {
    flex: 2,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: family.bold,
    fontWeight: '800',
    color: '#fff',
  },
};
