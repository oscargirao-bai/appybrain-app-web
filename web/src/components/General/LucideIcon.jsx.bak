import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Wrapper for lucide-react icons to match mobile's @react-native-vector-icons/lucide API
 * Converts kebab-case icon names to PascalCase and renders from lucide-react
 * 
 * Usage: <LucideIcon name="arrow-left" size={24} color="#000" />
 */
export default function LucideIcon({ name, size = 24, color = '#000', style }) {
	if (!name) return null;

	// Convert kebab-case to PascalCase (arrow-left -> ArrowLeft)
	const toPascalCase = (str) => {
		return str
			.split('-')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	};

	const iconName = toPascalCase(name);
	const IconComponent = LucideIcons[iconName];

	if (!IconComponent) {
		console.warn(`LucideIcon: icon "${name}" (${iconName}) not found in lucide-react`);
		return null;
	}

	return (
		<div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
			<IconComponent size={size} color={color} strokeWidth={2} />
		</div>
	);
}
