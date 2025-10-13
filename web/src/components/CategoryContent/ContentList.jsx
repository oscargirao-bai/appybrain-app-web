import React, { useCallback, useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import ConfirmModal from '../General/ConfirmModal.jsx';
import { family } from '../../constants/font.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import MathJaxRenderer from '../General/MathJaxRenderer.jsx';

function containsMathMarkers(str) {
	if (!str) return false;
	return /(\$\$[^$]+\$\$|\$[^$]+\$|\\\(|\\\)|\\\[|\\\]|\\frac|\\sqrt|\\sum|\\int)/.test(str);
}

// Star component using SVG
function Star({ size = 18, lit = false, color = '#FFD700', borderColor = '#ccc' }) {
	const pathData = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
			<path
				d={pathData}
				fill={lit ? color : 'transparent'}
				stroke={borderColor}
				strokeWidth="2"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

function addAlpha(hex, alpha) {
	if (!hex || hex.startsWith('rgb')) return hex;
	let h = hex.replace('#','');
	if (h.length === 3) h = h.split('').map(c=>c+c).join('');
	const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
	return `rgba(${r},${g},${b},${alpha})`;
}

const DIFFICULTIES = [
	{ key: 'easy', label: 'Fácil' },
	{ key: 'hard', label: 'Difícil' },
	{ key: 'genius', label: 'Génio' },
];

const DIFFICULTY_COLORS = {
	easy: '#27ae60',
	hard: '#F77E1D',
	genius: '#e20000ff',
};

function DifficultySelector({ value, onChange, starsByDifficulty, onConfirm, iconColor }) {
	const colors = useThemeColors();
	
	const isDifficultyUnlocked = (difficulty) => {
		if (!starsByDifficulty) return true;
		switch (difficulty) {
			case 'easy':
				return true;
			case 'hard':
				return starsByDifficulty.easy > 0;
			case 'genius':
				return starsByDifficulty.hard > 0;
			default:
				return true;
		}
	};
	
	return (
		<div style={styles.diffRow}>
			{DIFFICULTIES.map((d) => {
				const active = value === d.key;
				const unlocked = isDifficultyUnlocked(d.key);
				const difficultyStars = starsByDifficulty?.[d.key] || 0;
				const diffColor = DIFFICULTY_COLORS[d.key];
				
				const btnStyle = {
					...styles.diffBtn,
					backgroundColor: diffColor,
					borderColor: active ? (iconColor || colors.border) : 'transparent',
					borderWidth: 2,
					borderStyle: 'solid',
					boxShadow: active ? `0 4px 6px rgba(0,0,0,0.25)` : `0 2px 3px rgba(0,0,0,0.15)`,
					opacity: unlocked ? 1 : 0.4,
					cursor: unlocked ? 'pointer' : 'not-allowed',
				};
				
				return (
					<div key={d.key} style={styles.diffCol}>
						<div style={styles.smallStarsRow}>
							{[0,1,2].map(i => {
								const lit = difficultyStars > i;
								return (
									<div key={i} style={{ marginLeft: 2, marginRight: 2, opacity: lit ? 1 : 0.4 }}>
										<Star size={18} lit={lit} color="#FFD700" borderColor={iconColor || colors.border} />
									</div>
								);
							})}
						</div>
						<button
							onClick={() => {
								if (unlocked) {
									onChange(d.key);
									onConfirm && onConfirm(d.key);
								}
							}}
							style={btnStyle}
							onMouseOver={(e) => {
								if (unlocked) e.currentTarget.style.opacity = '0.85';
							}}
							onMouseOut={(e) => {
								if (unlocked) e.currentTarget.style.opacity = '1';
							}}
							aria-label={unlocked ? `Selecionar dificuldade ${d.label}` : `Dificuldade ${d.label} bloqueada`}
							disabled={!unlocked}
						>
							<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
								<span style={styles.diffText}>{d.label}</span>
								{!unlocked && (
									<LucideIcon name="lock" size={14} color="#fff" style={{ marginLeft: 4 }} />
								)}
							</div>
						</button>
					</div>
				);
			})}
		</div>
	);
}

function StarBadge({ stars, max, color }) {
	const colors = useThemeColors();
	const badgeStyle = {
		...styles.starBadge,
		borderColor: color,
		borderWidth: 2,
		borderStyle: 'solid'
	};
	return (
		<div style={badgeStyle}>
			<LucideIcon name="star" size={14} color={color || colors.primary} style={{ marginRight: 4 }} />
			<span style={{ ...styles.starBadgeText, color: color }}>{stars}/{max}</span>
		</div>
	);
}

function StudyButton({ onPress, colors, iconColor }) {
	const btnStyle = {
		...styles.studyBtn,
		backgroundColor: colors.accent,
		borderColor: colors.border,
		borderWidth: 2,
		borderStyle: 'solid',
	};
	return (
		<button
			onClick={onPress}
			style={btnStyle}
			onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
			onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
			aria-label="Estudar conteúdo"
		>
			<LucideIcon name="book-open" size={18} color={colors.onAccent} style={{ marginRight: 8 }} />
			<span style={{ ...styles.studyText, color: colors.onAccent }}>Estudar Conteúdo</span>
		</button>
	);
}

function AccordionItem({ item, expanded, onToggle, difficulty, onChangeDifficulty, onPressStudy, onAskConfirm, starsByDifficulty }) {
	const colors = useThemeColors();
	const [showFullTitle, setShowFullTitle] = useState(false);

	const baseColor = item.color || colors.primary;
	const iconColor = item.iconColor || colors.text;
	
	useEffect(() => {
		if (expanded) {
			const timer = setTimeout(() => setShowFullTitle(true), 300);
			return () => clearTimeout(timer);
		} else {
			setShowFullTitle(false);
		}
	}, [expanded]);
	
	const containerStyle = {
		...styles.itemContainer,
		backgroundColor: baseColor,
		borderColor: baseColor,
		borderWidth: 2,
		borderStyle: 'solid',
	};
	
	return (
		<div style={containerStyle}>
			<button
				onClick={onToggle}
				style={styles.topRow}
				onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
				onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
				aria-label={`Abrir conteúdo ${item.title}. ${item.stars} de ${item.maxStars} estrelas.`}
			>
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
					<span 
						style={{
							...styles.titleText,
							color: iconColor,
							WebkitLineClamp: showFullTitle ? 'unset' : 3,
							display: showFullTitle ? 'block' : '-webkit-box',
							WebkitBoxOrient: 'vertical',
							overflow: showFullTitle ? 'visible' : 'hidden',
						}}
					>
						{item.title}
					</span>
					<StarBadge stars={item.stars} max={item.maxStars} color={iconColor} />
				</div>
				<LucideIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={iconColor} />
			</button>
			{expanded && (
				<div style={styles.expandedBody}>
					<MathJaxRenderer
						content={item.description || 'Sem descrição'}
						enabled={true}
						baseFontSize={14}
						textColor={iconColor}
						compact={true}
						padding={0}
						as="div"
						style={{ ...styles.descText, color: iconColor }}
					/>
					<DifficultySelector
						value={difficulty}
						onChange={onChangeDifficulty}
						starsByDifficulty={starsByDifficulty}
						onConfirm={(selectedKey) => onAskConfirm(item, selectedKey)}
						iconColor={iconColor}
					/>
					<StudyButton onPress={() => onPressStudy && onPressStudy()} colors={colors} iconColor={iconColor} />
				</div>
			)}
		</div>
	);
}

export default function ContentList({ data, onPressStudy, onStudy, starsByDifficulty, navigation }) {
	const [openId, setOpenId] = useState(null);
	const [difficultyMap, setDifficultyMap] = useState({});
	const [pendingQuiz, setPendingQuiz] = useState(null);

	const closeConfirm = useCallback(() => setPendingQuiz(null), []);
	const confirmStart = useCallback(() => {
		if (pendingQuiz) {
			const payload = { ...pendingQuiz.item, difficulty: pendingQuiz.difficulty };
			setPendingQuiz(null);
			navigation.navigate('Quizz', { quiz: payload });
		}
	}, [pendingQuiz, navigation]);

	const toggle = useCallback((id) => {
		setOpenId((prev) => (prev === id ? null : id));
	}, []);

	const changeDifficulty = useCallback((id, diff) => {
		setDifficultyMap((prev) => ({ ...prev, [id]: diff }));
	}, []);

	return (
		<>
			<div style={styles.listContainer}>
				{data.map((item) => {
					const diff = difficultyMap[item.id] || 'easy';
					const itemStarsByDifficulty = starsByDifficulty?.[item.id];
					return (
						<AccordionItem
							key={item.id}
							item={item}
							expanded={openId === item.id}
							onToggle={() => toggle(item.id)}
							difficulty={diff}
							onChangeDifficulty={(d) => changeDifficulty(item.id, d)}
							onPressStudy={() => {
								const handler = onStudy || onPressStudy;
								if (handler) handler({ ...item, difficulty: diff });
							}}
							onAskConfirm={(it, d) => setPendingQuiz({ item: it, difficulty: d })}
							starsByDifficulty={itemStarsByDifficulty}
						/>
					);
				})}
			</div>
			<ConfirmModal
				visible={!!pendingQuiz}
				title="Iniciar Quiz?"
				message={pendingQuiz ? `Iniciar quiz "${pendingQuiz.item.title}" na dificuldade ${labelForDifficulty(pendingQuiz.difficulty)}?` : ''}
				onCancel={closeConfirm}
				onConfirm={confirmStart}
				confirmLabel="Sim"
				cancelLabel="Não"
			/>
		</>
	);
}

function labelForDifficulty(key) {
	switch (key) {
		case 'easy': return 'Fácil';
		case 'hard': return 'Difícil';
		case 'genius': return 'Génio';
		default: return key;
	}
}

const styles = {
	listContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		paddingBottom: 200,
	},
	itemContainer: {
		borderRadius: 16,
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 14,
		paddingBottom: 14,
	},
	topRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		padding: 0,
		transition: 'opacity 0.2s',
	},
	titleText: {
		fontSize: 16,
		fontFamily: family.bold,
		fontWeight: '700',
		flex: 1,
		paddingRight: 8,
		textAlign: 'left',
	},
	starBadge: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 4,
		paddingBottom: 4,
		borderRadius: 20,
		marginRight: 8,
	},
	starBadgeText: {
		fontSize: 12,
		fontFamily: family.bold,
		fontWeight: '700',
	},
	expandedBody: {
		marginTop: 12,
		display: 'flex',
		flexDirection: 'column',
	},
	descText: {
		fontSize: 14,
		fontFamily: family.regular,
		marginBottom: 12,
		lineHeight: '1.4',
	},
	diffRow: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 8,
		gap: 12,
	},
	diffCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	smallStarsRow: {
		display: 'flex',
		flexDirection: 'row',
		marginBottom: 4,
	},
	diffBtn: {
		flex: 1,
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 4,
		paddingRight: 4,
		borderRadius: 16,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minWidth: 90,
		transition: 'opacity 0.2s',
	},
	diffText: {
		fontSize: 16,
		fontFamily: family.bold,
		fontWeight: '700',
		letterSpacing: 0.3,
		color: '#fff',
	},
	studyBtn: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 14,
		paddingBottom: 14,
		borderRadius: 14,
		cursor: 'pointer',
		transition: 'opacity 0.2s',
	},
	studyText: {
		fontSize: 16,
		fontFamily: family.bold,
		fontWeight: '700',
	},
};
