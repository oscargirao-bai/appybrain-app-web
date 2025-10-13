import React from 'react';

import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

// Simple pill button (full-width) used for secondary actions in Settings (e.g. Privacy Policy, Logout)
// Props: label (string), onPress (fn), danger (bool) to color text with secondary/danger tone later if needed
export default function Button4({ label, onPress, onClick, danger, style, accessibilityLabel }) {
	const colors = useThemeColors();
	const handleClick = onClick || onPress;
	return (
			<button
			onClick={handleClick}
			style={{
				...styles.root,
				borderColor: colors.text + '25',
				backgroundColor: colors.card + '55',
				...style,
			}}
			aria-label={accessibilityLabel || label}
		>
				<div style={styles.inner}>
				<span style={{...styles.label, ...{ color: danger ? colors.error || '#ff4d50' : colors.text }}}>{label}</span>
			</div>
		</button>
	);
}

const styles = {
			root: {
				border: '1px solid',
				borderRadius: 22,
				paddingLeft: 20,
				paddingRight: 20,
				paddingTop: 14,
				paddingBottom: 14,
				marginBottom: 16,
				display: 'flex',
				width: '100%',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				cursor: 'pointer',
			},
			inner: { display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
	label: { fontSize: 15, fontWeight: '700', fontFamily: family.bold, letterSpacing: 0.2 },
};
