import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font';
import Button2 from '../General/Button2.jsx';

export default function QuizzHeader({ 
	title = 'Title', 
	totalSec = 90, 
	remainingSec = 90, 
	onClose 
}) {
	const colors = useThemeColors();

	const size = 50;
	const strokeWidth = 4.5;
	const r = (size - strokeWidth) / 2;
	const cx = size / 2;
	const cy = size / 2;
	const circumference = 2 * Math.PI * r;

	const clampedTotal = Math.max(1, totalSec || 1);
	const clampedRemain = Math.max(0, Math.min(remainingSec || 0, clampedTotal));
	const progress = clampedRemain / clampedTotal;
	const dashOffset = circumference * (1 - progress);

	return (
		<div style={styles.container}> 
			<div style={styles.left}> 
				<div style={{ width: size, height: size, position: 'relative' }}>
					<svg width={size} height={size}>
						<circle 
							cx={cx} 
							cy={cy} 
							r={r} 
							stroke={colors.border} 
							strokeWidth={strokeWidth} 
							fill="none" 
						/>
						<circle
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
					</svg>
					<div style={styles.timerOverlay}> 
						<span style={{...styles.timerText, color: colors.text}}>
							{formatTime(clampedRemain)}
						</span>
					</div>
				</div>
			</div>
			<span style={{...styles.title, color: colors.text}}>
				{title}
			</span>
			<div style={styles.right}>
				<Button2 iconName="x" size={45} onClick={onClose} />
			</div>
		</div>
	);
}

function formatTime(total) {
	const m = Math.floor(total / 60);
	const s = total % 60;
	const ss = s < 10 ? `0${s}` : `${s}`;
	return `${m}:${ss}`;
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 80,
		paddingLeft: 12,
		paddingRight: 12,
		gap: 12,
	},
	left: { 
		width: 48, 
		display: 'flex',
		alignItems: 'flex-start', 
		justifyContent: 'center' 
	},
	right: { 
		width: 48, 
		display: 'flex',
		alignItems: 'flex-end', 
		justifyContent: 'center' 
	},
	title: { 
		flex: 1, 
		fontSize: 22, 
		fontWeight: '800', 
		fontFamily: family.bold, 
		letterSpacing: 0.5, 
		textAlign: 'center',
		display: '-webkit-box',
		WebkitLineClamp: 3,
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
	},
	timerOverlay: { 
		position: 'absolute', 
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center', 
		justifyContent: 'center',
		pointerEvents: 'none',
	},
	timerText: { 
		fontSize: 13, 
		fontWeight: '700', 
		fontFamily: family.bold 
	},
};
