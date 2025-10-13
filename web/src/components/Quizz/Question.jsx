import React, { useState } from 'react';

import { useThemeColors } from '../../services/Theme.jsx';
import MathJaxRenderer from '../General/MathJaxRenderer.jsx';

/**
 * Question card styled like a chalkboard frame with a light border.
 * Props:
 *  - html: string (question body; supports MathJax via MathJaxRenderer)
 */
export default function Question({ html, height, style }) {
	const colors = useThemeColors();
	const [contentHeight, setContentHeight] = useState(height || 0);

	return (
		<div style={{...styles.wrapper, borderColor: colors.text + 'CC', ...style}}>
			<div style={{...styles.inner, backgroundColor: 'transparent', flex: 1}}> 
				<MathJaxRenderer
					content={html}
					enabled={true}
					baseFontSize={18}
					onHeightChange={(h) => setContentHeight(h)}
					scrollEnabled={true}
					style={{ flex: 1, width: '100%' }}
				/>
			</div>
		</div>
	);
}

const styles = {
	wrapper: {
		borderWidth: '3px',
		borderStyle: 'solid',
		borderRadius: 20,
		padding: 10,
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 0,
		overflow: 'hidden',
	},
	inner: {
		borderRadius: 16,
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		minHeight: 0,
		overflow: 'auto',
	},
};

