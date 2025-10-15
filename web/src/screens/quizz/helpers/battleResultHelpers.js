import DataManager from '../../../services/DataManager.jsx';

const HERO_ICON_MAP = {
  1: 'clock',
  2: 'circle-minus',
  3: 'refresh-ccw',
};

export function getUserProfile() {
  return DataManager.getUserProfile?.() || null;
}

export function getUserStats() {
  return DataManager.getUserStats?.() || { points: 0, stars: 0, coins: 0 };
}

export function getUserIdentity(fallbackTribe) {
  const user = getUserProfile();
  const nickname = user?.nickname;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  return {
    username: typeof nickname === 'string' && nickname.length > 0 ? nickname : (fullName || 'Nickname'),
    tribe: (() => {
      const t = user?.tribeName || user?.teamName || user?.organizationName || null;
      if (!t) return (fallbackTribe || 'Sem Tribo');
      if (typeof t === 'string') return t;
      if (typeof t === 'object' && typeof t.name === 'string') return t.name;
      return (fallbackTribe || 'Sem Tribo');
    })(),
  };
}

export function getUserBannerSources() {
  const user = getUserProfile();
  return {
    avatarSource: safeImageSource(user?.avatarUrl),
    bannerImageSource: safeImageSource(user?.backgroundUrl),
    frameSource: safeImageSource(user?.frameUrl),
  };
}

export function safeImageSource(url) {
  if (!url || typeof url !== 'string') return null;
  return { uri: url };
}

export function transformBattleApiResponse(apiResult, battleSessionId) {
  if (!apiResult || !apiResult.success) return null;

  const currentUser = getUserProfile();
  const currentUserId = currentUser?.id;

  const isPlayer1Me = apiResult.player1Id === currentUserId;
  const myData = extractPlayerData(apiResult, isPlayer1Me ? 1 : 2);
  const opponentData = extractPlayerData(apiResult, isPlayer1Me ? 2 : 1);

  const myScore = countCorrect(myData.results);
  const opponentScore = countCorrect(opponentData.results);

  const outcome = determineOutcome(apiResult, myData.id, opponentData.id);

  const myTotalSec = sumTimeSeconds(myData.results);
  const opponentTotalSec = sumTimeSeconds(opponentData.results);

  return {
    battleSessionId,
    myScore,
    opponentScore,
    opponent: {
      id: opponentData.id,
      nickname: opponentData.nickname,
      name: opponentData.nickname,
      points: opponentData.points,
      trophies: opponentData.points,
      avatarUrl: opponentData.avatarUrl,
      backgroundUrl: opponentData.backgroundUrl,
      frameUrl: opponentData.frameUrl,
      teamName: (typeof opponentData.tribe === 'object' && opponentData.tribe?.name) ? opponentData.tribe.name : (typeof opponentData.tribe === 'string' ? opponentData.tribe : ''),
      tribeName: (typeof opponentData.tribe === 'object' && opponentData.tribe?.name) ? opponentData.tribe.name : (typeof opponentData.tribe === 'string' ? opponentData.tribe : ''),
      organizationName: (typeof opponentData.tribe === 'object' && opponentData.tribe?.name) ? opponentData.tribe.name : (typeof opponentData.tribe === 'string' ? opponentData.tribe : ''),
      coins: opponentData.coins,
      stars: opponentData.stars,
    },
    outcome,
    pointsDelta: myData.points,
    trophiesDelta: myData.points,
    opponentTrophiesDelta: opponentData.points,
    totalQuestions: Array.isArray(myData.results) ? myData.results.length : 0,
    myTotalSec,
    opponentTotalSec,
    myAnswers: myData.results,
    opponentAnswers: opponentData.results,
    myTimeouts: myData.timeouts,
    opponentTimeouts: opponentData.timeouts,
    myHelps: myData.helps,
    opponentHelps: opponentData.helps,
    startedAt: apiResult.startedAt,
    endedAt: apiResult.endedAt,
    winnerId: apiResult.winnerId,
  };
}

