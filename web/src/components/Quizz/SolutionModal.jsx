import React, { useState } from 'react';
import {Modal} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import MathJaxRenderer from '../General/MathJaxRenderer';
import { family } from '../../constants/font';
import ApiManager from '../../services/ApiManager';
import MessageModal from '../General/MessageModal';

/**
 * SolutionModal - Quiz solution modal with MathJax mathematical notation support
 * Props:
 *  - visible (bool)
 *  - correctOption: { id, text?, html? }
 *  - explanation: string | html (optional)
 *  - quizId: number (required for reporting)
 *  - onClose: () => void    (Continuar)
 *  - onReport: () => void   (Reportar)
 */
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
        <div style={{...styles.correctPill, ...{ backgroundColor: colors.secondary + '1A'}}> 
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
      <div style={{...styles.correctPill, ...{ backgroundColor: colors.secondary + '1A'}}> 
        <span style={{...styles.correctText, ...{ color: colors.secondary }}}>{correctOption.text}</span>
      </div>
    );
  };

  const renderExplanation = () => {
    if (!explanation) return null;
    const isHtml = /<[^>]+>|\\\\|\$/.test(String(explanation));
    if (isHtml) {
      return (
        <div style={styles.explainerHtml} showsVerticalScrollIndicator={true}>
          <MathJaxRenderer 
            content={`<div style="text-align:left">${explanation}</div>`} 
            enabled={true} 
            style={{ minHeight: 80 }}
          />
        </div>
      );
    }
    return (
      <div style={styles.explainerText} contentContainerStyle={{ paddingBottom: 4 }}>
        <span style={{...styles.expText, ...{ color: colors.text }}}>{String(explanation)}</span>
      </div>
    );
  };

  const handleReport = async () => {
    if (!quizId) {
      console.warn('No quizId provided for report');
      return;
    }

    setReporting(true);
    try {
      await ApiManager.reportQuizError(quizId);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error reporting quiz:', error);
      if (onReport) onReport();
    } finally {
      setReporting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (onReport) onReport();
  };

  return (
    <>
      <Modal visible={visible && !showSuccessModal} transparent animationType="fade" onRequestClose={onClose}>
      <div style={{...styles.backdrop, ...{ backgroundColor: colors.backdrop + 'AA' }}}> 
        <button style={StyleSheet.absoluteFill} onClick={onClose}  aria-label="Fechar explicação" />

        <div style={{...styles.panel, ...{ backgroundColor: colors.card}}> 
          <span style={{...styles.title, ...{ color: colors.text }}}>Resposta correta</span>

          {renderOption()}

          {explanation ? (
            <span style={{...styles.subtitle, ...{ color: colors.text + 'CC' }}}>Explicação</span>
          ) : null}
          {renderExplanation()}

          <div style={styles.row}> 
            <button               onClick={handleReport}
              disabled={reporting}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.surface, borderColor: colors.text + '25' },
                pressed && { opacity: 0.9 },
                reporting && { opacity: 0.5 },
              ]}
              
              aria-label="Reportar questão"
            >
              {reporting ? (
                <div size="small" color={colors.text} />
              ) : (
                <span style={{...styles.btnText, ...{ color: colors.text }}}>Reportar</span>
              )}
            </button>
            <button               onClick={onClose}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: colors.secondary, borderColor: colors.secondary + '55' },
                pressed && { opacity: 0.9 },
              ]}
              
              aria-label="Continuar"
            >
              <span style={{...styles.btnText, ...{ color: colors.onSecondary }}}>Continuar</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <MessageModal
      visible={showSuccessModal}
      title="Reportado"
      message="Problema reportado com sucesso"
      onClose={handleSuccessModalClose}
    />
    </>
  );
}

const styles = {
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderWidth: 1,
  },
  title: { fontSize: 18, fontFamily: family.bold, textAlign: 'center', marginBottom: 12 },
  correctPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 50,
  },
  correctText: { 
    fontSize: 16, 
    fontFamily: family.bold,
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 22,
  },
  subtitle: { fontSize: 14, fontFamily: family.bold, marginTop: 6, marginBottom: 6 },
  explainerText: { maxHeight: 220 },
  expText: { fontSize: 15, fontFamily: family.regular, lineHeight: 22 },
  explainerHtml: { maxHeight: 220 },
  htmlBox: { minHeight: 60, maxHeight: 100, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontSize: 15, fontFamily: family.bold },
};
