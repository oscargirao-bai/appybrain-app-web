import React, { useEffect, useMemo, useState } from 'react';

import LinearGradient from '../../components/General/LinearGradient.jsx';
import Button1 from '../../components/General/Button1.jsx';
import { BattleParticipantRow, BattleMetrics } from '../../components/ResultQuizz/BattleResultWidgets.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import DataManager from '../../services/DataManager.jsx';
import LucideIcon from '../../components/General/LucideIcon.jsx';
import {
	buildBattleSummary,
	extractAnswerSequence,
	extractHelpsUsed,
	extractTotalSeconds,
	formatSeconds,
	getOpponentIdentity,
	getUserBannerSources,
	getUserIdentity,
	getUserStats,
	inferTimeouts,
	isBattleFinal,
	safeImageSource,
	transformBattleApiResponse,
} from './helpers/battleResultHelpers.js';

const OUTCOME_COLORS = {
	win: '#1BA45B',
	lose: '#EF4444',
	draw: '#F59E0B',
	pending: '#4B5563',
};

export default function ResultScreen2({ navigation, route }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const {
		correct = null,
		total = null,
		totalSec = null,
		sessionResult = null,
		battleSessionId = null,
		openedFromHistory = false,
		openedFromHistoryBattleId = null,
	} = route.params || {};

	const [battleResult, setBattleResult] = useState(null);
	const [loading, setLoading] = useState(Boolean(battleSessionId));

	useEffect(() => {
		let isMounted = true;

		const refreshSequentially = async () => {
			try {
				await DataManager.refreshSection('userInfo');
			} catch (error) {
				console.error('ResultScreen2: failed to refresh userInfo', error);
			}
			try {
				await DataManager.refreshSection('userStars');
			} catch (error) {
				console.error('ResultScreen2: failed to refresh userStars', error);
			}
			try {
				await DataManager.refreshSection('battles');
			} catch (error) {
				console.error('ResultScreen2: failed to refresh battles', error);
			}
		};

		const loadBattleResult = async () => {
			if (!battleSessionId) {
				if (isMounted) setLoading(false);
				return;
			}
			try {
				if (isMounted) setLoading(true);
				const result = await ApiManager.getBattleResult(battleSessionId);
				if (isMounted && result?.success) {
					const transformed = transformBattleApiResponse(result, battleSessionId);
					setBattleResult(transformed);
				}
			} catch (error) {
				console.error('ResultScreen2: failed to load battle result', error);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		(async () => {
			await refreshSequentially();
			await loadBattleResult();
		})();

		return () => {
			isMounted = false;
		};
	}, [battleSessionId]);

	const activeBattleData = battleResult || sessionResult || null;
	const battle = useMemo(() => buildBattleSummary(activeBattleData, { correct }), [activeBattleData, correct]);
	const outcome = battle.outcome || 'pending';
	const isFinal = isBattleFinal(outcome);
	const outcomeColor = OUTCOME_COLORS[outcome] || colors.text;

	const outcomeLabel = (() => {
		if (outcome === 'win') return translate('battle.result.win');
		if (outcome === 'lose') return translate('battle.result.lose');
		if (outcome === 'draw') return translate('battle.result.draw');
		return translate('battle.result.pending');
	})();

	const placeholderOpponent = translate('battle.result.opponent');
	const fallbackTribe = translate('common.noTribe');

	const opponent = useMemo(() => activeBattleData?.opponent || activeBattleData?.rival || null, [activeBattleData]);
	const opponentIdentity = useMemo(() => {
		if (!isFinal) {
			return { username: translate('battle.unknownOpponent') || 'Desconhecido', tribe: '' };
		}
		return getOpponentIdentity(opponent, placeholderOpponent, fallbackTribe);
	}, [opponent, placeholderOpponent, fallbackTribe, isFinal, translate]);
		const opponentBannerSources = useMemo(() => ({
			avatarSource: safeImageSource(opponent?.avatarUrl),
			bannerImageSource: safeImageSource(opponent?.backgroundUrl),
			frameSource: safeImageSource(opponent?.frameUrl),
		}), [opponent]);

		const userIdentity = getUserIdentity(fallbackTribe);
		const userBannerSources = getUserBannerSources();
		const userStats = getUserStats();

	const totalQuestions = useMemo(() => {
		if (typeof total === 'number' && total > 0) return total;
		return activeBattleData?.totalQuestions || 0;
	}, [total, activeBattleData]);

	const mySequence = useMemo(() => (
		extractAnswerSequence(activeBattleData, 'me', {
			total: totalQuestions,
			correct: typeof correct === 'number' ? correct : battle.myScore ?? 0,
			timeout: inferTimeouts(activeBattleData, 'me'),
		})
	), [activeBattleData, totalQuestions, correct, battle.myScore]);

	const opponentSequence = useMemo(() => {
		if (!isFinal && totalQuestions > 0) {
			return Array(totalQuestions).fill('unknown');
		}
		return extractAnswerSequence(activeBattleData, 'opponent', {
			total: totalQuestions,
			correct: battle.opponentScore ?? 0,
			timeout: inferTimeouts(activeBattleData, 'opponent'),
		});
	}, [activeBattleData, totalQuestions, battle.opponentScore, isFinal]);

	const myTotalSec = useMemo(() => extractTotalSeconds(activeBattleData, 'me', totalSec), [activeBattleData, totalSec]);
	const opponentTotalSec = useMemo(() => extractTotalSeconds(activeBattleData, 'opponent', null), [activeBattleData]);

	const myHelps = useMemo(() => extractHelpsUsed(activeBattleData, 'me', 0), [activeBattleData]);
	const opponentHelps = useMemo(() => extractHelpsUsed(activeBattleData, 'opponent', 0), [activeBattleData]);

	const opponentStats = useMemo(() => ({
		time: isFinal ? formatSeconds(opponentTotalSec) : '...',
		helps: opponentHelps,
	}), [isFinal, opponentTotalSec, opponentHelps]);

	const playerStats = useMemo(() => ({
		time: formatSeconds(myTotalSec),
		helps: myHelps,
	}), [myTotalSec, myHelps]);

	const showGlow = outcome === 'win' || outcome === 'lose' || outcome === 'draw';
	const glowColors = useMemo(() => {
		if (outcome === 'win') return ['rgba(27,164,91,0.0)', 'rgba(27,164,91,0.12)', 'rgba(27,164,91,0.22)'];
		if (outcome === 'lose') return ['rgba(239,68,68,0.0)', 'rgba(239,68,68,0.12)', 'rgba(239,68,68,0.24)'];
		if (outcome === 'draw') return ['rgba(245,158,11,0.0)', 'rgba(245,158,11,0.12)', 'rgba(245,158,11,0.22)'];
		return ['rgba(107,114,128,0)', 'rgba(107,114,128,0.08)', 'rgba(107,114,128,0.16)'];
	}, [outcome]);

	const opponentDelta = {
		value: activeBattleData?.opponentTrophiesDelta ?? 0,
		isDraw: outcome === 'draw',
	};
	const playerDelta = {
		value: battle.trophiesDelta ?? 0,
		isDraw: outcome === 'draw',
	};

	const isCompact = typeof window !== 'undefined' ? window.innerHeight < 700 : false;

	if (loading) {
		return (
			<div style={{ ...styles.safe, backgroundColor: colors.background }}>
				<div style={{ ...styles.loader, color: colors.text }}>
					<LucideIcon name="loader" size={32} color={colors.primary} style={{ marginBottom: 16 }} />
					<span>{translate('battle.result.loading')}</span>
				</div>
			</div>
		);
	}

	return (
		<div style={{ ...styles.safe, backgroundColor: colors.background }}>
			{showGlow && (
				<LinearGradient
					colors={glowColors}
					start={{ x: 0.5, y: 0 }}
					end={{ x: 0.5, y: 1 }}
					style={{ ...styles.bottomGlow, pointerEvents: 'none' }}
				/>
			)}
			<div style={{...styles.content, gap: isCompact ? 2 : 6}}>
				<div style={{...styles.header, paddingBottom: isCompact ? 0 : 2, marginBottom: isCompact ? -14 : -12}}>
					<span style={{ ...styles.headerText, color: outcomeColor }}>{outcomeLabel}</span>
				</div>

				<BattleParticipantRow
					side="opponent"
					bannerProps={opponentBannerSources}
					info={opponentIdentity}
					delta={opponentDelta}
					colors={colors}
					pending={!isFinal}
				/>

				<div style={styles.vsWrap}>
					<BattleMetrics
						topSequence={opponentSequence}
						bottomSequence={mySequence}
						opponentStats={opponentStats}
						playerStats={playerStats}
						colors={colors}
						translate={translate}
						compact={isCompact}
					/>
				</div>

				<BattleParticipantRow
					side="player"
					bannerProps={userBannerSources}
					info={{ username: userIdentity.username, tribe: userIdentity.tribe, coins: userStats.coins, stars: userStats.stars, trophies: userStats.points }}
					delta={playerDelta}
					colors={colors}
					pending={!isFinal}
				/>
			</div>

			<div style={styles.actions}>
				<Button1
					label={translate('common.close')}
					color={colors.secondary}
					onClick={() => {
						if (openedFromHistory) {
							navigation.navigate('MainTabs', {
								screen: 'Battle',
								params: { reopenHistory: true, highlightBattleId: openedFromHistoryBattleId },
							});
						} else {
							navigation.navigate('MainTabs', { initialTab: 1 });
						}
					}}
					style={{ minWidth: 220 }}
				/>
			</div>
		</div>
	);
}

const styles = {
	safe: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		position: 'relative',
	},
	content: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		paddingBottom: 10,
		width: '100%',
		maxWidth: 560,
		margin: '0 auto',
	},
	header: {
		paddingTop: 8,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerText: {
		fontSize: 20,
		fontWeight: '800',
		letterSpacing: 0.5,
		textAlign: 'center',
	},
	vsWrap: {
		paddingLeft: 8,
		paddingRight: 8,
		display: 'flex',
		justifyContent: 'center',
	},
	actions: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		paddingLeft: 12,
		paddingRight: 12,
		paddingBottom: 16,
	},
	bottomGlow: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		height: 260,
	},
	loader: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		fontSize: 16,
		fontWeight: '600',
	},
};