function extractPlayerData(result, index) {
  const base = index === 1 ? 'player1' : 'player2';
  return {
    id: result[`${base}Id`],
    nickname: result[`${base}Nickname`],
    points: result[`${base}Points`],
    results: result[`${base}Results`],
    avatarUrl: result[`${base}AvatarUrl`],
    backgroundUrl: result[`${base}BackgroundUrl`],
    frameUrl: result[`${base}FrameUrl`],
    tribe: result[`${base}Tribe`],
    coins: result[`${base}Coins`],
    stars: result[`${base}Stars`],
    helps: result[`${base}Helps`],
    timeouts: result[`${base}Timeouts`],
  };
}

function countCorrect(results) {
  if (!Array.isArray(results)) return 0;
  return results.filter((item) => normalizeAnswerItem(item) === 'correct').length;
}

function sumTimeSeconds(results) {
  if (!Array.isArray(results)) return 0;
  const totalMs = results.reduce((sum, item) => sum + (item?.timeMs || 0), 0);
  return Math.round(totalMs / 1000);
}

function determineOutcome(apiResult, myId, opponentId) {
  const endedAt = apiResult?.endedAt;
  const hasEnded = endedAt !== null && endedAt !== undefined && String(endedAt).trim() !== '' && String(endedAt).toLowerCase() !== 'null' && String(endedAt) !== '0';
  if (!hasEnded) return 'pending';
  if (apiResult.winnerId === myId) return 'win';
  if (apiResult.winnerId === opponentId) return 'lose';
  return 'draw';
}

export function buildBattleSummary(sessionResult, fallback) {
  const myScore = sessionResult?.myScore ?? sessionResult?.score ?? fallback?.correct ?? null;
  const opponent = sessionResult?.opponent || sessionResult?.rival || null;
  const opponentScore = opponent?.score ?? sessionResult?.opponentScore ?? sessionResult?.rivalScore ?? null;
  const opponentName = opponent?.nickname || opponent?.name || 'Adversário';
  const trophiesDelta = sessionResult?.pointsDelta ?? sessionResult?.trophiesDelta ?? 0;
  const coins = typeof sessionResult?.coins === 'number' ? sessionResult.coins : null;

  let outcome = sessionResult?.outcome;
  if (!outcome && myScore != null && opponentScore != null) {
    if (myScore > opponentScore) outcome = 'win';
    else if (myScore < opponentScore) outcome = 'lose';
    else outcome = 'draw';
  }
  if (!outcome) outcome = 'draw';

  return { myScore, opponentScore, opponentName, trophiesDelta, coins, outcome };
}

export function extractAnswerSequence(sessionResult, who, fallback) {
  const total = Math.max(0, Number(fallback?.total) || 0);
  const sourcePools = pickAnswerPools(sessionResult, who);
  const answers = sourcePools.find((list) => Array.isArray(list) && list.length > 0) || null;

  if (answers) {
    const normalized = answers.slice(0, total > 0 ? total : answers.length).map((item) => normalizeAnswerItem(item));
    if (total > 0 && normalized.length < total) {
      return normalized.concat(Array(total - normalized.length).fill('incorrect'));
    }
    return normalized;
  }

  const correct = Math.max(0, Number(fallback?.correct) || 0);
  const timeout = Math.max(0, Number(fallback?.timeout) || 0);
  const incorrect = Math.max(0, total - correct - timeout);
  const sequence = [];
  for (let i = 0; i < correct; i++) sequence.push('correct');
  for (let i = 0; i < incorrect; i++) sequence.push('incorrect');
  for (let i = 0; i < timeout; i++) sequence.push('timeout');
  while (sequence.length < total) sequence.push('incorrect');
  return sequence.slice(0, total);
}

function pickAnswerPools(sessionResult, who) {
  const root = sessionResult || {};
  const opponent = root.opponent || root.rival || {};
  if (who === 'me') {
    return [
      root.myAnswers,
      root.answers,
      root.myResults,
      root.results,
      root.mySequence,
      root.sequence,
      root.answersList,
      root.myAnswersSequence,
    ];
  }
  return [
    opponent.answers,
    root.opponentAnswers,
    opponent.results,
    opponent.sequence,
    root.opponentResults,
    root.opponentSequence,
    opponent.answersList,
  ];
}

