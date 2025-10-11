import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

// Basic search box (placeholder for futura lógica de filtro)
// Mantém estado interno; expõe opcionalmente via onChange.
export default function SearchBox({ value, onChange, placeholder = 'Pesquisar...' }) {
	const colors = useThemeColors();
	const [text, setText] = useState(value || '');

	useEffect(() => {
		if (value !== undefined && value !== text) setText(value);
	}, [value]);

	const handleChange = (t) => {
		setText(t);
		onChange && onChange(t);
	};

	const clear = () => handleChange('');

	return (
		<View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>      
			<Icon name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />
			<TextInput
				style={[styles.input, { color: colors.text }]}
				placeholder={placeholder}
				placeholderTextColor={colors.muted}
				value={text}
				onChangeText={handleChange}
				returnKeyType="search"
				accessibilityLabel="Pesquisar conteúdos"
				cursorColor={colors.primary}
				autoCapitalize="none"
			/>
			{text.length > 0 && (
				<Pressable onPress={clear} hitSlop={10} accessibilityLabel="Limpar pesquisa">
					<Icon name="x" size={18} color={colors.muted} />
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: Platform.select({ ios: 10, default: 8 }),
		marginVertical: 16,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: family.medium,
		paddingVertical: 0, // evita saltos no Android
	},
});

