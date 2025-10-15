import React from 'react';
// Modal converted to div
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import { family } from '../../constants/font.jsx';

export default function PrivacyModal({ visible, onClose }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	
	if (!visible) {
		return null;
	}
	
	return (
		<div style={styles.modalContainer}>
			<div style={styles.backdrop}>
				<div style={{ ...styles.sheet, backgroundColor: colors.card || colors.background, borderColor: colors.text + '20' }}>
					<div style={styles.header}>
						<span style={{ ...styles.title, color: colors.text }}>{translate('privacy.title')}</span>
					</div>
					<div style={styles.scrollArea}>
						<span style={{ ...styles.body, color: colors.text }}>{translate('privacy.body')}</span>
					</div>
					<button
						style={{ ...styles.closeBtn, borderColor: colors.text + '25', backgroundColor: (colors.card || colors.background) + '66' }}
						onClick={onClose}
						aria-label={`${translate('common.close')} ${translate('privacy.title')}`}
					>
						<span style={{ ...styles.closeLabel, color: colors.text }}>{translate('common.close')}</span>
					</button>
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
		zIndex: 1000,
		display: 'flex',
	},
	backdrop: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	sheet: {
		width: '100%',
		maxWidth: 680,
		height: '90vh',
		display: 'flex',
		flexDirection: 'column',
		borderRadius: 16,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 18,
		paddingBottom: 18,
		borderWidth: '1px',
		borderStyle: 'solid',
		boxSizing: 'border-box',
	},
	header: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
	title: { fontSize: 18, fontWeight: '700', fontFamily: family.bold },
	scrollArea: {
		flex: 1,
		overflowY: 'auto',
		paddingBottom: 12,
	},
	body: { fontSize: 14, lineHeight: 1.6, fontWeight: '500', fontFamily: family.medium, whiteSpace: 'pre-wrap' },
	closeBtn: {
		marginTop: 12,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 18,
		paddingTop: 12,
		paddingBottom: 12,
		alignItems: 'center',
		display: 'flex',
		justifyContent: 'center',
		background: 'transparent',
		cursor: 'pointer',
	},
	closeLabel: { fontSize: 15, fontWeight: '700', fontFamily: family.bold },
};
