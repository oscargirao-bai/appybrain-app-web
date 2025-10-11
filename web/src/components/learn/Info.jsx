import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * Info component replicating the sketch: Username (bold) + coin pill to the right, tribe below.
 * Props:
 *  - username: string
 *  - tribe: string
 *  - coins: number
 */
export default function Info({ username = 'Nickname', tribe = 'Sem Tribo', coins, stars, trophies }) {
	const colors = useThemeColors();
	const styles = React.useMemo(() => createStyles(colors), [colors]);

	const showCoins = coins !== undefined;
	const showStars = stars !== undefined;
	const showTrophies = trophies !== undefined;

	const metrics = [];
	if (showStars) metrics.push({ key: 'stars' });
	if (showTrophies) metrics.push({ key: 'trophies' });
	if (showCoins) metrics.push({ key: 'coins' }); // Coins always last (rightmost)
	return (
		<View style={styles.container}>
			<View style={styles.row}>
				<View style={styles.leftBlock}>
					<Text style={styles.username}>{username}</Text>
					<Text style={styles.tribe}>{tribe}</Text>
				</View>
				{metrics.length > 0 && (
					<View style={styles.metricsColumn}>
						<View style={styles.metricsRow}>
							{metrics.map((m, idx) => {
								const isLast = idx === metrics.length - 1;
								if (m.key === 'stars') {
									return (
										<View key="stars" style={[styles.pillWrap, !isLast && styles.pillGap]} accessibilityLabel={`Estrelas: ${stars}`}>
											<View style={styles.pill}>
												<Icon name="star" size={18} color={colors.primary} style={{ marginRight: 6 }} />
												<Text style={styles.pillText}>{stars}</Text>
											</View>
										</View>
									);
								}
								if (m.key === 'coins') {
									return (
										<View key="coins" style={[styles.pillWrap, !isLast && styles.pillGap]} accessibilityLabel={`Moedas: ${coins}`}>
											<View style={styles.pill}>
												<Icon name="coins" size={18} color={colors.accent} style={{ marginRight: 6 }} />
												<Text style={styles.pillText}>{coins}</Text>
											</View>
										</View>
									);
								}
								if (m.key === 'trophies') {
									return (
										<View key="trophies" style={[styles.pillWrap, !isLast && styles.pillGap]} accessibilityLabel={`Troféus: ${trophies}`}>
											<View style={styles.pill}>
												<Icon name="trophy" size={18} color={colors.primary} style={{ marginRight: 6 }} />
												<Text style={styles.pillText}>{trophies}</Text>
											</View>
										</View>
									);
								}
								return null;
							})}
						</View>
					</View>
				)}
			</View>
		</View>
	);
}

const createStyles = (colors) => StyleSheet.create({
	container: {
		width: '100%',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.text + '30',
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		paddingHorizontal: 10,
		paddingTop: 8,
		paddingBottom: 8,
		backgroundColor: colors.background,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	leftBlock: {
		flex: 1,
		paddingRight: 6,
		justifyContent: 'center',
	},
	username: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
		color: colors.text,
		flexShrink: 1,
		flexGrow: 0,
	},
	metricsColumn: {
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	metricsRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	pillWrap: {
		borderWidth: 0,
	},
	pillGap: { marginRight: 6 },
	pill: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.text + '35',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 12,
		backgroundColor: colors.background + '40',
	},
	pillText: {
		fontSize: 14,
		fontWeight: '600',
		fontFamily: family.semibold,
		color: colors.text,
	},
	tribe: {
		marginTop: 2,
		fontSize: 14,
		fontWeight: '400',
		fontFamily: family.regular,
		color: colors.text + 'AA',
	},
});

