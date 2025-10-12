import React, { useState, useEffect } from 'react';
import SvgIcon from '../../components/General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

export default function SearchBox({ value, onChange, placeholder = 'Pesquisar...' }) {
	const colors = useThemeColors();
	const [text, setText] = useState(value || '');

	useEffect(() => {
		if (value !== undefined && value !== text) setText(value);
	}, [value]);

	const handleChange = (e) => {
		const t = e.target.value;
		setText(t);
		onChange && onChange(t);
	};

	const clear = () => {
		setText('');
		onChange && onChange('');
	};

	const containerStyle = {
		...styles.container,
		backgroundColor: colors.surface,
		borderColor: colors.text + '20'
	};

	const inputStyle = {
		...styles.input,
		color: colors.text
	};

	return (
		<div style={containerStyle}>
			<SvgIcon name="search" size={18} color={colors.muted} style={{ marginRight: 8 }} />
			<input
				style={inputStyle}
				placeholder={placeholder}
				value={text}
				onChange={handleChange}
				aria-label="Pesquisar conteúdos"
			/>
			{text.length > 0 && (
				<button onClick={clear} style={styles.clearBtn} aria-label="Limpar pesquisa">
					<SvgIcon name="x" size={18} color={colors.muted} />
				</button>
			)}
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderStyle: 'solid',
		borderRadius: 16,
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 8,
		paddingBottom: 8,
		marginTop: 16,
		marginBottom: 16,
	},
	input: {
		flex: 1,
		fontSize: 16,
		fontFamily: family.medium,
		border: 'none',
		outline: 'none',
		background: 'transparent',
		padding: 0,
	},
	clearBtn: {
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 4,
	},
};
