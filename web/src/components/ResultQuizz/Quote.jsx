import React, { useMemo } from 'react';

import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import DataManager from '../../services/DataManager';

/**
 * Motivational message component for quiz results
 * Shows a random encouraging message based on quiz performance
 * @param {number} percentage - Quiz score percentage (0-100)
 */
export default function Quote({ percentage = 50 }) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	// Get a random quote based on percentage from DataManager
	const message = useMemo(() => {
		return DataManager.getRandomQuoteByPercentage(percentage);
	}, [percentage]);

	return (
		<div style={styles.container}>
			<div style={styles.messageBox}>
				<span style={{...styles.messageText, ...{ color: colors.text }}}>
					{message}
				</span>
			</div>
		</div>
	);
}

const createStyles = (colors) => StyleSheet.create({
	container: {
		width: '100%',
		paddingHorizontal: 20,
		alignItems: 'center',
	},
	messageBox: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		backgroundColor: 'transparent',
		maxWidth: '100%',
	},
	messageText: {
		fontSize: 24,
		fontFamily: family.semibold,
		lineHeight: 24,
		textAlign: 'center',
		letterSpacing: 0.2,
	},
};
