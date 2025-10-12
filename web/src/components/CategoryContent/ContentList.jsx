import React, { useCallback, useState, useEffect } from 'react';
import {LayoutAnimation, UIManager} from 'react-native';
import SvgIcon from '../../components/General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import ConfirmModal from '../General/ConfirmModal';
import Svg, { Path } from 'react-native-svg';
import { family } from '../../constants/font';
import MathJaxRenderer from '../General/MathJaxRenderer';

// Detect simple LaTeX markers
function containsMathMarkers(str) {
	if (!str) return false;
	return /(\$\$[^$]+\$\$|\$[^$]+\$|\\\(|\\\)|\\\[|\\\]|\\frac|\\sqrt|\\sum|\\int)/.test(str);
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
	try { UIManager.setLayoutAnimationEnabledExperimental(true); } catch {}
}

// Custom Star component using SVG for precise border and fill control
function Star({ size = 18, lit = false, color = '#FFD700', borderColor = '#ccc' }) {
	return (
		<div style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
			<Svg width={size} height={size} viewBox="0 0 24 24">
				<Path
					d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
					fill={lit ? color : 'transparent'}
					stroke={borderColor}
					strokeWidth="2"
					strokeLinejoin="round"
				/>
			</Svg>
		</div>
	);
}

// Utilitário simples para aplicar alpha a uma cor hex (fallback para retornar se já rgb/rgba)
function addAlpha(hex, alpha) {
	if (!hex || hex.startsWith('rgb')) return hex;
	let h = hex.replace('#','');
	if (h.length === 3) h = h.split('').map(c=>c+c).join('');
	const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
	return `rgba(${r},${g},${b},${alpha})`;
}

// Item shape expected:
// { id: string, order: string | number, title: string, description?: string, stars: number, maxStars: number }
// This list renders expandable (accordion) rows similar to the provided screenshot.

const DIFFICULTIES = [
	{ key: 'easy', label: 'Fácil' },
	{ key: 'hard', label: 'Difícil' },
	{ key: 'genius', label: 'Génio' },
];

// Cores específicas por dificuldade (apenas UMA cor por dificuldade)
const DIFFICULTY_COLORS = {
	easy: '#27ae60',   // verde
	hard: '#F77E1D',   // laranja
	genius: '#e20000ff', // vermelho
};

