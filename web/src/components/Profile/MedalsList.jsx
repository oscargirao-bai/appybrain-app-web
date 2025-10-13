import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import MedalButton from './MedalButton.jsx';

/**
 * MedalsList: paginated grid of medal icons (placeholder logic) with active/inactive styling & page dots.
 * Props:
 *  - medals: Array<{ id: string, icon: string, unlocked: boolean }>
 *  - perPage (default dynamic: 8) - two rows x 4 columns layout (adjusts on tablet to maybe 5 columns if wide?)
 */
// Static fallback array (avoid recreating each render)
const COMMON_META = {
  title: 'caca',
  description: 'Faz logins em dias consecutivos. L1=3, L2=7, L3=14…',
  level: 3,
  current: 4,
  target: 7,
  hideLevel: false,
};
const FALLBACK_MEDALS = [
	{ id: 'login', icon: 'log-in', unlocked: true, new: true, ...COMMON_META },
	{ id: 'streak', icon: 'calendar-check', unlocked: true, ...COMMON_META },
	{ id: 'trophy', icon: 'trophy', unlocked: false, ...COMMON_META },
	{ id: 'flag', icon: 'flag', unlocked: false, new: true, ...COMMON_META },
	{ id: 'shield', icon: 'shield-check', unlocked: false, ...COMMON_META },
	{ id: 'list', icon: 'list-checks', unlocked: false, ...COMMON_META },
	{ id: 'medal', icon: 'medal', unlocked: false, ...COMMON_META },
	{ id: 'target', icon: 'target', unlocked: false, new: true, ...COMMON_META },
	{ id: 'rocket', icon: 'rocket', unlocked: false, ...COMMON_META },
	{ id: 'gem', icon: 'gem', unlocked: false, ...COMMON_META },
	{ id: 'login2', icon: 'log-in', unlocked: true, ...COMMON_META },
	{ id: 'streak2', icon: 'calendar-check', unlocked: true, new: true, ...COMMON_META },
	{ id: 'trophy2', icon: 'trophy', unlocked: false, ...COMMON_META },
	{ id: 'flag2', icon: 'flag', unlocked: false, ...COMMON_META },
	{ id: 'shield2', icon: 'shield-check', unlocked: false, new: true, ...COMMON_META },
	{ id: 'list2', icon: 'list-checks', unlocked: false, ...COMMON_META },
	{ id: 'medal2', icon: 'medal', unlocked: false, ...COMMON_META },
	{ id: 'target2', icon: 'target', unlocked: false, ...COMMON_META },
	{ id: 'rocket2', icon: 'rocket', unlocked: false, ...COMMON_META },
	{ id: 'gem2', icon: 'gem', unlocked: false, new: true, ...COMMON_META },
];

const ROWS = 3;
const CELL_HEIGHT = 92; // 58 circle + paddings/gap
const ARROW_ZONE = 56; // physical margins so badges never go under arrows