export function normalizeAnswerItem(value) {
  if (!value) return 'incorrect';
  if (typeof value === 'object' && typeof value.correct === 'number') {
    if (value.correct === 1) return 'correct';
    if (value.correct === 0) return 'timeout';
    if (value.correct === -1) return 'incorrect';
  }
  if (typeof value === 'number') {
    if (value === 1) return 'correct';
    if (value === 0) return 'timeout';
    return 'incorrect';
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (['correct', 'ok', 'right'].includes(normalized)) return 'correct';
    if (['timeout', 'notime', 'no_time', 'time', 'clock', 'no time'].includes(normalized)) return 'timeout';
    if (['unknown'].includes(normalized)) return 'unknown';
    return 'incorrect';
  }
  if (typeof value === 'object') {
    if (value.isTimeout || value.timeout) return 'timeout';
    if (typeof value.correct === 'boolean') return value.correct ? 'correct' : 'incorrect';
    if (typeof value.isCorrect === 'boolean') return value.isCorrect ? 'correct' : 'incorrect';
    if (typeof value.status === 'string') return normalizeAnswerItem(value.status);
    if (typeof value.result === 'string') return normalizeAnswerItem(value.result);
    if (typeof value.type === 'string') return normalizeAnswerItem(value.type);
  }
  return 'incorrect';
}

export function inferTimeouts(sessionResult, who) {
  const key = who === 'me' ? 'myTimeouts' : 'opponentTimeouts';
  const value = sessionResult && typeof sessionResult[key] === 'number' ? sessionResult[key] : 0;
  return value;
}

export function extractTotalSeconds(sessionResult, who, fallback) {
  if (!sessionResult) return typeof fallback === 'number' ? fallback : 0;
  const keys = who === 'me'
    ? ['myTotalSec', 'myTotalSeconds', 'totalSec', 'elapsedSec', 'elapsedSeconds']
    : ['opponentTotalSec', 'opponentTotalSeconds', 'rivalTotalSec', 'rivalTotalSeconds'];
  for (const key of keys) {
    const value = sessionResult[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return typeof fallback === 'number' ? fallback : 0;
}

export function extractHelpsUsed(sessionResult, who, fallback = 0) {
  if (!sessionResult) return { count: fallback, heroes: [] };
  const results = who === 'me' ? sessionResult.myAnswers : sessionResult.opponentAnswers;
  if (Array.isArray(results)) {
    const heroes = results
      .map((item) => item?.heroUsedId || 0)
      .filter((heroId) => heroId > 0);
    return { count: heroes.length, heroes };
  }
  const keys = who === 'me'
    ? ['myHelps', 'myHelpsUsed', 'helps', 'helpsUsed']
    : ['opponentHelps', 'opponentHelpsUsed', 'rivalHelps', 'rivalHelpsUsed'];
  for (const key of keys) {
    const value = sessionResult[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return { count: value, heroes: [] };
    }
  }
  return { count: fallback, heroes: [] };
}

export function formatSeconds(value) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getHeroIcon(heroId) {
  return HERO_ICON_MAP[heroId] || null;
}

export function isBattleFinal(outcome) {
  return outcome === 'win' || outcome === 'lose' || outcome === 'draw';
}

export function getOpponentIdentity(opponent, fallbackName, fallbackTribe) {
  const name = typeof opponent?.nickname === 'string' && opponent.nickname.length > 0
    ? opponent.nickname
    : typeof opponent?.name === 'string' && opponent.name.length > 0
      ? opponent.name
      : fallbackName;
  const tribeCandidate = opponent?.teamName || opponent?.tribeName || opponent?.organizationName;
  const tribe = typeof tribeCandidate === 'string' && tribeCandidate.length > 0 ? tribeCandidate : fallbackTribe;
  return { username: name, tribe };
}
