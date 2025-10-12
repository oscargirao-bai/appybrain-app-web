import React from 'react';
// Modal converted to div
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

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
	return (
		<Modal
			style={{display: visible ? "flex" : "none"}}
			animationType="slide"
			onRequestClose={onClose}
			transparent
		>
			<div style={styles.backdrop}> 
				<div style={{...styles.sheet, ...{ backgroundColor: colors.card || colors.background}}> 
					<div style={styles.header}> 
						<span style={{...styles.title, ...{ color: colors.text }}}>Política de Privacidade</span>
					</div>
					<div showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
						<span style={{...styles.body, ...{ color: colors.text }}}>{PRIVACY_TEXT}</span>
						<button 							style={{styles.closeBtn, { borderColor: colors.text + '25', backgroundColor: colors.card + '66' }, /* pressed */ { opacity: 0.85 }}}
							onClick={onClose}
							
							aria-label="Fechar política de privacidade"
						>
							<span style={{...styles.closeLabel, ...{ color: colors.text }}}>Fechar</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

const styles = {
	backdrop: { flex: 1, justifyContent: 'flex-end' },
	sheet: {
		maxHeight: '100%',
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingHorizontal: 20,
		paddingTop: 18,
		paddingBottom: 24,
		borderWidth: 1,
	},
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
	title: { fontSize: 18, fontWeight: '700', fontFamily: family.bold },
	scrollContent: { paddingBottom: 32 },
	body: { fontSize: 14, lineHeight: 20, fontWeight: '500', fontFamily: family.medium, whiteSpace: 'pre-wrap' },
	closeBtn: { marginTop: 28, borderWidth: 1, borderRadius: 18, paddingVertical: 12, alignItems: 'center' },
	closeLabel: { fontSize: 15, fontWeight: '700', fontFamily: family.bold },
};
