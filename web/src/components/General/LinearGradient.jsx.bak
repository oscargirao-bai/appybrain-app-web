import React from 'react';

/**
 * LinearGradient - Web implementation using CSS gradients
 * Props:
 *  - colors: array of color strings
 *  - start: { x, y } - start point (0-1)
 *  - end: { x, y } - end point (0-1)
 *  - style: additional styles
 *  - children: child elements
 */
export default function LinearGradient({ colors = [], start = { x: 0, y: 0 }, end = { x: 0, y: 1 }, style, children, ...props }) {
	// Convert start/end to CSS gradient direction
	const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90;
	
	// Build gradient string
	const gradientColors = colors.join(', ');
	const backgroundImage = `linear-gradient(${angle}deg, ${gradientColors})`;

	return (
		<div
			{...props}
			style={{
				...style,
				backgroundImage,
			}}
		>
			{children}
		</div>
	);
}
