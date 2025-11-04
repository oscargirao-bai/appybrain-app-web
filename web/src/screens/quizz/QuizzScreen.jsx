import React, { useEffect, useMemo, useRef, useState } from 'react';


import { useThemeColors } from '../../services/Theme.jsx';
import apiManagerInstance from '../../services/ApiManager.jsx';
import DataManager from '../../services/DataManager.jsx';
import QuizzHeader from '../../components/Quizz/Header.jsx';
import Question from '../../components/Quizz/Question.jsx';
import Answer from '../../components/Quizz/Answer.jsx';
import ConfirmModal from '../../components/General/ConfirmModal.jsx';
import SolutionModal from '../../components/Quizz/SolutionModal.jsx';
import BattleHelp from '../../components/Battle/Help.jsx';

// Recebe navigation/route via props do AppRouter

export default function QuizzScreen({ navigation, route }) {
		const colors = useThemeColors();
		const {
			quiz,
			challengeId,
			battleMode,
			friendlyMode = false,
			battleSessionId = null,
			friendlyPayload = null,
			prefetchedBattleData = null,
		} = route.params || {};

		// Determine quiz type and parameters based on navigation
		const isChallenge = !!challengeId;
		const isBattle = !!battleMode;
		const quizType = isChallenge ? 'challenge' : (isBattle ? 'battle' : 'learn');
		const title = isChallenge ? 'Desafio' : (isBattle ? 'Batalha' : (quiz?.title || 'Quiz'));
		
		// Only calculate difficulty and contentId for learn quizzes
		const difficulty = !isBattle && !isChallenge ? (quiz?.difficulty || 'easy') : null;
		const contentId = !isBattle && !isChallenge ? (quiz?.id || quiz?.contentId) : null; // Use 'id' property from content item, fallback to contentId

		// Function to randomize answer positions
		const randomizeAnswers = (answers) => {
			// Check user preference for answer randomization
			const shouldRandomize = DataManager.shouldRandomizeAnswers();
			if (!shouldRandomize) return answers;
			
			// Fisher-Yates shuffle algorithm
			const shuffled = [...answers];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled;
		};

		// Function to transform API response to component format
		const transformApiQuestions = (apiQuestions) => {
			return apiQuestions.map((apiQ, index) => {
				const answers = JSON.parse(apiQ.answers || '[]');
				const options = answers.map((answer, idx) => ({
					id: String.fromCharCode(97 + idx), // 'a', 'b', 'c', 'd'
					html: answer, // Use html instead of text so LaTeX can be processed
				}));

				// The correct answer is always the first one (index 0) from the API
				const correctAnswerContent = answers[0];
				const shuffledOptions = randomizeAnswers(options);
				
				// Find the correct option after shuffling by matching content
				const correctOption = shuffledOptions.find(opt => opt.html === correctAnswerContent);
				const correctId = correctOption ? correctOption.id : 'a'; // fallback to 'a' if not found

				// Explanation field (server may use different keys). We try a few common ones.
				const explanation = apiQ.explanation_html || apiQ.explanationHtml || apiQ.explanation || apiQ.answerExplanation || apiQ.solution || null;

				return {
					id: `q${index + 1}`,
					html: apiQ.question,
					options: shuffledOptions,
					correctId: correctId,
					timeSec: apiQ.timeSec || 60,
					quizId: apiQ.quizId,
					difficulty: apiQ.difficulty, // Preserve difficulty for help system
					explanation, // Pass explanation for SolutionModal (supports HTML/LaTeX)
				};
			});
		};

		const [questions, setQuestions] = useState([]);
		const [sessionId, setSessionId] = useState(null);
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(null);
		const [remaining, setRemaining] = useState(60);
		const [selectedAnswerId, setSelectedAnswerId] = useState(null);
		const [qIndex, setQIndex] = useState(0);
		const [showExitConfirm, setShowExitConfirm] = useState(false);
		const [showSolution, setShowSolution] = useState(false);
		const [modalCorrectOption, setModalCorrectOption] = useState(null); // Store correct option when modal opens
		const [helpUsed, setHelpUsed] = useState(false); // allow only one help per quiz
		const [usedHelpId, setUsedHelpId] = useState(null); // track which help was used
		const [replaceQuestions, setReplaceQuestions] = useState([]); // store replace questions for help 3
		const [removedAnswerIds, setRemovedAnswerIds] = useState([]); // track removed answers for help 1
		const [currentMaxTime, setCurrentMaxTime] = useState(60); // track current max time for timer UI (can be extended by help)
		const timerRef = useRef(null);
		const questionStartTimeRef = useRef(null);
		const inputLockedRef = useRef(false);
        // Stats tracking
        const [correctCount, setCorrectCount] = useState(0);
        const totalElapsedMsRef = useRef(0);

		const [activeBattleSessionId, setActiveBattleSessionId] = useState(battleSessionId);

		const applyQuizResponse = React.useCallback((response) => {
			if (!response || !response.questions || response.success === false) {
				const message = response?.message || 'Failed to load quiz questions';
				throw new Error(message);
			}

			const transformedQuestions = transformApiQuestions(response.questions);
			setQuestions(transformedQuestions);
			if (response.sessionId) {
				setSessionId(response.sessionId);
			}
			if (isBattle && response.replace_questions) {
				const transformedReplaceQuestions = transformApiQuestions(response.replace_questions);
				setReplaceQuestions(transformedReplaceQuestions);
			}

			if (isBattle && response.battleSessionId) {
				setActiveBattleSessionId(response.battleSessionId);
			}
		}, [isBattle, setActiveBattleSessionId, transformApiQuestions]);

		// Fetch quiz questions from API (or use prefetched data)
		useEffect(() => {
			let isCancelled = false;

			const loadQuiz = async () => {
				try {
					setLoading(true);
					setError(null);

					if (isBattle && prefetchedBattleData) {
						applyQuizResponse(prefetchedBattleData);
						return;
					}

					let response;
					if (isChallenge) {
						response = await apiManagerInstance.getQuizQuestions('challenge', challengeId, null);
					} else if (isBattle) {
						const battlePayload = friendlyMode
							? (friendlyPayload || { battleSessionId: activeBattleSessionId, quizType: 'friendly' })
							: activeBattleSessionId;
						response = await apiManagerInstance.getQuizQuestions('battle', battlePayload, null);
					} else {
						response = await apiManagerInstance.getQuizQuestions('learn', contentId, difficulty);
					}

					applyQuizResponse(response);
				} catch (err) {
					if (!isCancelled) {
						console.error('Error fetching quiz questions:', err);
						setError(err.message);
					}
				} finally {
					if (!isCancelled) {
						setLoading(false);
					}
				}
			};

			loadQuiz();

			return () => {
				isCancelled = true;
			};
		}, [activeBattleSessionId, applyQuizResponse, challengeId, contentId, difficulty, friendlyMode, friendlyPayload, isBattle, isChallenge, prefetchedBattleData]);

		const current = questions[qIndex] || questions[0];
		const currentTimeSec = current?.timeSec || 60;

		// Function to submit answer result to API
		const [sessionResult, setSessionResult] = useState(null); // Store final API response
		const sessionResultRef = useRef(null); // Also store in ref for immediate access

		const submitAnswerResult = async (answerType) => {
			if (!sessionId || !current?.quizId || questionStartTimeRef.current === null) {
				console.warn('Missing data for answer submission:', { sessionId, quizId: current?.quizId, startTime: questionStartTimeRef.current });
				return null;
			}

			try {
				const timeMs = Date.now() - questionStartTimeRef.current;
				// Accumulate total elapsed time for the quiz
				totalElapsedMsRef.current += Math.max(0, timeMs);
				
				// Convert answerType to correct field value:
				// 'correct' -> 1, 'timeout' -> 0, 'incorrect' -> -1
				let correctValue;
				switch (answerType) {
					case 'correct':
						correctValue = 1;
						break;
					case 'timeout':
						correctValue = 0;
						break;
					case 'incorrect':
						correctValue = -1;
						break;
					default:
						console.warn('Unknown answer type:', answerType);
						correctValue = -1; // Default to incorrect
				}
				
				
				// Only submit helpId if it was used for this specific question
				const helpIdToSubmit = usedHelpId && usedHelpId !== 3 ? usedHelpId : null;
				
				const response = await apiManagerInstance.submitAnswerResult(
					sessionId,
					current.quizId,
					correctValue,
					timeMs,
					helpIdToSubmit // pass the used help ID (null for help 3 as it's submitted separately)
				);
				
				// Store the final result if session is finished
				if (response?.sessionFinished) {
					setSessionResult(response);
					sessionResultRef.current = response; // Store in ref for immediate access
				}
				
				return response;
			} catch (error) {
				console.error('Failed to submit answer result:', error);
				// Don't block the user experience if API call fails
				return null;
			}
		};

		// Function to refresh user data when quiz ends
		const refreshUserData = async () => {
			try {
				if (isChallenge) {
					// For challenge quizzes, only refresh userInfo and challenges (sequential)
					await DataManager.refreshSection('userInfo');
					await DataManager.refreshSection('challenges');
				} else {
					// For learn and battle quizzes, refresh sections sequentially
					await DataManager.refreshSection('userInfo');
					await DataManager.refreshSection('disciplines');
					await DataManager.refreshSection('userStars');
					await DataManager.refreshSection('chests');
					if (friendlyMode) {
						await DataManager.refreshFriendlyBattles();
					}
				}
			} catch (error) {
				console.error('Failed to refresh user data:', error);
				// Don't block navigation if refresh fails
			}
		};

		// Function to handle quiz completion and navigation
		const handleQuizCompletion = async (finalCorrectCount = null) => {
			await refreshUserData();
			// Compute a simple score summary
			const total = questions.length;
			// Use the latest correct count (from arg if provided to avoid async state race)
			const correct =
				typeof finalCorrectCount === 'number' ? finalCorrectCount : correctCount;
			const totalSec = Math.max(0, totalElapsedMsRef.current) / 1000;
			
			// Use ref value to get the most recent session result
			const currentSessionResult = sessionResultRef.current;
			
			// Prepare navigation params with session result if available
			const navParams = { 
				correct, 
				total, 
				totalSec, 
				quizType, 
				title,
				sessionResult: currentSessionResult, // Pass the API response data
				battleSessionId: currentSessionResult?.battleSessionId || activeBattleSessionId || null,
				hidePoints: friendlyMode,
				openedFromFriendly: friendlyMode
			};
			
			
			// Small delay to ensure data subscribers apply updates
				setTimeout(() => {
					if (quizType === 'battle') {
						navigation.replace('Result2', navParams);
					} else {
						navigation.replace('Result1', navParams);
					}
				}, 100);
		};

		// Function to handle timeout scenario
		const handleTimeout = async () => {
			// Prevent multi-execution if already handling a timeout
			if (inputLockedRef.current) return;
			inputLockedRef.current = true;

			
			// Submit timeout result to API
			await submitAnswerResult('timeout');

			// Show timeout feedback and move to next question
			setTimeout(async () => {
				if (qIndex < questions.length - 1) {
					// Move to next question
					setQIndex(qIndex + 1);
					setSelectedAnswerId(null);
					setRemovedAnswerIds([]); // Reset removed answers for new question
					setUsedHelpId(null); // Reset help ID (but keep helpUsed true)
					setRemaining(questions[qIndex + 1]?.timeSec || 60);
					inputLockedRef.current = false;
					questionStartTimeRef.current = Date.now();
				} else {
					// End of quiz
					await refreshUserData();
					
					// Use ref value to get the most recent session result
					const currentSessionResult = sessionResultRef.current;
					
					// Prepare navigation params with session result if available
					const navParams = {
						correct: correctCount,
						total: questions.length,
						totalSec: Math.round(totalElapsedMsRef.current / 1000),
						quizType,
						title,
						sessionResult: currentSessionResult, // Pass the API response data
						battleSessionId: currentSessionResult?.battleSessionId || activeBattleSessionId || null,
						hidePoints: friendlyMode,
						openedFromFriendly: friendlyMode
					};
					
					if (quizType === 'battle') {
						navigation.navigate('Result2', navParams);
					} else {
						navigation.navigate('Result1', navParams);
					}
				}
			}, 1500); // Show timeout state for 1.5 seconds
		};

		// Timer effect - reset when current question changes
		useEffect(() => {
			setRemaining(currentTimeSec);
			setCurrentMaxTime(currentTimeSec); // Initialize max time for new question
			questionStartTimeRef.current = Date.now(); // Track when question starts
			// Unlock input for the new question
			inputLockedRef.current = false;
			if (timerRef.current) clearInterval(timerRef.current);
			timerRef.current = setInterval(() => {
				setRemaining((r) => (r > 0 ? r - 1 : 0));
			}, 1000);
			// Force MathJax typeset after question change (delay to allow DOM mount)
			if (typeof window !== 'undefined' && window.MathJax) {
				const el = document.querySelector('[data-quiz-root]');
				setTimeout(() => {
					try {
						// Prefer typesetClear+typesetPromise for fresh render
						if (window.MathJax.typesetClear) {
							window.MathJax.typesetClear();
						}
						if (window.MathJax.typesetPromise) {
							window.MathJax.typesetPromise(el ? [el] : undefined).catch(()=>{});
						}
					} catch(e) {
						console.warn('MathJax force typeset error:', e);
					}
				}, 40);
			}
			return () => { if (timerRef.current) clearInterval(timerRef.current); };
		}, [currentTimeSec, qIndex]);

		// Also re-typeset after closing solution modal (state transition showSolution -> false)
		useEffect(() => {
			if (!showSolution) {
				if (typeof window !== 'undefined' && window.MathJax) {
					setTimeout(() => {
						try {
							if (window.MathJax.typesetPromise) {
								window.MathJax.typesetPromise();
							}
						} catch(err) {
							console.warn('MathJax re-typeset after modal close failed:', err);
						}
					}, 50);
				}
			}
		}, [showSolution]);

		useEffect(() => {
			if (remaining === 0) {
				if (timerRef.current) clearInterval(timerRef.current);
				// Handle timeout: auto-submit as timeout and move to next question
				handleTimeout();
			}
		}, [remaining]);

		// Show loading state
		if (loading) {
			return (
				<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>
					<div style={styles.loadingContainer}>
						<div size="large" color={colors.primary} />
						<span style={{...styles.loadingText, ...{ color: colors.text }}}>
							A carregar perguntas...
						</span>
					</div>
				</div>
			);
		}

		// Show error state
		if (error && questions.length === 0) {
			return (
				<div style={{...styles.safe, ...{ backgroundColor: colors.background }}}>
					<div style={styles.loadingContainer}>
						<span style={{...styles.errorText, ...{ color: colors.textSecondary }}}>
							Erro ao carregar perguntas
						</span>
						<span style={{...styles.errorSubtext, ...{ color: colors.textSecondary }}}>
							Verifica a tua ligação à internet
						</span>
					</div>
				</div>
			);
		}

		return (
			<div style={{...styles.safe, ...{ backgroundColor: colors.background }}} data-quiz-root>      
				<QuizzHeader
					title={title}
					totalSec={currentMaxTime}
					remainingSec={remaining}
					onClose={() => setShowExitConfirm(true)}
				/>
				<div style={styles.body}>
					<div style={styles.questionWrapper}>
						<Question key={current?.id || qIndex} html={current?.html} />
						{/* Battle helps appear only in battle mode, between question and answers */}
						{isBattle && (
										<BattleHelp
										disabled={helpUsed}
										onAddTime={() => {
											if (helpUsed) return;
											// Help 2: Add 30 seconds to timer
											setRemaining((r) => {
												const newTime = r + 30;
												// If new time exceeds current max, update the max time for timer UI
												if (newTime > currentMaxTime) {
													setCurrentMaxTime(newTime);
												}
												return newTime;
											});
											setHelpUsed(true);
											setUsedHelpId(2);
											
										}}
										onRemoveWrong={() => {
											if (helpUsed) return;
											// Help 1: Remove one wrong answer option
											const currentOptions = current?.options || [];
											const wrongOptions = currentOptions.filter(opt => opt.id !== current?.correctId);
											if (wrongOptions.length > 0) {
												// Remove one random wrong option
												const randomIndex = Math.floor(Math.random() * wrongOptions.length);
												const optionToRemove = wrongOptions[randomIndex];
												setRemovedAnswerIds(prev => [...prev, optionToRemove.id]);
												
											}
											setHelpUsed(true);
											setUsedHelpId(1);
										}}
										onSwapQuestion={async () => {
											if (helpUsed) return;
											// Help 3: Swap current question with one from replace_questions with same difficulty
											const currentDifficulty = current?.difficulty;
											const availableReplacements = replaceQuestions.filter(q => q.difficulty === currentDifficulty);
											
											if (availableReplacements.length > 0) {
												// Submit current question as correct with timeMs = null
												try {
													await apiManagerInstance.submitAnswerResult(
														sessionId,
														current.quizId,
														1, // correct
														null, // timeMs = null
														3 // heroUsedId = 3 for question swap
													);
													
													// Replace current question with a random one from available replacements
													const randomReplacement = availableReplacements[Math.floor(Math.random() * availableReplacements.length)];
													
													// Update questions array
													setQuestions(prevQuestions => {
														const newQuestions = [...prevQuestions];
														newQuestions[qIndex] = randomReplacement;
														return newQuestions;
													});
													
													// Remove the used replacement from available ones
													setReplaceQuestions(prev => prev.filter(q => q.quizId !== randomReplacement.quizId));
													
													// Reset question state
													setSelectedAnswerId(null);
													setRemovedAnswerIds([]);
													const newQuestionTime = randomReplacement?.timeSec || 60;
													setRemaining(newQuestionTime);
													setCurrentMaxTime(newQuestionTime); // Reset max time for new question
													questionStartTimeRef.current = Date.now();
													inputLockedRef.current = false;
													
													// Restart timer
													if (timerRef.current) {
														clearInterval(timerRef.current);
													}
													timerRef.current = setInterval(() => {
														setRemaining((r) => (r > 0 ? r - 1 : 0));
													}, 1000);
												} catch (error) {
													console.error('Error submitting help 3 result:', error);
												}
											}
											
											setHelpUsed(true);
											setUsedHelpId(3);
										}}
									/>
								)}
							</div>
							<div style={styles.answersWrap}>
																<Answer
																	options={(current?.options || []).filter(opt => !removedAnswerIds.includes(opt.id))}
																	correctId={current?.correctId}
																	selectedId={selectedAnswerId}
																	resetKey={current?.id}
																	onSelect={async (id) => {
																		// Prevent multi-tap: ignore if already handling a selection
																		if (inputLockedRef.current) return;
																		inputLockedRef.current = true;
																		setSelectedAnswerId(id);
																		// Stop the countdown immediately after a selection
																		if (timerRef.current) {
																			clearInterval(timerRef.current);
																			timerRef.current = null;
																		}
																		const isCorrect = id === current?.correctId;
										
																		// Submit answer result to API and accumulate time
																		await submitAnswerResult(isCorrect ? 'correct' : 'incorrect');
																		// Update correct count locally to avoid async state race
																		const nextCorrect = correctCount + (isCorrect ? 1 : 0);

																		if (isCorrect) {
																			setCorrectCount((c) => c + 1);
																		}
																		
																		// brief delay to let the tap animation play
																		setTimeout(async () => {
																			setSelectedAnswerId(null);
																			if (!isCorrect) {
																				// Capture the current question's correct option before showing modal
																				const currentCorrectOption = (current?.options || []).find(o => o.id === current?.correctId);
																				setModalCorrectOption(currentCorrectOption);
																				setShowSolution(true);
																			} else {
																				if (qIndex < questions.length - 1) {
																					setQIndex(qIndex + 1);
																					setRemovedAnswerIds([]); // Reset removed answers for new question
																					setUsedHelpId(null); // Reset help ID (but keep helpUsed true)
																				} else {
																					await handleQuizCompletion(nextCorrect);
																				}
																			}
																		}, 350);
																	}}
																			/>
					{(inputLockedRef.current || selectedAnswerId !== null || showSolution) && (
						<div 							style={styles.touchBlocker}
							pointerEvents="auto"
							onStartShouldSetResponder={() => true}
						/>
					)}
				</div>
			</div>
									<SolutionModal
										visible={showSolution}
										correctOption={modalCorrectOption}
										explanation={current?.explanation}
										quizId={current?.quizId}
										onReport={async () => {
											// Report functionality is now handled inside SolutionModal
											setShowSolution(false);
											setModalCorrectOption(null); // Clear stored correct option
											if (qIndex < questions.length - 1) {
												setQIndex(qIndex + 1);
												setRemovedAnswerIds([]); // Reset removed answers for new question
												setUsedHelpId(null); // Reset help ID (but keep helpUsed true)
											} else {
												await handleQuizCompletion(correctCount);
											}
										}}
										onClose={async () => {
											setShowSolution(false);
											setModalCorrectOption(null); // Clear stored correct option
											if (qIndex < questions.length - 1) {
												setQIndex(qIndex + 1);
												setRemovedAnswerIds([]); // Reset removed answers for new question
												setUsedHelpId(null); // Reset help ID (but keep helpUsed true)
											} else {
												await handleQuizCompletion(correctCount);
											}
										}}
									/>
						<ConfirmModal
							visible={showExitConfirm}
							message={'Queres sair do quiz? O teu progresso nesta tentativa será perdido.'}
							cancelLabel="Continuar"
							confirmLabel="Sair"
							destructive
							onCancel={() => setShowExitConfirm(false)}
							onConfirm={async () => {
								if (timerRef.current) clearInterval(timerRef.current);
								setShowExitConfirm(false);
								
								// Handle quiz quit if we have sessionId and remaining questions
								if (sessionId && questions.length > 0 && qIndex < questions.length) {
									try {
										// Get remaining quiz IDs (questions not yet answered)
										const remainingQuizIds = questions
											.slice(qIndex) // Get questions from current index onwards
											.map(q => q.quizId)
											.filter(id => id != null); // Filter out any null/undefined IDs
										
										
										if (remainingQuizIds.length > 0) {
											// Call quit API
											const quitResponse = await apiManagerInstance.quitQuiz(sessionId, remainingQuizIds);
											
											// Update user stats from quit response
											if (quitResponse && quitResponse.success) {
												DataManager.updateStatsFromQuitResponse(quitResponse, quizType);
												// Refresh user data and related sections based on quiz type
												try {
													await DataManager.refreshSection('userInfo');
													// Refresh quiz-type specific data sequentially
													if (quizType === 'learn') {
														await DataManager.refreshSection('disciplines');
														await DataManager.refreshSection('userStars');
													} else if (quizType === 'challenge') {
														await DataManager.refreshSection('challenges');
													}
													
													// Small delay to ensure subscribers get notified
													await new Promise(resolve => setTimeout(resolve, 100));
												} catch (refreshError) {
													console.warn('Failed to refresh data after quit:', refreshError);
												}
											}
										}
									} catch (error) {
										console.error('Failed to quit quiz properly:', error);
										// Continue with navigation even if quit API fails
									}
								}
								
								navigation.goBack();
							}}
						/>
			</div>
		);
}

const styles = {
	safe: { flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' },
	body: { flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 16, paddingRight: 16, overflow: 'hidden' },
	questionWrapper: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'auto' },
	answersWrap: { paddingBottom: 8, paddingTop: 8 },
	touchBlocker: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 10,
		pointerEvents: 'auto',
	},
	placeholder: { fontSize: 16 },
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 16, paddingRight: 16,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		textAlign: 'center',
	},
	errorText: {
		fontSize: 18,
		textAlign: 'center',
		marginBottom: 8,
	},
	errorSubtext: {
		fontSize: 14,
		textAlign: 'center',
	},
};

