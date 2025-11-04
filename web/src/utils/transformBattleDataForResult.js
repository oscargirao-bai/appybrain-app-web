export function transformBattleDataForResult(battleData) {
	if (!battleData) return null;

	const sessionResult = {
		battleSessionId: battleData.battleSessionId,
		myScore: battleData.myScore || battleData.score,
		opponentScore: battleData.opponentScore || battleData.rivalScore,
		opponent: battleData.opponent || battleData.rival,
		outcome: battleData.outcome || battleData.status,
		pointsDelta: battleData.pointsDelta || battleData.trophiesDelta,
		coins: battleData.coins,
		totalQuestions: battleData.totalQuestions || battleData.total,
		myTotalSec: battleData.myTotalSec || battleData.totalSec,
		opponentTotalSec: battleData.opponentTotalSec || battleData.rivalTotalSec,
		myHelps: battleData.myHelps || battleData.helpsUsed,
		opponentHelps: battleData.opponentHelps || battleData.rivalHelps,
		myAnswers: battleData.myAnswers || battleData.answers,
		opponentAnswers: battleData.opponentAnswers || battleData.rivalAnswers,
		// Spread any remaining fields for downstream consumers
		...battleData
	};

	return {
		correct: battleData.myScore || battleData.score || 0,
		total: battleData.totalQuestions || battleData.total || 0,
		totalSec: battleData.myTotalSec || battleData.totalSec || 0,
		quizType: 'battle',
		title: 'Batalha 1v1',
		battleSessionId: battleData.battleSessionId,
		sessionResult
	};
}

export default transformBattleDataForResult;