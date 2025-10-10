import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
		<View style={styles.container}>
			<View style={styles.messageBox}>
				<Text style={[styles.messageText, { color: colors.text }]}>
					{message}
				</Text>
			</View>
		</View>
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
});
