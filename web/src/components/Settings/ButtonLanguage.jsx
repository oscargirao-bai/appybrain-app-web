import React, { useState, useCallback, useEffect } from 'react';
// Modal converted to div
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import { family } from '../../constants/font.jsx';

const DEFAULT_OPTIONS = [
	{ code: 'pt', label: 'Português' },
	{ code: 'en', label: 'English' },
];

export default function ButtonLanguage({
	value,
	onChange,
	options = DEFAULT_OPTIONS,
	style,
	modalTitle,
}) {
	const colors = useThemeColors();
	const { currentLanguage, changeLanguage, translate } = useTranslate();
	const [open, setOpen] = useState(false);
	const [internal, setInternal] = useState(value || currentLanguage || options[0].code);

	useEffect(() => {
		if (value && value !== internal) setInternal(value);
	}, [value, internal]);

	useEffect(() => {
		if (!value && currentLanguage && currentLanguage !== internal) {
			setInternal(currentLanguage);
		}
	}, [currentLanguage, value, internal]);

	const currentCode = value || internal;
	const current = options.find(o => o.code === currentCode) || options[0];

	const handleSelect = useCallback((code) => {
		setOpen(false);
		if (onChange) {
			if (code !== currentCode) onChange(code);
		} else {
			setInternal(code);
			if (code !== currentLanguage) changeLanguage(code);
		}
	}, [onChange, currentCode, changeLanguage, currentLanguage]);

	return (
		<>
			<button
				onClick={() => setOpen(true)}
				style={{
					...styles.card,
					borderColor: colors.text + '22',
					backgroundColor: colors.text + '06',
					...style,
				}}
				aria-label={`${translate('settings.language')}: ${current.label}.`}
			>
				<div style={styles.leftRow}>
					<LucideIcon name="languages" size={20} color={colors.text} style={{ marginRight: 10 }} />
					<span style={{...styles.label, color: colors.text}}>{translate('settings.language')}</span>
				</div>
				<div style={{...styles.pill, borderColor: colors.text + '33', backgroundColor: colors.text + '05'}}>
					<span style={{...styles.pillText, color: colors.text}}>{current.label}</span>
					<LucideIcon name="chevron-down" size={16} color={colors.text + 'AA'} />
				</div>
			</button>

			<div style={{display: open ? 'flex' : 'none', ...styles.backdrop}} onClick={() => setOpen(false)}>
				<div style={{...styles.modalCard, backgroundColor: colors.background, borderColor: colors.text + '22'}} onClick={(e) => e.stopPropagation()}>
					<span style={{...styles.modalTitle, color: colors.text}}>{modalTitle || translate('settings.language')}</span>
					{options.map((item) => {
						const active = item.code === currentCode;
						return (
							<button
								key={item.code}
								onClick={() => handleSelect(item.code)}
								style={{
									...styles.optionRow,
									borderColor: colors.text + '15',
									...(active ? { backgroundColor: colors.secondary + '22' } : {}),
								}}
								aria-label={item.label}
								aria-selected={active}
							>
								<span style={{...styles.optionText, color: colors.text, fontWeight: active ? '700' : '500'}}>{item.label}</span>
								{active && <LucideIcon name="check" size={18} color={colors.secondary} />}
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}

const styles = {
	card: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 14,
		paddingBottom: 14,
		border: '1px solid',
		borderRadius: 24,
		marginBottom: 16,
		background: 'transparent',
		cursor: 'pointer',
	},
	leftRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	label: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
		fontStyle: 'italic',
		letterSpacing: 0.5,
	},
	pill: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 6,
		paddingBottom: 6,
		border: '1px solid',
		borderRadius: 16,
	},
	pillText: {
		fontSize: 13,
		fontWeight: '600',
		fontFamily: family.semibold,
		marginRight: 6,
	},
	backdrop: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.5)',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000,
	},
	modalCard: {
		width: '90%',
		maxWidth: 400,
		border: '1px solid',
		borderRadius: 24,
		padding: 20,
		maxHeight: '80vh',
		overflowY: 'auto',
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		fontFamily: family.bold,
		marginBottom: 16,
		textAlign: 'center',
	},
	optionRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 14,
		paddingBottom: 14,
		border: 'none',
		borderBottom: '1px solid',
		background: 'transparent',
		cursor: 'pointer',
	},
	optionText: {
		fontSize: 15,
		fontFamily: family.medium,
	},
};
