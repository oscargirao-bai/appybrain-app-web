import React, { useMemo } from 'react';

import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import DataManager from '../../services/DataManager.jsx';

/**
 * Motivational message component for quiz results
 * Shows a random encouraging message based on quiz performance
 * @param {number} percentage - Quiz score percentage (0-100)
 */
export default function Quote({ percentage = 50 }) {
	const colors = useThemeColors();

	const message = useMemo(() => {
		return DataManager.getRandomQuoteByPercentage(percentage);
	}, [percentage]);

	return (
		<div style={styles.container}>
			<div style={styles.messageBox}>
				<span style={{...styles.messageText, color: colors.text}}>
					{message}
				</span>
			</div>
		</div>
	);
}

const styles = {
	container: {
		width: '100%',
		paddingLeft: 20,
		paddingRight: 20,
		display: 'flex',
		alignItems: 'center',
	},
	messageBox: {
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: 'transparent',
		maxWidth: '100%',
	},
	messageText: {
		fontSize: 24,
		fontFamily: family.semibold,
		lineHeight: '24px',
		textAlign: 'center',
		letterSpacing: '0.2px',
	},
};
