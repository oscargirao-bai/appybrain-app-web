import React, { useState, useEffect } from 'react';

import SvgIcon from '../../components/General/SvgIcon';
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
		<div style={{...styles.container, ...{ backgroundColor: colors.surface}}>      
			<SvgIcon name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />
			<input 				style={{...styles.input, ...{ color: colors.text }}}
				placeholder={placeholder}
				placeholderTextColor={colors.muted}
				value={text}
				onChangeText={handleChange}
				returnKeyType="search"
				aria-label="Pesquisar conteúdos"
				cursorColor={colors.primary}
				autoCapitalize="none"
			/>
			{text.length > 0 && (
				<button onClick={clear} hitSlop={10} aria-label="Limpar pesquisa">
					<SvgIcon name="x" size={18} color={colors.muted} />
				</button>
			)}
		</div>
	);
}

const styles = {
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
};

