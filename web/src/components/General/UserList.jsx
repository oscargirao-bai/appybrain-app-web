import React, { useMemo, useCallback } from 'react';

import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';

/**
 * UserList (Ranking)
 * Lista de utilizadores ordenada pelo número de estrelas (desc).
 * Props:
 *  - users: Array<{ id|string, name:string, stars:number, avatarIcon?:string }>
 *  - currentUserId?: id para destacar a linha do próprio utilizador
 *  - topN?: limitar resultados (default: todos)
 *  - showMedals?: mostra ícones especiais nos Top 3 (default true)
 *  - onUserPress?: (user) => void
 *  - denseRanking?: se true usa ranking denso (1,2,2,3); caso contrário ranking competição (1,2,2,4). default false
 *  - showRelativeBar?: mostra barra relativa às estrelas do 1º (default true)
 */
export default function UserList({
	users = [],
	currentUserId,
	topN,
	showMedals = true,
	onUserPress,
	denseRanking = false,
	showRelativeBar = true,
	emptyLabel = 'Sem utilizadores',
	metric = '', // 'stars' | 'trophies' | 'xp'
}) {
	const colors = useThemeColors();

	const sorted = useMemo(() => {
		const getValue = (u) => {
			if (metric === 'points') return u.trophies || 0;
			if (metric === 'xp') return u.xp || 0;
			return u.stars || 0;
		});
		return [...users].sort((a, b) => getValue(b) - getValue(a));
	}, [users, metric]);

	const ranked = useMemo(() => {
		let lastStars = null;
		let lastRank = 0; // rank atribuído (1-based)
		let itemsProcessed = 0; // utilizado em ranking competição
		return sorted.map((u) => {
			itemsProcessed += 1;
			const s = metric === 'points' ? (u.trophies || 0) : metric === 'xp' ? (u.xp || 0) : (u.stars || 0);
			let rank;
			if (lastStars === null) {
				rank = 1;
			} else if (s === lastStars) {
				rank = lastRank; // empate
			} else {
				if (denseRanking) {
					rank = lastRank + 1; // denso
				} else {
					rank = itemsProcessed; // competição: salta valores
				}
			}
			lastStars = s;
			lastRank = rank;
			return { ...u, rank };
		};
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
			<button 				onClick={onUserPress ? () => onUserPress(item) : undefined}
				style={({ pressed }) => [
					styles.row,
					{ backgroundColor: isSelf ? colors.accent + '22' : colors.text + '08', borderColor: colors.text + '15' },
					pressed && { opacity: 0.8 },
				]}
				accessibilityRole={onUserPress ? 'button' : 'text'}
				aria-label={`Rank ${item.rank}. ${item.name}. ${currentValue} ${metric === 'trophies' ? 'troféus' : metric === 'xp' ? 'XP' : 'estrelas'}.`}
			>
				<div style={styles.rankCol}>
					{topMedal ? (
						<Icon name={medalIcon} size={22} color={medalColor} />
					) : (
						<span style={{...styles.rankText, ...{ color: colors.text + 'AA' }}}>{item.rank}</span>
					)}
				</div>
				<div style={{...styles.avatar, ...{ borderColor: colors.primary + '66' }}}> 
					{item.avatarIcon ? (
						<Icon name={item.avatarIcon} size={20} color={colors.primary} />
					) : (
						<span style={{...styles.avatarLetter, ...{ color: colors.primary }}}>{(item.name || '?').charAt(0).toUpperCase()}</span>
					)}
				</div>
				<div style={styles.mainCol}>
					<span style={{...styles.name, ...{ color: colors.text }}} numberOfLines={1}>{item.name}</span>
					{showRelativeBar && maxValue > 0 && (
						<div style={styles.barWrapper}>
							<div style={{...styles.barBg, ...{ backgroundColor: colors.text + '22' }}} />
							<div style={{...styles.barFill, ...{ backgroundColor: colors.primary}} />
						</div>
					)}
				</div>
				<div style={styles.starsCol}>
					{metric === 'points' ? (
						<Icon name="trophy" size={16} color={colors.primary} style={{ marginLeft: 8, marginRight: 4}} />
					) : metric === 'xp' ? (
						<span style={{...styles.valuePrefix, ...{ color: colors.primary}}>XP</span>
					) : (
						<Icon name="star" size={16} color={colors.primary} style={{ marginLeft: 8, marginRight: 4}} />
					)}
					<span style={{...styles.starsText, ...{ color: colors.text }}}>{currentValue}</span>
				</div>
			</button>
		);
		}, [colors, currentUserId, maxValue, metric, onUserPress, showMedals, showRelativeBar]);

	if (finalList.length === 0) {
		return (
			<div style={{...styles.emptyWrapper, ...{ borderColor: colors.text + '22'}}> 
				<span style={{ color: colors.text + '99', fontSize: 14, fontFamily: family.regular }}>{emptyLabel}</span>
			</div>
		);
	}

	return (
		<div 			data={finalList}
			keyExtractor={(item, idx) => `user-${item.id || idx}-${item.email || ''}-${idx}`}
			renderItem={renderItem}
			style={styles.list}
			contentContainerStyle={styles.contentContainer}
			showsVerticalScrollIndicator={false}
		/>
	);
}

const styles = {
	list: {
		flexGrow: 0,
	},
	contentContainer: {
		paddingHorizontal: 8,
		paddingBottom: 24,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderRadius: 14,
		marginTop: 10,
	},
	rankCol: {
		width: 34,
		alignItems: 'center',
	},
	rankText: {
		fontSize: 16,
		fontWeight: '800',
		fontFamily: family.bold,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 12,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	avatarLetter: {
		fontSize: 18,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	mainCol: {
		flex: 1,
		justifyContent: 'center',
		marginRight: 10,
	},
	name: {
		fontSize: 15,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	barWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 4,
		height: 6,
		borderRadius: 4,
		overflow: 'hidden',
	},
	barBg: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 4,
	},
	barFill: {
		height: 6,
		borderRadius: 4,
	},
	starsCol: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 4,
	},
	starsText: {
		fontSize: 15,
		fontWeight: '700',
		fontFamily: family.bold,
	},
	valuePrefix: {
		fontSize: 12,
		fontWeight: '800',
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
	emptyWrapper: {
		marginTop: 16,
		marginHorizontal: 16,
		borderWidth: 1,
		borderRadius: 16,
		padding: 24,
		alignItems: 'center',
	},
};

