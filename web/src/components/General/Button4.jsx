import React from 'react';

import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

// Simple pill button (full-width) used for secondary actions in Settings (e.g. Privacy Policy, Logout)
// Props: label (string), onPress (fn), danger (bool) to color text with secondary/danger tone later if needed
export default function Button4({ label, onPress, danger, style, accessibilityLabel }) {
	const colors = useThemeColors();
	return (
		<button 			onClick={onPress}
			style={({ pressed }) => [
				styles.root,
				{ borderColor: colors.text + '25', backgroundColor: colors.card + '55' },
				pressed && { opacity: 0.85 },
				style,
			]}
			
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
		borderWidth: 1,
		borderRadius: 22,
		paddingHorizontal: 20,
		paddingVertical: 14,
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
	label: { fontSize: 15, fontWeight: '700', fontFamily: family.bold, letterSpacing: 0.2 },
};
