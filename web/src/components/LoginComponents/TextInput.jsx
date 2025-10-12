import React, { useMemo, useState } from 'react';
import {TextInput as RNTextInput} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../../components/General/SvgIcon';
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
	icon, // 'email' | 'password' optional hint for label icon
	style,
	containerStyle,
	placeholderTextColor,
}) {
	const width = window.innerWidth; const height = window.innerHeight;
	const colorTokens = useThemeColors();
	const isTablet = width >= 768;
	const [hidden, setHidden] = useState(!!secureTextEntry);
	const styles = useMemo(() => createStyles(colorTokens), [colorTokens]);

	const LabelIconName = icon === 'password' ? 'lock' : icon === 'email' ? 'mail' : null;
	const placeholderColor = placeholderTextColor ?? colorTokens.secondary;

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
					<RNTextInput
						value={value}
						onChangeText={onChangeText}
						placeholder={placeholder}
						placeholderTextColor={placeholderColor}
						secureTextEntry={hidden}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						autoCorrect={autoCorrect}
						style={{...styles.inputField, ...// reserve space for the trailing icon so text doesn't overlap
							{ paddingRight: 48 }}}
					/>
					<button 						onClick={() => setHidden(!hidden)}
						
						aria-label={hidden ? 'Show password' : 'Hide password'}
						style={styles.trailingIcon}
					>
						<SvgIcon name={hidden ? 'eye-off' : 'eye'} size={20} color={colorTokens.secondary} />
					</button>
				</div>
			) : (
				<div style={styles.inputBase}>
					<RNTextInput
						value={value}
						onChangeText={onChangeText}
						placeholder={placeholder}
						placeholderTextColor={placeholderColor}
						secureTextEntry={false}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						autoCorrect={autoCorrect}
						style={{...styles.inputField, ...isTablet && styles.inputFieldLg}}
					/>
				</div>
			)}
		</div>
	);
}

const createStyles = (colorTokens) =>
	StyleSheet.create({
		container: {
			width: '100%',
			maxWidth: 420,
			marginBottom: 16,
		},
		labelRow: {
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
			borderWidth: StyleSheet.hairlineWidth,
			borderColor: colorTokens.secondary,
			borderRadius: 12,
			flexDirection: 'row',
			alignItems: 'center',
			position: 'relative',
		},
		inputField: {
			flex: 1,
			...normal,
			color: colorTokens.text,
			paddingHorizontal: 14,
			paddingVertical: 12,
		},
		inputFieldLg: {
			paddingHorizontal: 16,
			paddingVertical: 14,
		},
		trailingIcon: {
			position: 'absolute',
			right: 8,
			top: 0,
			bottom: 0,
			paddingHorizontal: 12,
			justifyContent: 'center',
			alignItems: 'center',
		},
	};
