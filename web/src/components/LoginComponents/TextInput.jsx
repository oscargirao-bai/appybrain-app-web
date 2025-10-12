import React, { useMemo, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../../components/General/SvgIcon.jsx';
import { small, normal } from '../../constants/font';

export default function TextInput({
	value,
	onChangeText,
	placeholder,
	secureTextEntry = false,
	keyboardType = 'default',
	autoCapitalize = 'none',
	autoCorrect = false,
	label,
	icon,
	style,
	containerStyle,
	placeholderTextColor,
}) {
	const width = window.innerWidth;
	const colorTokens = useThemeColors();
	const isTablet = width >= 768;
	const [hidden, setHidden] = useState(!!secureTextEntry);
	const styles = useMemo(() => createStyles(colorTokens), [colorTokens]);

	const LabelIconName = icon === 'password' ? 'lock' : icon === 'email' ? 'mail' : null;
	const placeholderColor = placeholderTextColor ?? colorTokens.secondary;

	const inputType = secureTextEntry && hidden ? 'password' : keyboardType === 'email' ? 'email' : 'text';

	return (
		<div style={{...styles.container, ...containerStyle}}>
			{(label || LabelIconName) && (
				<div style={styles.labelRow}>
					{LabelIconName ? <SvgIcon name={LabelIconName} size={16} color={colorTokens.secondary} /> : null}
					{label ? <span style={styles.labelText}>{label}</span> : null}
				</div>
			)}
			{secureTextEntry ? (
				<div style={styles.inputBase}>
					<input
						type={inputType}
						value={value}
						onChange={(e) => onChangeText?.(e.target.value)}
						placeholder={placeholder}
						autoCapitalize={autoCapitalize}
						autoCorrect={autoCorrect ? 'on' : 'off'}
						style={{
							...styles.inputField,
							...(isTablet ? styles.inputFieldLg : {}),
							paddingRight: 48,
							color: colorTokens.text,
						}}
					/>
					<button
						type="button"
						onClick={() => setHidden(!hidden)}
						aria-label={hidden ? 'Show password' : 'Hide password'}
						style={styles.trailingIcon}
					>
						<SvgIcon name={hidden ? 'eye-off' : 'eye'} size={20} color={colorTokens.secondary} />
					</button>
				</div>
			) : (
				<div style={styles.inputBase}>
					<input
						type={inputType}
						value={value}
						onChange={(e) => onChangeText?.(e.target.value)}
						placeholder={placeholder}
						autoCapitalize={autoCapitalize}
						autoCorrect={autoCorrect ? 'on' : 'off'}
						style={{
							...styles.inputField,
							...(isTablet ? styles.inputFieldLg : {}),
							color: colorTokens.text,
						}}
					/>
				</div>
			)}
		</div>
	);
}

const createStyles = (colorTokens) => ({
	container: {
		width: '100%',
		maxWidth: 420,
		marginBottom: 16,
	},
	labelRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	labelText: {
		...small,
		color: colorTokens.secondary,
		marginLeft: 6,
	},
	inputBase: {
		width: '100%',
		backgroundColor: colorTokens.background,
		borderWidth: 1,
		borderStyle: 'solid',
		borderColor: colorTokens.secondary,
		borderRadius: 12,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
	},
	inputField: {
		flex: 1,
		...normal,
		border: 'none',
		outline: 'none',
		backgroundColor: 'transparent',
		paddingLeft: 14,
		paddingRight: 14,
		paddingTop: 12,
		paddingBottom: 12,
	},
	inputFieldLg: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 14,
		paddingBottom: 14,
	},
	trailingIcon: {
		position: 'absolute',
		right: 8,
		top: 0,
		bottom: 0,
		paddingLeft: 12,
		paddingRight: 12,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
	},
});
