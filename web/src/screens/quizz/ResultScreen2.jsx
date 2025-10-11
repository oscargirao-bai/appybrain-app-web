import React, { useMemo, useEffect, useState } from 'react';

import { LinearGradient } from 'expo-linear-gradient';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import Icon from '@react-native-vector-icons/lucide';
import Banner from '../../components/Profile/Banner';
import Info from '../../components/Learn/Info';
import DataManager from '../../services/DataManager';
import ApiManager from '../../services/ApiManager';
import Button1 from '../../components/General/Button1';
import Reward from '../../components/ResultQuizz/Reward';

export default function ResultScreen2() {
	const colors = useThemeColors();
	const navigation = useNavigation();
	const route = useRoute();
	const { height } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const {
		correct = null,
		total = null,
		totalSec = null,
		quizType,
		title: quizTitle,
		sessionResult = null,
		battleSessionId = null,
	} = route.params || {};

	// State for battle result from API
	const [battleResult, setBattleResult] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	// Refresh user data when screen loads
	useEffect(() => {
		const refreshUserData = async () => {
			try {
				await Promise.all([
					DataManager.refreshSection('userInfo'),
					DataManager.refreshSection('userStars'),
					DataManager.refreshSection('battles'),
				]);
				//console.log('ResultScreen2: User and battles refreshed');
			} catch (error) {
				console.error('ResultScreen2: Failed refreshing data', error);
			}
		};

		const loadBattleResult = async () => {
			if (battleSessionId) {
				try {
					//console.log('ResultScreen2: Loading battle result for session:', battleSessionId);
					setIsLoading(true);
					const result = await ApiManager.getBattleResult(battleSessionId);
					
					if (result && result.success) {
						// Transform API response to expected format
						const transformedResult = transformBattleApiResponse(result, battleSessionId);
						setBattleResult(transformedResult);
						//console.log('ResultScreen2: Battle result transformed:', transformedResult);
					} else {
						//console.log('ResultScreen2: Battle result failed or empty:', result);
					}
				} catch (error) {
					console.error('ResultScreen2: Failed to load battle result:', error);
				} finally {
					setIsLoading(false);
				}
			} else {
				// If no battleSessionId, we're not loading from API
				setIsLoading(false);
			}
		};

		refreshUserData();
		loadBattleResult();
	}, [battleSessionId]);

	const hasStats = typeof correct === 'number' && typeof total === 'number' && total > 0;

	// Use battle result from API if available, otherwise use sessionResult from params
	const activeBattleData = battleResult || sessionResult;
	const battle = useMemo(() => buildBattleSummary(activeBattleData, { correct }), [activeBattleData, correct]);

	// Opponent sources (avatar/background/frame) from activeBattleData
	const opponent = useMemo(() => activeBattleData?.opponent || activeBattleData?.rival || null, [activeBattleData]);
	const opponentAvatarSource = opponent?.avatarUrl ? safeImageSource(opponent.avatarUrl) : null;
	const opponentBackgroundSource = opponent?.backgroundUrl ? safeImageSource(opponent.backgroundUrl) : null;
	const opponentFrameSource = opponent?.frameUrl ? safeImageSource(opponent.frameUrl) : null;

	const opponentUsername = useMemo(() => battle.opponentName, [battle.opponentName]);
	const opponentTribe = useMemo(() => {
		const tribeName = opponent?.teamName || opponent?.tribeName || opponent?.organizationName;
		// Ensure we always return a string, not an object
		return (typeof tribeName === 'string' ? tribeName : 'Sem Tribo');
	}, [opponent]);
	const opponentCoins = useMemo(() => (typeof opponent?.coins === 'number' ? opponent.coins : undefined), [opponent]);
	const opponentStars = useMemo(() => (typeof opponent?.stars === 'number' ? opponent.stars : undefined), [opponent]);


	const showGlow = battle.outcome === 'win' || battle.outcome === 'lose' || battle.outcome === 'draw';
	const glowColors = battle.outcome === 'win'
		? ['rgba(27,164,91,0.0)', 'rgba(27,164,91,0.12)', 'rgba(27,164,91,0.22)']
		: battle.outcome === 'lose'
		? ['rgba(239,68,68,0.0)', 'rgba(239,68,68,0.12)', 'rgba(239,68,68,0.24)']
		: ['rgba(245,158,11,0.0)', 'rgba(245,158,11,0.12)', 'rgba(245,158,11,0.22)']; // Orange for draw

	const title = 'Batalha 1v1';
	const outcomeHeader = battle.outcome === 'win' ? 'Vitória' : battle.outcome === 'lose' ? 'Derrota' : battle.outcome === 'draw' ? 'Empate' : 'Pendente';
	const outcomeColor = battle.outcome === 'win' ? '#1BA45B' : battle.outcome === 'lose' ? '#EF4444' : battle.outcome === 'draw' ? '#F59E0B' : colors.text;

	// Final state helper - include draw as a finalized state
	const isFinal = battle.outcome === 'win' || battle.outcome === 'lose' || battle.outcome === 'draw';

	// Build per-question result sequences for dots rows
	const totalQuestions = useMemo(() => {
		return (typeof total === 'number' && total > 0) ? total : (activeBattleData?.totalQuestions || null);
	}, [total, activeBattleData]);

	const mySeq = useMemo(() => {
		return extractAnswerSequence(activeBattleData, 'me', {
			total: totalQuestions || 0,
			correct: typeof correct === 'number' ? correct : (battle.myScore ?? 0),
			timeout: inferTimeouts(activeBattleData, 'me')
		};
	}, [activeBattleData, totalQuestions, correct, battle.myScore]);

	const oppSeq = useMemo(() => {
		// If battle isn't finalized (pending), show unknowns for opponent
		if (!isFinal && (totalQuestions || 0) > 0) {
			return Array(totalQuestions).fill('unknown');
		}
		return extractAnswerSequence(activeBattleData, 'opponent', {
			total: totalQuestions || 0,
			correct: battle.opponentScore ?? 0,
			timeout: inferTimeouts(activeBattleData, 'opponent')
		};
	}, [isFinal, activeBattleData, totalQuestions, battle.opponentScore]);

	// Total time (seconds) per user
	const myTotalSec = useMemo(() => extractTotalSeconds(activeBattleData, 'me', totalSec), [activeBattleData, totalSec]);
	const oppTotalSec = useMemo(() => extractTotalSeconds(activeBattleData, 'opponent', null), [activeBattleData]);

	// Helps used per user
	const myHelps = useMemo(() => extractHelpsUsed(activeBattleData, 'me', 0), [activeBattleData]);
	const oppHelps = useMemo(() => extractHelpsUsed(activeBattleData, 'opponent', 0), [activeBattleData]);

	const isShort = height < 700;

	// Show loading screen while fetching battle result
	if (isLoading && battleSessionId) {
		return (
			<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>
				<div style={{...styles.content, ...{ justifyContent: 'center'}}>
					<div style={styles.loadingContainer}>
						<Icon name="loader" size={32} color={colors.primary} style={{ marginBottom: 16 }} />
						<span style={{...styles.loadingText, ...{ color: colors.text }}}>A carregar resultado...</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}> 
			{/* Bottom glow like ResultScreen1: only for win/lose */}
			{(() => {
				if (!showGlow) return null;
				return (
					<LinearGradient
						pointerEvents="none"
						colors={glowColors}
						start={{ x: 0.5, y: 0 }}
						end={{ x: 0.5, y: 1 }}
						style={styles.bottomGlow}
					/>
				);
			})()}
			<div style={styles.content}>
				<div style={styles.header}> 
					<span style={{...styles.quizTitle, ...{ color: outcomeColor }}} numberOfLines={2}>
						{outcomeHeader}
					</span>
				</div>

				{/* Middle column: opponent (top), VS section, user (bottom) */}
				<div style={styles.middle}>
					{/* Opponent banner + info (top) */}
					<div style={styles.bannerWrap}> 
					{/* Opponent banner + info (top) */}
						{/* Row with left-side trophies delta centered in leftover space and right-aligned banner */}
						<div style={styles.opponentRow}>
							<div style={styles.sideSpace}>
								{(() => {
									// If battle is not finalized (pending), show ellipsis
									const isFinal = battle.outcome === 'win' || battle.outcome === 'lose' || battle.outcome === 'draw';
									if (!isFinal) {
										return (
											<div style={styles.trophyRow} aria-label={'Variação de troféus: pendente'}>
											<Icon name="trophy" size={16} color={colors.primary} style={{ marginRight: 4 }} />
											<span style={{...styles.trophyValue, ...{ color: colors.text }}}>...</span>
										</div>
									);
									}
									// Opponent should display their actual delta from the API
									const v = activeBattleData?.opponentTrophiesDelta;
									// Use orange color for draws, otherwise green/red based on positive/negative
									const isDraw = battle.outcome === 'draw';
									const tone = isDraw 
										? '#F59E0B' 
										: (typeof v === 'number' && v !== 0 ? (v > 0 ? '#1BA45B' : '#EF4444') : colors.text);
									const sign = typeof v === 'number' && v !== 0 ? (v > 0 ? '+' : '-') : '';
									const value = typeof v === 'number' ? Math.abs(v) : 0;
									return (
										<div style={styles.trophyRow} aria-label={`Variação de troféus: ${sign}${value}`}>
											{sign ? (<span style={{...styles.trophySign, ...{ color: tone }}}>{sign}</span>) : null}
											<Icon name="trophy" size={16} color={colors.primary} style={{ marginRight: 4 }} />
											<span style={{...styles.trophyValue, ...{ color: tone }}}>{value}</span>
										</div>
									);
								})()}
							</div>
							<Banner
								avatarSource={opponentAvatarSource}
								bannerImageSource={opponentBackgroundSource}
								frameSource={opponentFrameSource}
								topFlat={false}
								onClick={() => { /* disable navigation on opponent banner */ }}
								style={{ width: '75%' }}
							/>
						</div>
						<div style={{...styles.infoWrap, ...{ width: '75%'}}>
							<Info
								username={opponentUsername}
								tribe={opponentTribe}
							/>
						</div>
					</div>

					{/* Versus block (middle) */}
					<div style={{...styles.vsSection, ...{ paddingHorizontal: isShort ? 16 : 24}}> 
						<div style={styles.vsScoreAbove}>
							<ResultsDots sequence={oppSeq} colors={colors} dotSize={isShort ? 24 : 30} />
							<div style={styles.timeHelpRow}>
								<div style={styles.timeSection}>
									<Icon name="clock" size={14} color={colors.text + '99'} style={{ marginRight: 6 }} />
									<span style={{...styles.timeLabel, ...{ color: colors.text + '99' }}}>Tempo Total</span>
									<span style={{...styles.timeValue, ...{ color: colors.text }}}>{isFinal ? formatSeconds(oppTotalSec) : '...'}</span>
								</div>
								<div style={styles.helpSection}>
									<Icon name="lightbulb" size={14} color={colors.text + '99'} style={{ marginRight: 6 }} />
									<span style={{...styles.helpLabel, ...{ color: colors.text + '99' }}}>Ajuda</span>
									<HelpIcons helpsData={oppHelps} colors={colors} />
								</div>
							</div>
						</div>
						<div style={styles.vsDividerRow}>
							<div style={{...styles.vsBar, ...{ backgroundColor: (colors.text + '22') }}} />
							<span style={{...styles.vsText, ...{ color: colors.text + '99' }}}>VS</span>
							<div style={{...styles.vsBar, ...{ backgroundColor: (colors.text + '22') }}} />
						</div>
						<div style={styles.vsScoreBelow}>
							<ResultsDots sequence={mySeq} colors={colors} dotSize={isShort ? 24 : 30} />
							<div style={styles.timeHelpRow}>
								<div style={styles.timeSection}>
									<Icon name="clock" size={14} color={colors.text + '99'} style={{ marginRight: 6 }} />
									<span style={{...styles.timeLabel, ...{ color: colors.text + '99' }}}>Tempo Total</span>
									<span style={{...styles.timeValue, ...{ color: colors.text }}}>{formatSeconds(myTotalSec)}</span>
								</div>
								<div style={styles.helpSection}>
									<Icon name="lightbulb" size={14} color={colors.text + '99'} style={{ marginRight: 6 }} />
									<span style={{...styles.helpLabel, ...{ color: colors.text + '99' }}}>Ajuda</span>
									<HelpIcons helpsData={myHelps} colors={colors} />
								</div>
							</div>
						</div>
					</div>

					{/* Player banner + info (bottom) */}
					<div style={styles.bannerWrap}>
						{/* Row with left-aligned user banner and right-side trophies delta centered in leftover space */}
						<div style={styles.opponentRow}>
							<Banner
								avatarSource={getAvatarSource()}
								bannerImageSource={getBackgroundSource()}
								frameSource={getFrameSource()}
								topFlat={false}
								style={{ width: '75%' }}
							/>
							<div style={styles.sideSpace}>
								{(() => {
									const isFinal = battle.outcome === 'win' || battle.outcome === 'lose' || battle.outcome === 'draw';
									if (!isFinal) {
										return (
											<div style={styles.trophyRow} aria-label={'Variação de troféus: pendente'}>
											<Icon name="trophy" size={16} color={colors.primary} style={{ marginRight: 4 }} />
											<span style={{...styles.trophyValue, ...{ color: colors.text }}}>...</span>
										</div>
									);
									}
									const v = battle.trophiesDelta;
									// Use orange color for draws, otherwise green/red based on positive/negative
									const isDraw = battle.outcome === 'draw';
									const tone = isDraw 
										? '#F59E0B' 
										: (typeof v === 'number' && v !== 0 ? (v > 0 ? '#1BA45B' : '#EF4444') : colors.text);
									const sign = typeof v === 'number' && v !== 0 ? (v > 0 ? '+' : '-') : '';
									const value = typeof v === 'number' ? Math.abs(v) : 0;
									return (
										<div style={styles.trophyRow} aria-label={`Variação de troféus: ${sign}${value}`}>
											{sign ? (<span style={{...styles.trophySign, ...{ color: tone }}}>{sign}</span>) : null}
											<Icon name="trophy" size={16} color={colors.primary} style={{ marginRight: 4 }} />
											<span style={{...styles.trophyValue, ...{ color: tone }}}>{value}</span>
										</div>
									);
								})()}
							</div>
						</div>
						<div style={{...styles.infoWrap, ...{ width: '75%'}}>
							<Info
								username={getUsername()}
								tribe={getTribeName()}
							/>
						</div>
					</div>
				</div>
			</div>
			<div style={styles.actions}>
				<Button1 
					label="Fechar" 
					color={colors.secondary} 
					onClick={() => {
						// If this screen was opened from the HistoryModal, navigate back to Battle tab and reopen the modal
						const openedFromHistory = route?.params?.openedFromHistory;
						const openedFromHistoryBattleId = route?.params?.openedFromHistoryBattleId;
						if (openedFromHistory) {
							navigation.navigate('MainTabs', { screen: 'Battle', params: { reopenHistory: true, highlightBattleId: openedFromHistoryBattleId } };
						} else {
							// Default behavior: go back to Battle tab
							navigation.navigate('MainTabs', { initialTab: 1 }); // Tab 1 is Tribos where battles are usually accessed
						}
					}} 
					style={{ minWidth: 220, marginBottom: insets.bottom + 10 }} 
				/>
			</div>
		</div>
	);
}

function DeltaPill({ label, value, positiveColor, negativeColor, colors }) {
	const sign = typeof value === 'number' && value > 0 ? '+' : '';
	const tone = typeof value === 'number' && value !== 0 ? (value > 0 ? positiveColor : negativeColor) : colors.text;
	return (
		<div style={{...styles.deltaPill, ...{ borderColor: colors.text + '22'}}> 
			<span style={{...styles.deltaText, ...{ color: colors.text }}}>{label}</span>
			<span style={{...styles.deltaValue, ...{ color: tone }}}>{typeof value === 'number' ? `${sign}${value}` : '-'}</span>
		</div>
	);
}

// Transform API response from player1/player2 format to expected opponent format
function transformBattleApiResponse(apiResult, battleSessionId) {
	if (!apiResult || !apiResult.success) return null;
	
	// Get current user ID to determine which player is "me"
	const currentUser = getUserProfile();
	const currentUserId = currentUser?.id;
	
	// Determine which player is "me" and which is "opponent"
	const isPlayer1Me = apiResult.player1Id === currentUserId;
	const myData = isPlayer1Me ? {
		id: apiResult.player1Id,
		nickname: apiResult.player1Nickname,
		points: apiResult.player1Points,
		results: apiResult.player1Results,
		avatarUrl: apiResult.player1AvatarUrl,
		backgroundUrl: apiResult.player1BackgroundUrl,
		frameUrl: apiResult.player1FrameUrl,
		tribe: apiResult.player1Tribe
	} : {
		id: apiResult.player2Id,
		nickname: apiResult.player2Nickname,
		points: apiResult.player2Points,
		results: apiResult.player2Results,
		avatarUrl: apiResult.player2AvatarUrl,
		backgroundUrl: apiResult.player2BackgroundUrl,
		frameUrl: apiResult.player2FrameUrl,
		tribe: apiResult.player2Tribe
	};
	
	const opponentData = isPlayer1Me ? {
		id: apiResult.player2Id,
		nickname: apiResult.player2Nickname,
		points: apiResult.player2Points,
		results: apiResult.player2Results,
		avatarUrl: apiResult.player2AvatarUrl,
		backgroundUrl: apiResult.player2BackgroundUrl,
		frameUrl: apiResult.player2FrameUrl,
		tribe: apiResult.player2Tribe
	} : {
		id: apiResult.player1Id,
		nickname: apiResult.player1Nickname,
		points: apiResult.player1Points,
		results: apiResult.player1Results,
		avatarUrl: apiResult.player1AvatarUrl,
		backgroundUrl: apiResult.player1BackgroundUrl,
		frameUrl: apiResult.player1FrameUrl,
		tribe: apiResult.player1Tribe
	};
	
	// Calculate scores from results
	const myScore = myData.results ? myData.results.filter(r => r.correct === 1).length : 0;
	const opponentScore = opponentData.results ? opponentData.results.filter(r => r.correct === 1).length : 0;
	
	// Determine outcome - if battle hasn't ended, it's always pending
	let outcome;
	// Consider the battle ended if endedAt is a non-empty value that is not the literal string 'null' or '0'
	const endedAtRaw = apiResult.endedAt;
	const hasEnded = endedAtRaw !== null && endedAtRaw !== undefined && String(endedAtRaw).trim() !== '' && String(endedAtRaw).toLowerCase() !== 'null' && String(endedAtRaw) !== '0';
	if (!hasEnded) {
		outcome = 'pending';
	} else if (apiResult.winnerId === myData.id) {
		outcome = 'win';
	} else if (apiResult.winnerId === opponentData.id) {
		outcome = 'lose';
	} else {
		// endedAt is present but no winnerId -> it's a draw
		outcome = 'draw';
	}
	
	// Calculate timing data
	const myTotalMs = myData.results ? myData.results.reduce((sum, r) => sum + (r.timeMs || 0), 0) : 0;
	const opponentTotalMs = opponentData.results ? opponentData.results.reduce((sum, r) => sum + (r.timeMs || 0), 0) : 0;
	
	// Transform to expected format
	const transformedResult = {
		battleSessionId: battleSessionId,
		myScore: myScore,
		opponentScore: opponentScore,
		opponent: {
			id: opponentData.id,
			nickname: opponentData.nickname,
			name: opponentData.nickname,
			points: opponentData.points,
			trophies: opponentData.points,
			avatarUrl: opponentData.avatarUrl,
			backgroundUrl: opponentData.backgroundUrl,
			frameUrl: opponentData.frameUrl,
			teamName: opponentData.tribe,
			tribeName: opponentData.tribe,
			organizationName: opponentData.tribe
		},
		outcome: outcome,
		// Use the actual points from API for each player's delta
		pointsDelta: myData.points, // This is the current user's trophy change
		trophiesDelta: myData.points, // Same as pointsDelta
		// Store opponent's trophy change for display
		opponentTrophiesDelta: opponentData.points,
		totalQuestions: myData.results ? myData.results.length : 0,
		myTotalSec: Math.round(myTotalMs / 1000),
		opponentTotalSec: Math.round(opponentTotalMs / 1000),
		myAnswers: myData.results,
		opponentAnswers: opponentData.results,
		startedAt: apiResult.startedAt,
		endedAt: apiResult.endedAt,
		winnerId: apiResult.winnerId
	};
	
	return transformedResult;
}

function buildBattleSummary(sessionResult, fallback) {
	const myScore = sessionResult?.myScore ?? sessionResult?.score ?? fallback?.correct ?? null;
	const opponent = sessionResult?.opponent || sessionResult?.rival || null;
	const opponentScore = opponent?.score ?? sessionResult?.opponentScore ?? sessionResult?.rivalScore ?? null;
	const opponentName = opponent?.nickname || opponent?.name || 'Adversário';
	const trophiesDelta = sessionResult?.pointsDelta ?? sessionResult?.trophiesDelta ?? 0;
	const coins = typeof sessionResult?.coins === 'number' ? sessionResult.coins : null;

	let outcome = sessionResult?.outcome;
	if (!outcome && (myScore != null) && (opponentScore != null)) {
		if (myScore > opponentScore) outcome = 'win';
		else if (myScore < opponentScore) outcome = 'lose';
		else outcome = 'draw';
	}
	if (!outcome) outcome = 'draw';

	return { myScore, opponentScore, opponentName, trophiesDelta, coins, outcome };
}

// Helpers reused from ResultScreen1
function getUserProfile() {
	return DataManager.getUserProfile?.() || null;
}
function getStats() {
	return DataManager.getUserStats?.() || { points: 0, stars: 0, coins: 0 };
}
function getTribeName() {
	const tribe = DataManager.getUserTribe?.();
	const tribeName = tribe?.name;
	// Ensure we always return a string, not an object
	return (typeof tribeName === 'string' ? tribeName : 'Sem Tribo');
}
function getUsername() {
	const user = getUserProfile();
	if (!user) return 'Nickname';
	const nickname = user.nickname;
	const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
	// Ensure we always return a string, not an object
	if (typeof nickname === 'string' && nickname.length > 0) return nickname;
	if (typeof fullName === 'string' && fullName.length > 0) return fullName;
	return 'Nickname';
}
function safeImageSource(url) {
	if (!url || typeof url !== 'string') return null;
	return { uri: url };
}
function getAvatarSource() {
	const user = getUserProfile();
	return user?.avatarUrl ? safeImageSource(user.avatarUrl) : null;
}
function getBackgroundSource() {
	const user = getUserProfile();
	return user?.backgroundUrl ? safeImageSource(user.backgroundUrl) : null;
}
function getFrameSource() {
	const user = getUserProfile();
	return user?.frameUrl ? safeImageSource(user.frameUrl) : null;
}

// Build a sequence of statuses length N in the original order: 'correct' | 'incorrect' | 'timeout'
function extractAnswerSequence(sessionResult, who = 'me', fallback = { total: 0, correct: 0, timeout: 0 }) {
	const total = Math.max(0, Number(fallback.total) || 0);
	// Prefer explicit ordered arrays from the API
	const root = sessionResult || {};
	const opp = root.opponent || root.rival || {};
	const pools = who === 'me'
		? [
			root.myAnswers,
			root.answers,
			root.myResults,
			root.results,
			root.mySequence,
			root.sequence,
			root.answersList,
			root.myAnswersSequence,
		  ]
		: [
			opp.answers,
			root.opponentAnswers,
			opp.results,
			opp.sequence,
			root.opponentResults,
			root.opponentSequence,
			opp.answersList,
		  ];

	// Find the first array-like source
	const answers = pools.find(a => Array.isArray(a) && a.length > 0) || null;
	if (answers) {
		const normalized = answers.slice(0, total > 0 ? total : answers.length).map((item) => normalizeAnswerItem(item));
		// If total provided and normalized shorter, pad as 'incorrect' to match length
		if (total > 0 && normalized.length < total) {
			return normalized.concat(Array(total - normalized.length).fill('incorrect'));
		}
		return normalized;
	}

	// Fallback: synthesize from counts if no per-question breakdown (order cannot be known)
	const correct = Math.max(0, Number(fallback.correct) || 0);
	const timeout = Math.max(0, Number(fallback.timeout) || 0);
	const incorrect = Math.max(0, total - correct - timeout);
	const seq = [];
	// Keep a simple deterministic order: correct first, then incorrect, then timeout
	for (let i = 0; i < correct; i++) seq.push('correct');
	for (let i = 0; i < incorrect; i++) seq.push('incorrect');
	for (let i = 0; i < timeout; i++) seq.push('timeout');
	while (seq.length < total) seq.push('incorrect');
	return seq.slice(0, total);
}

// Normalize a single answer item from various possible shapes
function normalizeAnswerItem(v) {
	// Handle the API result object format
	if (v && typeof v === 'object' && typeof v.correct === 'number') {
		if (v.correct === 1) return 'correct';
		if (v.correct === 0) return 'timeout';
		if (v.correct === -1) return 'incorrect';
		return 'incorrect';
	}
	
	// Numeric codes: 1 correct, 0 timeout, -1 incorrect
	if (typeof v === 'number') {
		if (v === 1) return 'correct';
		if (v === 0) return 'timeout';
		return 'incorrect';
	}
	// String codes
	if (typeof v === 'string') {
		const s = v.toLowerCase();
		if (s === 'correct' || s === 'ok' || s === 'right') return 'correct';
		if (s === 'timeout' || s === 'no_time' || s === 'noTime' || s === 'time' || s === 'clock') return 'timeout';
		return 'incorrect';
	}
	// Object shapes
	if (v && typeof v === 'object') {
		// Booleans or status fields
		if (v.isTimeout || v.timeout) return 'timeout';
		if (typeof v.correct === 'boolean') return v.correct ? 'correct' : 'incorrect';
		if (typeof v.isCorrect === 'boolean') return v.isCorrect ? 'correct' : 'incorrect';
		if (typeof v.status === 'string') return normalizeAnswerItem(v.status);
		if (typeof v.result === 'string') return normalizeAnswerItem(v.result);
		if (typeof v.type === 'string') return normalizeAnswerItem(v.type);
	}
	return 'incorrect';
}

function inferTimeouts(sessionResult, who = 'me') {
	// Try to infer timeout count from API if present
	const key = who === 'me' ? 'myTimeouts' : 'opponentTimeouts';
	const val = sessionResult && typeof sessionResult[key] === 'number' ? sessionResult[key] : 0;
	return val;
}

// Extract total seconds spent in quiz for 'me' or 'opponent'
function extractTotalSeconds(sessionResult, who = 'me', fallback = null) {
	if (!sessionResult) return typeof fallback === 'number' ? fallback : 0;
	// Common naming variants
	const keys = who === 'me'
		? ['myTotalSec', 'myTotalSeconds', 'totalSec', 'elapsedSec', 'elapsedSeconds']
		: ['opponentTotalSec', 'opponentTotalSeconds', 'rivalTotalSec', 'rivalTotalSeconds'];
	for (const k of keys) {
		const v = sessionResult[k];
		if (typeof v === 'number' && isFinite(v)) return v;
	}
	return typeof fallback === 'number' ? fallback : 0;
}

function formatSeconds(sec) {
	const s = Math.max(0, Math.floor(Number(sec) || 0));
	const mm = Math.floor(s / 60);
	const ss = s % 60;
	const mmStr = String(mm).padStart(2, '0');
	const ssStr = String(ss).padStart(2, '0');
	return `${mmStr}:${ssStr}`;
}

// Hero ID to icon mapping for help indicators (based on Battle/Help.js)
const HERO_ICONS = {
	1: 'clock', // Hero 1 - Aumentar o tempo
	2: 'circle-minus', // Hero 2 - Retirar 1 resposta errada
	3: 'refresh-ccw', // Hero 3 - Trocar pergunta
	0: null // No help used
};function getHeroIcon(heroId) {
	return HERO_ICONS[heroId] || null;
}

// Component to display help icons used by a player
function HelpIcons({ helpsData, colors }) {
	if (!helpsData || helpsData.count === 0) {
		return <span style={{...styles.helpValue, ...{ color: colors.text }}}>-</span>;
	}
	
	// Show only icons if we have hero data
	if (helpsData.heroes && helpsData.heroes.length > 0) {
		return (
			<div style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
				{helpsData.heroes.slice(0, 4).map((heroId, index) => {
					const iconName = getHeroIcon(heroId);
					return iconName ? (
						<Icon 
							key={`${heroId}-${index}`} 
							name={iconName} 
							size={14} 
							color={colors.text} 
							style={{ marginHorizontal: 1 }}
						/>
					) : null;
				})}
				{helpsData.heroes.length > 4 && (
					<span style={{...styles.helpValue, ...{ color: colors.text}}>+{helpsData.heroes.length - 4}</span>
				)}
			</div>
		);
	}
	
	// Fallback: show count if no hero data available
	return <span style={{...styles.helpValue, ...{ color: colors.text }}}>{helpsData.count}</span>;
}

function extractHelpsUsed(sessionResult, who = 'me', fallback = 0) {
	if (!sessionResult) return { count: fallback, heroes: [] };
	
	// Get results array for the specified player
	const results = who === 'me' ? sessionResult.myAnswers : sessionResult.opponentAnswers;
	
	if (Array.isArray(results)) {
		// Count helps and collect hero IDs used
		const heroesUsed = results
			.map(r => r.heroUsedId || 0)
			.filter(heroId => heroId > 0); // Only count actual helps (not 0)
		
		return {
			count: heroesUsed.length,
			heroes: heroesUsed // Array of hero IDs used
		};
	}
	
	// Fallback to old logic if no results array
	const keys = who === 'me'
		? ['myHelps', 'myHelpsUsed', 'helps', 'helpsUsed']
		: ['opponentHelps', 'opponentHelpsUsed', 'rivalHelps', 'rivalHelpsUsed'];
	for (const k of keys) {
		const v = sessionResult[k];
		if (typeof v === 'number' && isFinite(v)) return { count: v, heroes: [] };
	}
	return { count: fallback, heroes: [] };
}

function mySafeNumber(v, d = 0) {
	const n = Number(v);
	return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : d;
}

function ResultsDots({ sequence = [], colors, dotSize = 30 }) {
	if (!Array.isArray(sequence) || sequence.length === 0) return null;
	return (
		<div style={styles.dotsRow}>
			{sequence.map((s, idx) => {
				let bg = colors.text + '22';
				let border = colors.text + '44';
				let iconName = 'x';
				let iconColor = colors.text;
				if (s === 'correct') { bg = '#1BA45B22'; border = '#1BA45B66'; iconName = 'check'; iconColor = '#1BA45B'; }
				else if (s === 'timeout') { bg = '#F59E0B22'; border = '#F59E0B66'; iconName = 'minus'; iconColor = '#F59E0B'; }
				else if (s === 'unknown') { bg = colors.text + '11'; border = colors.text + '55'; iconName = 'help-circle'; iconColor = colors.text; }
				else { bg = '#EF444422'; border = '#EF444466'; iconName = 'x'; iconColor = '#EF4444'; }
				const size = dotSize;
				const radius = Math.round(size / 2);
				return (
					<div key={idx} style={{...styles.dot, ...{ width: size}}> 
						<Icon name={iconName} size={12} color={iconColor} />
					</div>
				);
			})}
		</div>
	);
}

const styles = {
	safe: { flex: 1 },
	content: { flex: 1 },
	middle: { flex: 1, justifyContent: 'space-between' },
	header: {
		paddingHorizontal: 12,
		minHeight: 80,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: -20
	},
	quizTitle: { fontSize: 22, fontWeight: '800', fontFamily: family.bold, letterSpacing: 0.5, textAlign: 'center' },
	outcome: { marginTop: 6, fontSize: 18, fontWeight: '800', fontFamily: family.bold },
	bannerWrap: { paddingHorizontal: 12, paddingTop: 0 },
	infoWrap: { paddingHorizontal: 0, marginTop: 0 },
		userLabel: { textAlign: 'center', marginTop: 6, fontSize: 12, fontWeight: '700', fontFamily: family.bold },
	opponentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 0 },
	sideSpace: { width: '25%', alignItems: 'center', justifyContent: 'center' },
	// Simple inline trophy delta presentation
	trophyRow: { flexDirection: 'row', alignItems: 'center' },
	trophySign: { fontSize: 14, fontWeight: '900', fontFamily: family.bold, marginRight: 4 },
	trophyValue: { fontSize: 14, fontWeight: '900', fontFamily: family.bold },
	// VS section (vertical): user's score above, VS with bars, opponent's score below
	vsSection: { paddingHorizontal: 24, paddingVertical: 8, gap: 8 },
	vsDividerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 4 },
	vsBar: { height: StyleSheet.hairlineWidth, flex: 1, borderRadius: 2 },
	vsText: { fontSize: 16, fontWeight: '900', fontFamily: family.bold, letterSpacing: 1 },
	vsScoreAbove: { alignItems: 'center', justifyContent: 'center' },
	vsScoreBelow: { alignItems: 'center', justifyContent: 'center' },
	scoreLabelSmall: { fontSize: 12, fontWeight: '700', fontFamily: family.bold },
	scoreValueBig: { fontSize: 28, fontWeight: '900', fontFamily: family.bold },
	// dots row
	dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
	dot: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
	// Combined time and help row
	timeHelpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 32 },
	timeSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
	helpSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
	// time rows under dots
	timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, gap: 6 },
	timeLabel: { fontSize: 12, fontWeight: '700', fontFamily: family.bold, marginRight: 4 },
	timeValue: { fontSize: 12, fontWeight: '900', fontFamily: family.bold },
	// help rows under time
	helpRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, gap: 6 },
	helpLabel: { fontSize: 12, fontWeight: '700', fontFamily: family.bold, marginRight: 4 },
	helpValue: { fontSize: 12, fontWeight: '900', fontFamily: family.bold },
	deltaWrap: { paddingHorizontal: 12, marginTop: 12 },
	deltaPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
	deltaText: { fontSize: 14, fontWeight: '600', fontFamily: family.semibold },
	deltaValue: { fontSize: 14, fontWeight: '900', fontFamily: family.bold },
	actions: { width: '100%', alignItems: 'center', marginTop: 50, paddingHorizontal: 12 },
	bottomGlow: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 260 },
	loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 32 },
	loadingText: { fontSize: 16, fontWeight: '600', fontFamily: family.semibold, textAlign: 'center' },
};