function DifficultySelector({ value, onChange, stars, starsByDifficulty, onConfirm, iconColor }) {
	const colors = useThemeColors();
	
	// Check if a difficulty level is unlocked based on previous difficulty stars
	const isDifficultyUnlocked = (difficulty) => {
		if (!starsByDifficulty) return true; // Fallback: allow all if no star data
		
		switch (difficulty) {
			case 'easy':
				return true; // Easy is always unlocked
			case 'hard':
				return starsByDifficulty.easy > 0; // Hard unlocked if user has at least 1 star in easy
			case 'genius':
				return starsByDifficulty.hard > 0; // Genius unlocked if user has at least 1 star in hard
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
				
				return (
					<div key={d.key} style={styles.diffCol}> 
						<div style={styles.smallStarsRow}> 
							{[0,1,2].map(i => {
								const lit = difficultyStars > i;
								return (
									<div key={i} style={{ marginHorizontal: 2, opacity: lit ? 1 : 0.4 }}>
										<Star size={18} lit={lit} color="#FFD700" borderColor={iconColor || colors.border} />
									</div>
								);
							})}
						</div>
						<button 							onClick={() => {
								if (unlocked) {
									// Muda imediatamente a dificuldade e abre confirmação já com a seleção atual
									onChange(d.key);
									onConfirm && onConfirm(d.key);
								}
							}}
							style={({ pressed }) => {
								const diffColor = DIFFICULTY_COLORS[d.key];
								return [
									styles.diffBtn,
									{
										// Sempre usar a mesma cor para a dificuldade
										backgroundColor: diffColor,
										borderColor: active ? (iconColor || colors.border) : 'transparent',
										borderWidth: active ? 2 : 2,
										shadowColor: '#000',
										shadowOpacity: active ? 0.25 : 0.15,
										shadowRadius: active ? 6 : 3,
										shadowOffset: { width: 0, height: active ? 4 : 2 },
										elevation: active ? 4 : 1,
										opacity: unlocked ? 1 : 0.4, // Dimmed when locked
									},
									pressed && unlocked && { opacity: 0.85 },
								];
							}}
							
							aria-label={unlocked ? `Selecionar dificuldade ${d.label}` : `Dificuldade ${d.label} bloqueada`}
							disabled={!unlocked}
						>
							<div style={{ flexDirection: 'row', alignItems: 'center' }}>
								<span style={{...styles.diffText, ...{ color: '#fff' }}}>{d.label}</span>
								{!unlocked && (
									<SvgIcon name="lock" size={14} color="#fff" style={{ marginLeft: 4 }} />
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

	return (
		<div style={{...styles.starBadge, ...{ borderColor: color }}}> 
			<SvgIcon name="star" size={14} color={color || colors.primary} style={{ marginRight: 4 }} />
			<span style={{...styles.starBadgeText, ...{ color: colors.iconColor }}}>{stars}/{max}</span>
		</div>
	);
}

function StudyButton({ onPress }) {
	const colors = useThemeColors();
	return (
		<button 			onClick={onPress}
			style={({ pressed }) => [styles.studyBtn, { backgroundColor: colors.accent, borderColor: colors.border }, pressed && { opacity: 0.9 }]}
			
			aria-label="Estudar conteúdo"
		>
			<SvgIcon name="book-open" size={18} color={colors.onAccent} style={{ marginRight: 8 }} />
			<span style={{...styles.studyText, ...{ color: colors.onAccent }}}>Estudar Conteúdo</span>
		</button>
	);
}

function AccordionItem({ item, expanded, onToggle, difficulty, onChangeDifficulty, onPressStudy, onAskConfirm, starsByDifficulty }) {
	const colors = useThemeColors();
	const [showFullTitle, setShowFullTitle] = useState(false);
  const wantsMath = containsMathMarkers(item.description);

	const baseColor = item.color || colors.primary;
	const containerBg = addAlpha(baseColor, 0.5);
	
	// Handle title expansion with delay after box animation
	useEffect(() => {
		if (expanded) {
			// Delay title expansion to happen after box animation completes
			const timer = setTimeout(() => setShowFullTitle(true), 300);
			return () => clearTimeout(timer);
		} else {
			setShowFullTitle(false);
		}
	}, [expanded]);
	
	return (
		<div style={{...styles.itemContainer, ...{ backgroundColor: baseColor}}> 
			<button 				onClick={onToggle}
				style={({ pressed }) => [styles.topRow, pressed && { opacity: 0.85 }]}
				
				aria-label={`Abrir conteúdo ${item.title}. ${item.stars} de ${item.maxStars} estrelas.`}
			>
				<div style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
					<span 
						style={{...styles.titleText, ...{ color: item.iconColor }}} 
						numberOfLines={showFullTitle ? undefined : 3}
					>
						{item.title}
					</span>
					<StarBadge stars={item.stars} max={item.maxStars} color={item.iconColor} />
				</div>
				<SvgIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={item.iconColor} />
			</button>
			{expanded && (
				<div style={styles.expandedBody}>
					{wantsMath ? (
						<MathJaxRenderer
							content={item.description || 'Sem descrição'}
							enabled={true}
							baseFontSize={14}
							textColor={item.iconColor}
							compact
							padding={0}
						/>
					) : (
						<span style={{...styles.descText, ...{ color: item.iconColor }}}>{item.description || 'Sem descrição'}</span>
					)}
					{/* Confirm modal agora APENAS ao clicar nas dificuldades */}
					<DifficultySelector
						value={difficulty}
						onChange={onChangeDifficulty}
						stars={item.stars}
						starsByDifficulty={starsByDifficulty}
						onConfirm={(selectedKey) => onAskConfirm(item, selectedKey)}
						iconColor={item.iconColor}
					/>
					{/* Botão Estudar dispara ação direta (sem confirmação) */}
					<StudyButton onClick={() => onPressStudy && onPressStudy()} />
				</div>
			)}
		</div>
	);
}

export default function ContentList({ data, onPressStudy, starsByDifficulty }) {
	const [openId, setOpenId] = useState(null); // which item expanded
	const [difficultyMap, setDifficultyMap] = useState({}); // id -> difficulty key
	const [pendingQuiz, setPendingQuiz] = useState(null); // { item, difficulty }
  const navigation = useNavigation();

	const closeConfirm = useCallback(() => setPendingQuiz(null), []);
	const confirmStart = useCallback(() => {
		if (pendingQuiz) {
			const payload = { ...pendingQuiz.item, difficulty: pendingQuiz.difficulty });
			//console.log('ContentList: Navigating to quiz with payload:', payload);
			setPendingQuiz(null);
			// Go directly to Quizz screen with selected content + difficulty
			navigation.navigate('Quizz', { quiz: payload });
			// Note: Do NOT call onPressStudy here as that would trigger study navigation
		}
	}, [pendingQuiz, navigation]);

	const toggle = useCallback((id) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setOpenId((prev) => (prev === id ? null : id));
	}, []);

	const changeDifficulty = useCallback((id, diff) => {
		setDifficultyMap((prev) => ({ ...prev, [id]: diff }));
	}, []);

	const renderItem = useCallback(({ item }) => {
		const diff = difficultyMap[item.id] || 'easy';
		const itemStarsByDifficulty = starsByDifficulty?.[item.id];
		return (
			<AccordionItem
				item={item}
				expanded={openId === item.id}
				onToggle={() => toggle(item.id)}
				difficulty={diff}
				onChangeDifficulty={(d) => changeDifficulty(item.id, d)}
				// Estudar conteúdo (sem confirmação)
				onPressStudy={() => onPressStudy && onPressStudy({ ...item, difficulty: diff })}
				// Abrir confirmação apenas quando o utilizador toca numa dificuldade
				onAskConfirm={(it, d) => setPendingQuiz({ item: it, difficulty: d })}
				starsByDifficulty={itemStarsByDifficulty}
			/>
		);
	}, [openId, difficultyMap, toggle, changeDifficulty, onPressStudy, starsByDifficulty]);

	return (
		<>
			<div 				data={data}
				keyExtractor={(it) => it.id}
				renderItem={renderItem}
				ItemSeparatorComponent={() => <div style={{ height: 12 }} />}
				contentContainerStyle={{ paddingBottom: 200 }}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={<EmptyState />}
			/>
			<ConfirmModal
				visible={!!pendingQuiz}
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

function EmptyState() {
	const colors = useThemeColors();
	return (
		<div style={{ paddingVertical: 48 }}>
			<span style={{ textAlign: 'center', color: colors.muted }}>Sem conteúdos</span>
		</div>
	);
}

const styles = {
	itemContainer: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
	topRow: { flexDirection: 'row', alignItems: 'center' },
	orderText: { fontSize: 16, fontFamily: family.bold, marginRight: 6, width: 54 },
	titleText: { fontSize: 16, fontFamily: family.bold, flex: 1, paddingRight: 8 },
	starBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8 },
	starBadgeText: { fontSize: 12, fontFamily: family.bold },
	expandedBody: { marginTop: 12 },
	descText: { fontSize: 14, fontFamily: family.regular, marginBottom: 12 },
	// removed progressBar styles
	starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16, marginTop: 4 },
	diffRow: { flexDirection: 'row', marginBottom: 8 },
	diffCol: { flex: 1, alignItems: 'center', marginRight: 12 },
	smallStarsRow: { flexDirection: 'row', marginBottom: 4 },
	diffBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 0, minWidth: 90 },
	diffText: { fontSize: 16, fontFamily: family.bold, letterSpacing: 0.3 },
	studyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 2 },
	studyText: { fontSize: 16, fontFamily: family.bold },
};

