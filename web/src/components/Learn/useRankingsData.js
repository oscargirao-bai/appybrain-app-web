import { useCallback, useEffect, useMemo, useState } from 'react';
import DataManager from '../../services/DataManager.jsx';

const readRankingsSnapshot = () => ({
	points: DataManager.getRankings('points'),
	stars: DataManager.getRankings('stars'),
	xp: DataManager.getRankings('xp'),
});

const toSafeId = (value) => {
	if (value === null || value === undefined) {
		return '';
	}
	try {
		return value.toString();
	} catch (_error) {
		return `${value}`;
	}
};

const toMetricValue = (user) => {
	if (typeof user?.points === 'number') {
		return user.points;
	}
	return 0;
};

const normalizeUsers = (users) => {
	return users.map((user) => {
		const value = toMetricValue(user);
		const safeId = toSafeId(user?.userId ?? user?.id);
		return {
			id: safeId,
			name: user?.nickname || user?.name || '',
			stars: value,
			trophies: value,
			xp: value,
			self: user?.me === 1,
			position: user?.position,
			organizationId: user?.organizationId,
			organizationName: user?.organizationName,
			teamId: user?.teamId,
			teamName: user?.teamName,
			avatarIcon: user?.avatarIcon,
			avatarUrl: user?.avatarUrl,
			backgroundUrl: user?.backgroundUrl,
			frameUrl: user?.frameUrl,
		};
	});
};

export function useRankingsData({ visible, metric, tab }) {
	const [rankings, setRankings] = useState(() => readRankingsSnapshot());
	const [loading, setLoading] = useState(false);

	const syncRankings = useCallback(() => {
		const next = readRankingsSnapshot();
		setRankings((prev) => {
			if (prev.points === next.points && prev.stars === next.stars && prev.xp === next.xp) {
				return prev;
			}
			return next;
		});
	}, []);

	useEffect(() => {
		syncRankings();
		const unsubscribe = DataManager.subscribe(syncRankings);
		return () => {
			if (typeof unsubscribe === 'function') {
				unsubscribe();
			}
		};
	}, [syncRankings]);

	useEffect(() => {
		if (!visible) return undefined;
		let cancelled = false;

		const ensureRankingsUpToDate = async () => {
			setLoading(true);
			try {
				await DataManager.checkAndUpdateRankings();
				syncRankings();
			} catch (error) {
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		ensureRankingsUpToDate();

		return () => {
			cancelled = true;
		};
	}, [visible, syncRankings]);

	useEffect(() => {
		if (!visible) return undefined;
		const current = rankings[metric];
		if (current && Array.isArray(current?.ranking) && current.ranking.length > 0) {
			return undefined;
		}

		let cancelled = false;

		const loadMetric = async () => {
			setLoading(true);
			try {
				await DataManager.refreshRankings(metric);
				syncRankings();
			} catch (error) {
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		loadMetric();

		return () => {
			cancelled = true;
		};
	}, [visible, metric, rankings, syncRankings]);

	const allRankings = useMemo(() => rankings[metric]?.ranking || [], [rankings, metric]);

	const currentUser = useMemo(() => allRankings.find((user) => user?.me === 1), [allRankings]);
	const currentUserId = currentUser?.userId != null ? currentUser.userId.toString() : undefined;
	const currentUserOrgName = currentUser?.organizationName;
	const currentUserTeamName = currentUser?.teamName;

	const users = useMemo(() => {
		if (!allRankings.length) return [];

		let filtered = allRankings;
		if (tab === 'school' && currentUserOrgName) {
			filtered = allRankings.filter((user) => user?.organizationName === currentUserOrgName);
		} else if (tab === 'class' && currentUserTeamName) {
			filtered = allRankings.filter((user) => user?.teamName === currentUserTeamName);
		}

		return normalizeUsers(filtered);
	}, [allRankings, tab, currentUserOrgName, currentUserTeamName]);

	return {
		users,
		loading,
		setLoading,
		currentUserId,
	};
}
