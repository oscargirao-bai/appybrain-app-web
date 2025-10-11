import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
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
			<Pressable
				onPress={() => setOpen(true)}
				style={({ pressed }) => [
					styles.card,
					{ borderColor: colors.text + '22', backgroundColor: colors.text + '06' },
					pressed && { opacity: 0.85 },
					style,
				]}
				accessibilityRole="button"
				accessibilityLabel={`${translate('settings.language')}: ${current.label}.`}
			>
				<View style={styles.leftRow}>
					<Icon name="languages" size={20} color={colors.text} style={{ marginRight: 10 }} />
					<Text style={[styles.label, { color: colors.text }]}>{translate('settings.language')}</Text>
				</View>
				<View style={[styles.pill, { borderColor: colors.text + '33', backgroundColor: colors.text + '05' }]}> 
					<Text style={[styles.pillText, { color: colors.text }]} numberOfLines={1}>{current.label}</Text>
					<Icon name="chevron-down" size={16} color={colors.text + 'AA'} />
				</View>
			</Pressable>

			<Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
				<Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
				<View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.text + '22' }]}> 
					<Text style={[styles.modalTitle, { color: colors.text }]}>{modalTitle || translate('settings.language')}</Text>
					<FlatList
						data={options}
						keyExtractor={(item) => item.code}
						renderItem={({ item }) => {
							const active = item.code === currentCode;
							return (
								<Pressable
									onPress={() => handleSelect(item.code)}
									style={({ pressed }) => [
										styles.optionRow,
										{ borderColor: colors.text + '15' },
										active && { backgroundColor: colors.secondary + '22' },
										pressed && { opacity: 0.8 },
									]}
									accessibilityRole="button"
									accessibilityState={{ selected: active }}
								>
									<Text style={[styles.optionText, { color: colors.text, fontWeight: active ? '700' : '500' }]}>{item.label}</Text>
									{active && <Icon name="check" size={18} color={colors.secondary} />}
								</Pressable>
							);
						}}
						style={{ maxHeight: 260 }}
					/>
				</View>
			</Modal>
		</>
	);
}

const DEFAULT_OPTIONS = [
	{ code: 'pt', label: 'Português' },
	{ code: 'en', label: 'English' },
];

const styles = StyleSheet.create({
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
});

