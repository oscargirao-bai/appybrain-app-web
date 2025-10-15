import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function ChangeNameModal({ visible, currentName = '', onCancel, onConfirm }) {
	const colors = useThemeColors();
	const [newName, setNewName] = useState(currentName);

	useEffect(() => {
		if (visible) {
			setNewName(currentName);
		}
	}, [visible, currentName]);

	const isValidName = newName && newName.trim().length >= 2;

	if (!visible) {
		return null;
	}

	return (
		<div style={styles.modalContainer}>
			<div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'AA'}}>
				<button style={styles.backdropHit} onClick={onCancel} aria-label="Fechar modal" />
				<div style={{...styles.panel, backgroundColor: colors.card}}>
					<span style={{...styles.title, color: colors.text}}>Mudar Nome</span>

					<input
						style={{...styles.input, backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}}
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						placeholder="Novo nome"
						maxLength={50}
						autoFocus
					/>

					<div style={styles.row}>
						<button
							style={{...styles.btn, backgroundColor: colors.surface, borderColor: colors.text + '25'}}
							onClick={onCancel}
							aria-label="Cancelar"
						>
							<span style={{...styles.btnText, color: colors.text}}>Cancelar</span>
						</button>

						<button
							style={{
								...styles.btn,
								backgroundColor: isValidName ? colors.secondary : colors.surface,
								borderColor: isValidName ? colors.secondary : colors.text + '25',
								opacity: isValidName ? 1 : 0.5,
								cursor: isValidName ? 'pointer' : 'not-allowed',
							}}
							onClick={() => isValidName && onConfirm && onConfirm(newName.trim())}
							disabled={!isValidName}
							aria-label="Confirmar"
						>
							<span style={{...styles.btnText, color: isValidName ? '#FFFFFF' : colors.text}}>Confirmar</span>
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
		zIndex: 1000,
		display: 'flex',
	},
	backdrop: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		position: 'relative',
	},
	backdropHit: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
	},
	panel: {
		width: '90%',
		maxWidth: 380,
		borderRadius: 18,
		padding: 20,
		boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
		position: 'relative',
		zIndex: 1,
	},
	title: {
		fontSize: 20,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
		textAlign: 'center',
		display: 'block',
		marginBottom: 16,
	},
	input: {
		width: '100%',
		paddingTop: 12,
		paddingBottom: 12,
		paddingLeft: 14,
		paddingRight: 14,
		borderRadius: 12,
		fontSize: 16,
		fontFamily: family.medium,
		borderWidth: '1px',
		borderStyle: 'solid',
		marginBottom: 20,
		outline: 'none',
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		gap: 10,
	},
	btn: {
		flex: 1,
		paddingTop: 12,
		paddingBottom: 12,
		borderRadius: 12,
		borderWidth: '1px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnText: {
		fontSize: 15,
		fontFamily: family.bold,
		letterSpacing: '0.3px',
	},
};
