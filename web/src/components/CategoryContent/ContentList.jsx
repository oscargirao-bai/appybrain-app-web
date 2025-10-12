import React, { useCallback, useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import ConfirmModal from '../General/ConfirmModal.jsx';
import { family } from '../../constants/font';
import SvgIcon from '../General/SvgIcon.jsx';

function containsMathMarkers(str) {
	if (!str) return false;
	return /(\$\$[^$]+\$\$|\$[^$]+\$|\\\(|\\\)|\\\[|\\\]|\\frac|\\sqrt|\\sum|\\int)/.test(str);
}

function addAlpha(hex, alpha) {
	if (!hex || hex.startsWith('rgb')) return hex;
	let h = hex.replace('#','');
	if (h.length === 3) h = h.split('').map(c=>c+c).join('');
	const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function ContentList({ data, onStudy }) {
	const colors = useThemeColors();
	const [expandedId, setExpandedId] = useState(null);
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [confirmPayload, setConfirmPayload] = useState(null);

	const toggleExpand = useCallback((id) => {
		setExpandedId(prev => prev === id ? null : id);
	}, []);

	const handleStudy = (item) => {
		const payload = { contentId: item.id, title: item.title };
		setConfirmPayload(payload);
		setConfirmVisible(true);
	};

	const confirmStudy = () => {
		setConfirmVisible(false);
		if (confirmPayload && onStudy) {
			onStudy(confirmPayload);
		}
	};

	return (
		<div style={styles.listContainer}>
			{data.map(item => {
				const expanded = expandedId === item.id;
				const baseColor = addAlpha(item.color || colors.primary, 0.15);
				const iconColor = item.iconColor || colors.text;

				const itemStyle = {
					...styles.itemContainer,
					backgroundColor: baseColor,
					borderColor: item.color || colors.primary
				};

				return (
					<div key={item.id} style={itemStyle}>
						<button
							style={styles.topRow}
							onClick={() => toggleExpand(item.id)}
							aria-label={`${item.title}. ${item.stars} de ${item.maxStars} estrelas`}
						>
							<span style={{...styles.titleText, color: iconColor}}>{item.title}</span>
							<div style={styles.starBadge}>
								<SvgIcon name="star" size={14} color={iconColor} />
								<span style={{...styles.starBadgeText, color: iconColor}}>
									{item.stars}/{item.maxStars}
								</span>
							</div>
							<SvgIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={iconColor} />
						</button>
						{expanded && (
							<div style={styles.expandedBody}>
								<span style={{...styles.descText, color: iconColor}}>
									{item.description || 'Sem descrição'}
								</span>
								<button
									style={{...styles.studyBtn, backgroundColor: colors.accent, borderColor: colors.border}}
									onClick={() => handleStudy(item)}
									aria-label="Estudar Conteúdo"
								>
									<span style={{...styles.studyText, color: colors.onAccent}}>
										Estudar Conteúdo
									</span>
								</button>
							</div>
						)}
					</div>
				);
			})}
			<ConfirmModal
				visible={confirmVisible}
				title="Estudar Conteúdo?"
				message={confirmPayload ? `Iniciar estudo: ${confirmPayload.title}?` : ''}
				onConfirm={confirmStudy}
				onCancel={() => setConfirmVisible(false)}
			/>
		</div>
	);
}

const styles = {
	listContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
	},
	itemContainer: {
		borderWidth: 2,
		borderStyle: 'solid',
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
		gap: 12,
		width: '100%',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		padding: 0,
	},
	titleText: {
		fontSize: 16,
		fontFamily: family.bold,
		fontWeight: '700',
		flex: 1,
		textAlign: 'left',
	},
	starBadge: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 4,
		paddingBottom: 4,
		borderRadius: 12,
		borderWidth: 2,
		borderStyle: 'solid',
		backgroundColor: 'rgba(255,255,255,0.2)',
	},
	starBadgeText: {
		fontSize: 12,
		fontFamily: family.semibold,
		fontWeight: '600',
	},
	expandedBody: {
		marginTop: 12,
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
	},
	descText: {
		fontSize: 14,
		fontFamily: family.medium,
		lineHeight: '18px',
	},
	studyBtn: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: 12,
		paddingBottom: 12,
		borderRadius: 12,
		borderWidth: 1,
		borderStyle: 'solid',
		cursor: 'pointer',
		transition: 'opacity 0.2s',
	},
	studyText: {
		fontSize: 14,
		fontFamily: family.bold,
		fontWeight: '700',
	},
};
