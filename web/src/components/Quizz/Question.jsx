import React, { useState } from 'react';

import { useThemeColors } from '../../services/Theme';
import MathJaxRenderer from '../General/MathJaxRenderer';

/**
 * Question card styled like a chalkboard frame with a light border.
 * Props:
 *  - html: string (question body; supports MathJax via MathJaxRenderer)
 */
export default function Question({ html, height, style }) {
	const colors = useThemeColors();
	const [contentHeight, setContentHeight] = useState(height || 0);

	return (
		<div 			style={{...styles.wrapper, ...{ borderColor: colors.text + 'CC' }}}
		>
			<div style={{...styles.inner, ...{ backgroundColor: 'transparent'}}> 
				<MathJaxRenderer
					content={html}
					enabled={true}
					baseFontSize={18}
					onHeightChange={(h) => setContentHeight(h)}
					scrollEnabled
					style={{ flex: 1 }}
				/>
			</div>
		</div>
	);
}

const styles = {
	wrapper: {
		borderWidth: 3,
		borderRadius: 20,
		padding: 10,
	},
	inner: {
		borderRadius: 16,
	},
};

