import React, { useMemo, useState, useRef, useEffect } from 'react';
import {Easing} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../../components/General/SvgIcon';
import SvgIcon from '../General/SvgIcon';
import { family } from '../../constants/font';

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

export default function MedalsList({
	medals: medalsProp,
	style,
	title = 'Medalhas',
	onMedalPress,
}) {
	const colors = useThemeColors();
	const width = window.innerWidth; const height = window.innerHeight;

	// Use provided medals or fallback static list
	const medals = medalsProp && medalsProp.length ? medalsProp : FALLBACK_MEDALS;

	const columnsPerScreen = width >= 768 ? 5 : 4; // how many columns fully visible per viewport
	const rows = 2;
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

	const flatRef = useRef(null);
	const cellWidth = width / columnsPerScreen;

	function handleScroll(e) {
		const offsetX = e.nativeEvent.contentOffset.x;
		const virtual = Math.round(offsetX / width);
		if (virtual !== page) setPage(virtual);
	}

	function goToPage(i) {
		flatRef.current?.scrollToOffset({ offset: i * width, animated: true });
	}

	return (
    <div style={{...styles.wrapper, ...style}}>
      <span style={{...styles.title, ...{ color: colors.text }}}>{title}</span>
      <div         ref={flatRef}
        data={columnData}
        horizontal
        keyExtractor={(_, i) => 'col-' + i}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        renderItem={({ item: col, index }) => (
          <div style={{...styles.column, ...{ width: cellWidth }}}> 
						{col.map((it, idx) => (
							<MedalButton
								key={it.id + '-' + index + '-' + idx}
								item={it}
								colors={colors}
								onClick={() => {
									if (onMedalPress) onMedalPress(it);
									// clear new flags locally (both aliases)
									setInternalMedals(prev => prev.map(m => m.id === it.id ? { ...m, newMedal: false, new: false } : m));
								}}
							/>
						))}
          </div>
        )}
      />
      <div style={styles.dotsRow}>
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} onClick={() => goToPage(i)} style={{...styles.dot, ...i === page && { backgroundColor: colors.primary }}} />
        ))}
      </div>
    </div>
	);
}

const CIRCLE_SIZE = 66; // outer active circle approx

const styles = {
	wrapper: { width: '100%', marginTop: 28 },
	title: { fontSize: 18, fontFamily: family.semibold, marginBottom: 14 },
  grid: { },
  column: { alignItems: 'center', justifyContent: 'center' },
  cell: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
	medalOuterActive: {
		padding: 2,
		borderRadius: CIRCLE_SIZE / 2,
		borderWidth: 2,
	},
	medalInnerActive: {
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: CIRCLE_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#00000022',
	},
	medalOuterInactive: {
		padding: 2,
		borderRadius: CIRCLE_SIZE / 2,
		borderWidth: 2,
		borderColor: '#00000033',
	},
	medalInnerInactive: {
		width: CIRCLE_SIZE,
		height: CIRCLE_SIZE,
		borderRadius: CIRCLE_SIZE / 2,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#00000011',
	},
	newDot: {
		position: 'absolute',
		top: 6,
		right: 8,
		width: 14,
		height: 14,
		borderRadius: 7,
		backgroundColor: '#FFE247',
		borderWidth: 2,
		borderColor: '#222',
		shadowColor: '#FFE247',
		shadowOpacity: 0.9,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 0 },
	},
	dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 14, gap: 10 },
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#ffffff33',
	},
};

// MedalButton component extracted for animation logic
function MedalButton({ item, colors, onPress }) {
	const baseScale = useRef(new Animated.Value(1)).current;
	const pulse = useRef(new Animated.Value(0)).current; // only for new medals
	const flash = useRef(new Animated.Value(0)).current; // one-shot for appearance
	const popScale = useRef(new Animated.Value(1)).current;

	const isNew = !!item.justUnlocked; // we set justUnlocked when new flag present

	useEffect(() => {
		if (isNew) {
			// start subtle pulse loop
			const loop = Animated.loop(
				Animated.sequence([
					Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
					Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: false, easing: Easing.inOut(Easing.quad) }),
				])
			);
			loop.start();
			return () => loop.stop();
		}
	}, [isNew, pulse]);

	useEffect(() => {
		if (isNew) {
			popScale.setValue(0.4);
			flash.setValue(0);
			Animated.parallel([
				Animated.sequence([
					Animated.timing(popScale, { toValue: 1.15, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
					Animated.spring(popScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 180, delay: 40 }),
				]),
				Animated.sequence([
					Animated.timing(flash, { toValue: 1, duration: 260, useNativeDriver: false }),
					Animated.timing(flash, { toValue: 0, duration: 520, useNativeDriver: false }),
				]),
			]).start();
		} else {
			popScale.setValue(1);
		}
	}, [isNew, popScale, flash]);

	function handlePressIn() {
		Animated.spring(baseScale, { toValue: 0.9, useNativeDriver: true, friction: 6, tension: 300 }).start();
	}
	function handlePressOut() {
		Animated.spring(baseScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 300 }).start();
	}

	// Interpolations only when new
	const badgeColor = item.color || colors.primary; // Use badge color or fallback to primary
	const iconColor = item.iconColor || colors.text; // Use icon color from API or fallback to text color
	const borderColor = isNew
		? flash.interpolate({ inputRange: [0, 1], outputRange: [badgeColor + '55', badgeColor] })
		: badgeColor + '55';
	const bgColor = isNew
		? flash.interpolate({ inputRange: [0, 1], outputRange: [badgeColor + '22', badgeColor + '55'] })
		: '#00000022';
	const pulseBorder = pulse.interpolate({ inputRange: [0, 1], outputRange: [badgeColor + '55', badgeColor] });
	const pulseBg = pulse.interpolate({ inputRange: [0, 1], outputRange: [badgeColor + '22', badgeColor + '44'] });

	const finalBorder = isNew ? pulseBorder : borderColor;
	const finalBg = isNew ? pulseBg : bgColor;

	const combinedScale = isNew ? popScale : baseScale;

	return (
		<Animated.View style={[styles.cell, { transform: [{ scale: combinedScale }] }]}>      
			<button 				activeOpacity={0.85}
				onClick={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				
				aria-label={`Medalha ${item.id}${item.unlocked ? ' desbloqueada' : ' bloqueada'}`}
			>
				<Animated.View style={item.unlocked ? [styles.medalOuterActive, { borderColor: finalBorder }] : styles.medalOuterInactive}>
					<Animated.View style={item.unlocked ? [styles.medalInnerActive, { backgroundColor: badgeColor }] : styles.medalInnerInactive}>
						{item.icon && item.icon.includes('<svg') ? (
							<SvgIcon 
								svgString={item.icon} 
								size={34} 
								color={item.unlocked ? iconColor : colors.text + '55'} 
							/>
						) : (
							<Icon
								name={item.icon}
								size={34}
								color={item.unlocked ? iconColor : colors.text + '55'}
							/>
						)}
						{isNew && (
							<div style={styles.newDot} />
						)}
					</Animated.View>
				</Animated.View>
			</button>
		</Animated.View>
	);
}

