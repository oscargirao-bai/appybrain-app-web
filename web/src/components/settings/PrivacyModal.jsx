import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import './PrivacyModal.css';

const PRIVACY_TEXT = `Esta Política de Privacidade explica como a AppyBrain recolhe, utiliza e protege as suas informações.

1. Informações que Recolhemos
Podemos recolher detalhes básicos de perfil que fornece na app. Não vendemos dados pessoais.

2. Como Utilizamos as Informações
Utilizamos as suas informações para fornecer e melhorar o serviço, personalizar conteúdo e garantir a segurança da conta.

3. Segurança dos Dados
Tomamos medidas razoáveis para proteger os seus dados. Nenhum método de transmissão é 100% seguro.

4. Crianças
A nossa app é desenhada para estudantes. Incentivamos os encarregados de educação a supervisionar a utilização.

5. Alterações a Esta Política
Podemos atualizar esta política ocasionalmente. A continuação do uso após alterações significa que aceita os termos atualizados.

Contacto
Se tiver questões sobre esta política, contacte o suporte em support@example.com.`;

export default function PrivacyModal({ visible, onClose }) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <div className="privacy-modal-backdrop">
      <div
        className="privacy-modal-sheet"
        style={{
          backgroundColor: colors.card || colors.background,
          borderColor: colors.text + '20',
        }}
      >
        <div className="privacy-modal-header">
          <h3 className="privacy-modal-title" style={{ color: colors.text }}>
            Política de Privacidade
          </h3>
        </div>
        <div className="privacy-modal-scroll-content">
          <p className="privacy-modal-body" style={{ color: colors.text }}>
            {PRIVACY_TEXT}
          </p>
          <button
            className="privacy-modal-close-btn"
            style={{
              borderColor: colors.text + '25',
              backgroundColor: colors.card + '66',
            }}
            onClick={onClose}
            aria-label="Fechar política de privacidade"
          >
            <span className="privacy-modal-close-label" style={{ color: colors.text }}>
              Fechar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
