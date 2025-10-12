import React, { useState, useCallback, useEffect } from 'react';
import {Modal} from 'react-native';
import SvgIcon from '../../components/General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import { family } from '../../constants/font';

/**
 * ButtonLanguage
 * Mostra linha com ícone de idioma, label "Idioma" e pill à direita com idioma atual.
 * Ao clicar abre modal simples de seleção.
 * Props:
 *  - value: código atual (ex: 'pt', 'en')
 *  - onChange: (code) => void
 *  - options: [{ code, label }]
 */
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

	// Sync when parent value changes
	useEffect(() => {
		if (value && value !== internal) setInternal(value);
	}, [value, internal]);

	useEffect(() => {
		// sync with context language if no external value provided
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
			<button 				onClick={() => setOpen(true)}
				style={({ pressed }) => [
					styles.card,
					{ borderColor: colors.text + '22', backgroundColor: colors.text + '06' },
					pressed && { opacity: 0.85 },
					style,
				]}
				
				aria-label={`${translate('settings.language')}: ${current.label}.`}
			>
				<div style={styles.leftRow}>
					<SvgIcon name="languages" size={20} color={colors.text} style={{ marginRight: 10 }} />
					<span style={{...styles.label, ...{ color: colors.text }}}>{translate('settings.language')}</span>
				</div>
				<div style={{...styles.pill, ...{ borderColor: colors.text + '33'}}> 
					<span style={{...styles.pillText, ...{ color: colors.text }}} numberOfLines={1}>{current.label}</span>
					<SvgIcon name="chevron-down" size={16} color={colors.text + 'AA'} />
				</div>
			</button>

			<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<button style={styles.backdrop} onClick={() => setOpen(false)} />
				<div style={{...styles.modalCard, ...{ backgroundColor: colors.background}}> 
					<span style={{...styles.modalTitle, ...{ color: colors.text }}}>{modalTitle || translate('settings.language')}</span>
					<div 						data={options}
						keyExtractor={(item) => item.code}
						renderItem={({ item }) => {
							const active = item.code === currentCode;
							return (
								<button 									onClick={() => handleSelect(item.code)}
									style={({ pressed }) => [
										styles.optionRow,
										{ borderColor: colors.text + '15' },
										active && { backgroundColor: colors.secondary + '22' },
										pressed && { opacity: 0.8 },
									]}
									
									accessibilityState={{ selected: active }}
								>
									<span style={{...styles.optionText, ...{ color: colors.text}}>{item.label}</span>
									{active && <SvgIcon name="check" size={18} color={colors.secondary} />}
								</button>
							);
						}}
						style={{ maxHeight: 260 }}
					/>
				</div>
			</Modal>
		</>
	);
}

const DEFAULT_OPTIONS = [
	{ code: 'pt', label: 'Português' },
	{ code: 'en', label: 'English' },
];

const styles = {
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderWidth: 1,
		borderRadius: 18,
		marginBottom: 16,
	},
	leftRow: {
		flexDirection: 'row',
		alignItems: 'center',
		flexShrink: 1,
	},
	label: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
		fontStyle: 'italic',
		letterSpacing: 0.5,
	},
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 14,
		borderWidth: 1,
		gap: 6,
	},
	pillText: {
		fontSize: 13,
		fontWeight: '700',
		fontFamily: family.bold,
		letterSpacing: 0.3,
		marginRight: 2,
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: '#000000AA',
	},
	modalCard: {
		position: 'absolute',
		left: 20,
		right: 20,
		top: '25%',
		borderWidth: 1,
		borderRadius: 20,
		padding: 18,
	},
	modalTitle: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
		marginBottom: 12,
	},
	optionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 12,
		paddingHorizontal: 4,
		borderWidth: 1,
		borderRadius: 12,
		paddingRight: 12,
		marginBottom: 8,
	},
	optionText: {
		fontSize: 14,
		fontFamily: family.medium,
		letterSpacing: 0.3,
	},
	sep: { height: 4 },
};

