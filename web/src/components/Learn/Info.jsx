import React from 'react';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function Info({ username = 'Nickname', tribe = 'Sem Tribo', coins, stars, trophies }) {
	const colors = useThemeColors();
	const styles = React.useMemo(() => createStyles(colors), [colors]);

	const showCoins = coins !== undefined;
	const showStars = stars !== undefined;
	const showTrophies = trophies !== undefined;

	const metrics = [];
	if (showStars) metrics.push({ key: 'stars' });
	if (showTrophies) metrics.push({ key: 'trophies' });
	if (showCoins) metrics.push({ key: 'coins' });

	return (
		<div style={styles.container}>
			<div style={styles.row}>
				<div style={styles.leftBlock}>
					<span style={styles.username}>{username}</span>
					<span style={styles.tribe}>{tribe}</span>
				</div>
				{metrics.length > 0 && (
					<div style={styles.metricsColumn}>
						<div style={styles.metricsRow}>
							{metrics.map((m, idx) => {
								const isLast = idx === metrics.length - 1;
								const pillStyle = isLast ? styles.pillWrap : {...styles.pillWrap, ...styles.pillGap};
								
								if (m.key === 'stars') {
									return (
										<div key="stars" style={pillStyle} aria-label={`Estrelas: ${stars}`}>
										<div style={styles.pill}>
											<LucideIcon name="star" size={18} color={colors.primary} style={{ marginRight: 6 }} />
											<span style={styles.pillText}>{stars}</span>
											</div>
										</div>
									);
								}
								if (m.key === 'coins') {
									return (
										<div key="coins" style={pillStyle} aria-label={`Moedas: ${coins}`}>
										<div style={styles.pill}>
											<LucideIcon name="coins" size={18} color={colors.accent} style={{ marginRight: 6 }} />
											<span style={styles.pillText}>{coins}</span>
											</div>
										</div>
									);
								}
								if (m.key === 'trophies') {
									return (
										<div key="trophies" style={pillStyle} aria-label={`Troféus: ${trophies}`}>
										<div style={styles.pill}>
											<LucideIcon name="trophy" size={18} color={colors.primary} style={{ marginRight: 6 }} />
											<span style={styles.pillText}>{trophies}</span>
											</div>
										</div>
									);
								}
								return null;
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

const createStyles = (colors) => ({
	container: {
		width: '100%',
		borderWidth: '0.5px',
		borderStyle: 'solid',
		borderColor: colors.text + '30',
		borderTopLeftRadius: 0,
		borderTopRightRadius: 0,
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 8,
		paddingBottom: 8,
		boxSizing: 'border-box',
		backgroundColor: colors.background,
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'stretch',
	},
	leftBlock: {
		flex: 1,
		paddingRight: 6,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	username: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
		color: colors.text,
		lineHeight: 1.2,
	},
	tribe: {
		marginTop: 2,
		fontSize: 14,
		fontWeight: '400',
		fontFamily: family.regular,
		color: colors.text + 'AA',
	},
	metricsColumn: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
	},
	metricsRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	pillWrap: {
		display: 'flex',
		alignItems: 'center',
		borderWidth: 0,
	},
	pillGap: {
		marginRight: 6,
	},
	pill: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: '0.5px',
		borderStyle: 'solid',
		borderColor: colors.text + '35',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6,
		borderRadius: 12,
		backgroundColor: colors.background + '40',
	},
	pillText: {
		fontSize: 14,
		fontWeight: '600',
		fontFamily: family.semibold,
		color: colors.text,
	},
});
