import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import Svg, { Circle } from 'react-native-svg';
import Button2 from '../General/Button2';

/**
 * Quizz Header
 * - Left: circular countdown timer
 * - Center: title
 * - Right: close (X)
 * Props:
 *  - title: string
 *  - totalSec: number
 *  - remainingSec: number
 *  - onClose: () => void
 */
export default function QuizzHeader({ title = 'Title', totalSec = 90, remainingSec = 90, onClose }) {
	const colors = useThemeColors();

	const size = 50;
	const strokeWidth = 4.5;
	const r = (size - strokeWidth) / 2;
	const cx = size / 2;
	const cy = size / 2;
	const circumference = 2 * Math.PI * r;

	const clampedTotal = Math.max(1, totalSec || 1);
	const clampedRemain = Math.max(0, Math.min(remainingSec || 0, clampedTotal));
	const progress = clampedRemain / clampedTotal; // 1 -> full, 0 -> empty
	const dashOffset = circumference * (1 - progress);

	return (
		<View style={[styles.container]}> 
			<View style={styles.left}> 
				<View style={{ width: size, height: size }}>
					<Svg width={size} height={size}>
						{/* background ring */}
						<Circle cx={cx} cy={cy} r={r} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
						{/* progress ring */}
						<Circle
							cx={cx}
							cy={cy}
							r={r}
							stroke={colors.primary}
							strokeWidth={strokeWidth}
							strokeDasharray={`${circumference} ${circumference}`}
							strokeDashoffset={dashOffset}
							strokeLinecap="round"
							fill="none"
							transform={`rotate(-90 ${cx} ${cy})`}
						/>
					</Svg>
					<View style={styles.timerOverlay} pointerEvents="none"> 
						<Text style={[styles.timerText, { color: colors.text }]}>{formatTime(clampedRemain)}</Text>
					</View>
				</View>
			</View>
					<Text style={[styles.title, { color: colors.text }]} numberOfLines={3}>
						{title}
					</Text>
			<View style={styles.right}>
						<Button2 iconName="x" size={45} onPress={onClose} />
			</View>
		</View>
	);
}

function formatTime(total) {
	const m = Math.floor(total / 60);
	const s = total % 60;
	const ss = s < 10 ? `0${s}` : `${s}`;
	return `${m}:${ss}`;
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 80,
		paddingHorizontal: 12,
		gap: 12,
	},
	left: { width: 48, alignItems: 'flex-start', justifyContent: 'center' },
	right: { width: 48, alignItems: 'flex-end', justifyContent: 'center' },
	title: { flex: 1, fontSize: 22, fontWeight: '800', fontFamily: family.bold, letterSpacing: 0.5, textAlign: 'center' },
	iconBtn: { alignItems: 'center', justifyContent: 'center' },
	timerOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
	timerText: { fontSize: 13, fontWeight: '700', fontFamily: family.bold },
});

