import React, { useMemo, useCallback } from 'react';
import SvgIcon from './SvgIcon';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

export default function UserList({
	users = [],
	currentUserId,
	topN,
	showMedals = true,
	onUserPress,
	denseRanking = false,
	showRelativeBar = true,
	emptyLabel = 'Sem utilizadores',
	metric = '',
}) {
	const colors = useThemeColors();

	const sorted = useMemo(() => {
		const getValue = (u) => {
			if (metric === 'points') return u.trophies || 0;
			if (metric === 'xp') return u.xp || 0;
			return u.stars || 0;
		};
		return [...users].sort((a, b) => getValue(b) - getValue(a));
	}, [users, metric]);

	const ranked = useMemo(() => {
		let lastStars = null;
		let lastRank = 0;
		let itemsProcessed = 0;
		return sorted.map((u) => {
			itemsProcessed += 1;
			const s = metric === 'points' ? (u.trophies || 0) : metric === 'xp' ? (u.xp || 0) : (u.stars || 0);
			let rank;
			if (lastStars === null) {
				rank = 1;
			} else if (s === lastStars) {
				rank = lastRank;
			} else {
				if (denseRanking) {
					rank = lastRank + 1;
				} else {
					rank = itemsProcessed;
				}
			}
			lastStars = s;
			lastRank = rank;
			return { ...u, rank };
		});
	}, [sorted, denseRanking, metric]);

	const maxValue = useMemo(() => {
		if (!ranked.length) return 0;
		if (metric === 'trophies') return ranked[0].trophies || 0;
		if (metric === 'xp') return ranked[0].xp || 0;
		return ranked[0].stars || 0;
	}, [ranked, metric]);

	const finalList = useMemo(() => (topN ? ranked.slice(0, topN) : ranked), [ranked, topN]);

	const renderItem = useCallback(({ item }) => {
		const isSelf = item.id === currentUserId;
		const currentValue = metric === 'points' ? (item.trophies || 0) : metric === 'xp' ? (item.xp || 0) : (item.stars || 0);
		const pct = maxValue > 0 ? currentValue / maxValue : 0;
		const topMedal = showMedals && item.rank <= 3;
		const medalIcon = item.rank === 1 ? 'crown' : item.rank === 2 ? 'award' : 'award';
		const medalColor = item.rank === 1 ? colors.accent : item.rank === 2 ? colors.primary : colors.primary;

		return (
			<button
				onClick={onUserPress ? () => onUserPress(item) : undefined}
				style={{
					...styles.row,
					backgroundColor: isSelf ? colors.accent + '22' : colors.text + '08',
					borderColor: colors.text + '15',
					cursor: onUserPress ? 'pointer' : 'default',
				}}
				aria-label={`Rank ${item.rank}. ${item.name}. ${currentValue} ${metric === 'trophies' ? 'troféus' : metric === 'xp' ? 'XP' : 'estrelas'}.`}
			>
				<div style={styles.rankCol}>
					{topMedal ? (
						<SvgIcon name={medalIcon} size={22} color={medalColor} />
					) : (
						<span style={{ ...styles.rankText, color: colors.text + 'AA' }}>
							{item.rank}
						</span>
					)}
				</div>
				<div style={{ ...styles.avatar, borderColor: colors.primary + '66' }}>
					<SvgIcon name={item.avatarIcon || 'user'} size={24} color={colors.primary} />
				</div>
				<div style={styles.nameCol}>
					<span style={{ ...styles.nameText, color: colors.text }}>
						{item.name || 'User'}
					</span>
					{showRelativeBar && (
						<div style={{ ...styles.barBg, backgroundColor: colors.text + '0D' }}>
							<div 
								style={{
									...styles.barFill,
									backgroundColor: colors.primary,
									width: `${pct * 100}%`,
								}}
							/>
						</div>
					)}
				</div>
				<div style={styles.starsCol}>
					<span style={{ ...styles.starsText, color: colors.text }}>
						{currentValue}
					</span>
					{metric === 'xp' && (
						<span style={{ ...styles.valuePrefix, color: colors.primary }}>
							XP
						</span>
					)}
				</div>
			</button>
		);
	}, [colors, currentUserId, maxValue, metric, onUserPress, showMedals, showRelativeBar]);

	if (!finalList || finalList.length === 0) {
		return (
			<div style={{ ...styles.emptyWrapper, borderColor: colors.text + '22' }}>
				<span style={{ ...styles.emptyText, color: colors.text + '88' }}>{emptyLabel}</span>
			</div>
		);
	}

	return (
		<div style={styles.list}>
			{finalList.map((item) => (
				<div key={item.id} style={styles.itemWrapper}>
					{renderItem({ item })}
				</div>
			))}
		</div>
	);
}

const styles = {
	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},
	itemWrapper: {
		paddingLeft: 8,
		paddingRight: 8,
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 12,
		paddingRight: 12,
		borderRadius: 12,
		borderWidth: '1px',
		borderStyle: 'solid',
		gap: 12,
		background: 'transparent',
		border: 'none',
		width: '100%',
	},
	rankCol: {
		width: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	rankText: {
		fontSize: 16,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	avatar: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	nameCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
	},
	nameText: {
		fontSize: 14,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	barBg: {
		width: '100%',
		height: 4,
		borderRadius: 2,
		overflow: 'hidden',
	},
	barFill: {
		height: '100%',
		borderRadius: 2,
	},
	starsCol: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	starsText: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
	},
	valuePrefix: {
		fontSize: 10,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	emptyWrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 40,
		paddingBottom: 40,
		borderTopWidth: '1px',
		borderTopStyle: 'solid',
	},
	emptyText: {
		fontSize: 14,
		fontFamily: family.regular,
	},
};
