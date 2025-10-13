import React, { useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';
import MathJaxRenderer from '../General/MathJaxRenderer.jsx';

const SUCCESS = '#2ecc71';
const DANGER = '#e74c3c';
const SUCCESS_BG = 'rgba(46, 204, 113, 0.15)';
const DANGER_BG = 'rgba(231, 76, 60, 0.15)';

export default function Answer({ 
	options = [], 
	selectedId, 
	onSelect, 
	optionHeight = 64, 
	correctId, 
	isCorrect, 
	resetKey 
}) {
	const colors = useThemeColors();
	
	const evalOutcome = (id) => {
		if (typeof isCorrect === 'function') {
			try { 
				return isCorrect(id) ? 'correct' : 'wrong'; 
			} catch { 
				return null; 
			}
		}
		if (correctId) return id === correctId ? 'correct' : 'wrong';
		return null;
	};

	return (
		<div style={{ paddingTop: 14 }}>
			{options.map((item, index) => (
				<React.Fragment key={resetKey ? `${resetKey}:${item.id}` : item.id}>
					{index > 0 && <div style={{ height: 10 }} />}
					<AnswerRow
						item={item}
						optionHeight={optionHeight}
						colors={colors}
						onClick={() => onSelect && onSelect(item.id)}
						evalOutcome={evalOutcome}
					/>
				</React.Fragment>
			))}
		</div>
	);
}

function AnswerRow({ item, optionHeight, colors, onPress, evalOutcome }) {
	const [status, setStatus] = useState('idle');
	
	let fsize = 16;
	const htmlStr = String(item.html || '');
	
	if (htmlStr.length <= 40 && htmlStr.includes("\\(")) {
		fsize = 14;
	}
	if (htmlStr.length <= 25 && !htmlStr.includes("\\(")) {
		fsize = 22;
	}
	if (htmlStr.length >= 70 && htmlStr.length <= 115 && !htmlStr.includes("\\(")) {
		fsize = 12;
	}
	if (htmlStr.length > 115 && !htmlStr.includes("\\(")) {
		fsize = 10;
	}
	
	const handleClick = () => {
		if (status === 'idle') {
			const outcome = evalOutcome ? evalOutcome(item.id) : null;
			if (outcome === 'correct' || outcome === 'wrong') {
				setStatus(outcome);
			}
		}
		onPress && onPress();
	};

	const bgColor = status === 'correct' 
		? SUCCESS_BG 
		: status === 'wrong' 
			? DANGER_BG 
			: 'transparent';
			
	const borderColor = status === 'correct' 
		? SUCCESS 
		: status === 'wrong' 
			? DANGER 
			: colors.border;

	return (
		<button 
			onClick={handleClick}
			style={{
				...styles.row,
				borderColor,
				backgroundColor: bgColor,
				height: optionHeight,
			}}
		>
			<div style={{ 
				flex: 1, 
				height: '100%', 
				display: 'flex',
				justifyContent: 'center', 
				alignItems: 'flex-start', 
				paddingLeft: 12 
			}}>
				{item.html ? (
					<MathJaxRenderer 
						content={item.html} 
						enabled={true}
						baseFontSize={fsize} 
						scrollEnabled={false}
						compact={true}
						inlineDisplay={true}
						textAlign="left"
						style={{ flex: 1, minHeight: 28, width: '100%' }} 
					/>
				) : (
					<span style={{ 
						color: colors.text, 
						fontSize: 12, 
						fontFamily: family.regular, 
						textAlign: 'left',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}>
						{item.text}
					</span>
				)}
			</div>
		</button>
	);
}

const styles = {
	row: {
		display: 'flex',
		flexDirection: 'row',
		borderWidth: '2px',
		borderStyle: 'solid',
		borderRadius: 14,
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 4,
		paddingBottom: 4,
		alignItems: 'center',
		width: '100%',
		minHeight: 64,
		overflow: 'hidden',
		cursor: 'pointer',
		background: 'transparent',
		position: 'relative',
	},
	badge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: { 
		fontSize: 16, 
		fontWeight: '800', 
		fontFamily: family.bold 
	},
};