export default function MedalsList({ medals: medalsProp, style, title = 'Medalhas', onMedalPress }) {
	const colors = useThemeColors();
	const width = window.innerWidth;
	// Visible window width (excludes the left/right arrow zones)
	const [windowWidth, setWindowWidth] = useState(Math.min(550, width) - ARROW_ZONE * 2);

	// Use provided medals or fallback static list
	const medals = medalsProp && medalsProp.length ? medalsProp : FALLBACK_MEDALS;

	// Always show 5 columns per page and keep them centered within the window
	const columnsPerScreen = 5;
	const rows = ROWS; // requested: 3 rows on web
	const [page, setPage] = useState(0); // virtual page (for dots)

	// Build columns: each column holds 'rows' medals stacked vertically so we can scroll horizontally
	// Local state to drop new highlight after press (copy of input medals)
	const [internalMedals, setInternalMedals] = useState(medals);
	useEffect(() => {
		// Only update internal state if the incoming reference changes meaningfully
		setInternalMedals(medals);
	}, [medals]);

	const columnData = useMemo(() => {
		const cols = [];
		for (let i = 0; i < internalMedals.length; i++) {
			const colIndex = Math.floor(i / rows);
			if (!cols[colIndex]) cols[colIndex] = [];
			const m = internalMedals[i];
			// Support both `newMedal` and the requested `new` flag as aliases
			const isNew = !!(m.newMedal || m.new);
			cols[colIndex].push({ ...m, justUnlocked: m.unlocked && isNew, _isNew: isNew });
		}
		return cols;
	}, [internalMedals]);

	const totalColumns = columnData.length;
	const pages = Math.ceil(totalColumns / columnsPerScreen);

	const scrollerRef = useRef(null);
	const windowRef = useRef(null);
	// Each column takes a fixed width so that exactly 5 columns fit the visible area
	const cellWidth = Math.floor(windowWidth / columnsPerScreen);

	useEffect(() => {
		function measure() {
			const ww = windowRef.current?.clientWidth || (Math.min(550, window.innerWidth) - ARROW_ZONE * 2);
			setWindowWidth(ww);
		}
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	function handleScroll(e) {
		const offsetX = e.currentTarget.scrollLeft;
		const virtual = Math.round(offsetX / windowWidth);
		if (virtual !== page) setPage(virtual);
	}

	function goToPage(i) {
		if (!scrollerRef.current) return;
		scrollerRef.current.scrollTo({ left: i * windowWidth, behavior: 'smooth' });
	}

	function goStep(dir) {
		if (!scrollerRef.current) return;
		const left = scrollerRef.current.scrollLeft;
		const next = Math.max(0, Math.min((pages - 1) * windowWidth, left + dir * windowWidth));
		scrollerRef.current.scrollTo({ left: next, behavior: 'smooth' });
	}

		return (
			<div style={{ ...styles.wrapper, ...(style || {}) }}>
				<span style={{ ...styles.title, color: colors.text }}>{title}</span>
					<div style={{ ...styles.carouselWrap, height: ROWS * CELL_HEIGHT }}>
					<button aria-label="prev" onClick={() => goStep(-1)} style={{ ...styles.arrowBtn, left: 0 }}>
						‹
					</button>
					<div ref={windowRef} style={{ ...styles.windowWrap, marginLeft: ARROW_ZONE, marginRight: ARROW_ZONE }}>
						<div
							ref={scrollerRef}
							onScroll={handleScroll}
							style={{ ...styles.scroller, height: ROWS * CELL_HEIGHT, scrollSnapType: 'x mandatory' }}
						>
							{columnData.map((col, index) => (
								<div key={'col-' + index} style={{ ...styles.column, width: cellWidth, height: ROWS * CELL_HEIGHT, scrollSnapAlign: 'start', paddingLeft: 6, paddingRight: 6 }}>
								{col.map((it, idx) => (
									<MedalButton
										key={it.id + '-' + index + '-' + idx}
										item={it}
										onClick={() => {
											if (onMedalPress) onMedalPress(it);
											setInternalMedals(prev => prev.map(m => m.id === it.id ? { ...m, newMedal: false, new: false } : m));
										}}
									/>
								))}
							</div>
						))}
						</div>
					</div>
					<button aria-label="next" onClick={() => goStep(1)} style={{ ...styles.arrowBtn, right: 0 }}>
						›
					</button>
				</div>
				<div style={styles.dotsRow}>
					{Array.from({ length: pages }).map((_, i) => (
						<button key={i} onClick={() => goToPage(i)} style={{ ...styles.dot, ...(i === page ? { backgroundColor: colors.primary } : {}) }} />
					))}
				</div>
			</div>
		);
}

const styles = {
	wrapper: { width: '100%', marginTop: 28 },
	title: { fontSize: 18, fontFamily: family.bold, fontWeight: '700', marginBottom: 14, marginLeft: 16 },
	column: { display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' },
	carouselWrap: { position: 'relative', overflow: 'hidden' },
	windowWrap: { width: '100%', boxSizing: 'border-box' },
	scroller: { display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollBehavior: 'smooth' },
	dotsRow: { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 10 },
	dot: {
		width: 10,
		height: 10,
		borderRadius: 10,
		backgroundColor: '#ffffff33',
	},
	arrowBtn: {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		zIndex: 1,
		width: 36,
		height: 36,
		borderRadius: 18,
		border: 'none',
		backgroundColor: '#00000066',
		color: '#fff',
		cursor: 'pointer',
	},
};




