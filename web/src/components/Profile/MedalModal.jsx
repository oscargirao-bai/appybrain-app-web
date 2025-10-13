import React from 'react';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';
import { family } from '../../constants/font.jsx';

export default function MedalModal({ visible, onClose, medal }) {
	const colors = useThemeColors();

	if (!visible || !medal) {
		return null;
	}

	const progress = Math.min(1, medal.target ? medal.current / medal.target : 0);

	const panelStyle = {
		...styles.panel,
		backgroundColor: colors.card || '#0E1620'
	};

	const iconCircleStyle = {
		...styles.iconCircle,
		backgroundColor: medal.unlocked ? (medal.color || colors.primary) : colors.cardBackground
	};

	const progressFillStyle = {
		...styles.progressFill,
		width: `${progress * 100}%`,
		backgroundColor: medal.color || colors.primary
	};

	return (
		<div style={styles.modalContainer}>
			<button style={styles.backdrop} onClick={onClose} aria-label="Fechar modal medalha" />
			<div style={styles.centerWrap}>
				<div style={panelStyle}>
					<div style={styles.scrollContent}>
						<div style={styles.rowTop}>
							<div style={{ position: 'relative' }}>
								<div style={iconCircleStyle}>
									{medal.icon ? (
										<div style={styles.iconWrap}>
											<SvgIcon svgString={medal.icon} size={34} />
										</div>
									) : (
										<div style={styles.iconWrap}>
											<LucideIcon name="medal" size={38} color={colors.text} />
										</div>
									)}
								</div>
								{!medal.hideLevel && medal.level ? (
									<div style={styles.levelBubble}>
										<span style={styles.levelBubbleText}>{medal.level}</span>
									</div>
								) : null}
							</div>
							<div style={styles.rightCol}>
								<span style={{...styles.titleText, color: colors.text}}>{medal.title}</span>
								<span style={{...styles.descriptionText, color: colors.text + 'CC'}}>
									{medal.description || 'Sem descrição'}
								</span>
							</div>
						</div>
						{medal.target && (
							<div style={styles.progressSection}>
								<div style={styles.progressBar}>
									<div style={progressFillStyle} />
								</div>
								<span style={{...styles.progressText, color: colors.text + 'AA'}}>
									{medal.current} / {medal.target}
								</span>
							</div>
						)}
						{/* Close button removed; click outside closes modal */}
					</div>
				</div>
			</div>
		</div>
	);
}

const styles = {
	modalContainer: {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1000,
		display: 'flex',
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.7)',
		border: 'none',
		cursor: 'pointer',
	},
	centerWrap: {
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
	},
	panel: {
		borderRadius: 20,
		padding: 24,
		width: '90%',
		maxWidth: 400,
		maxHeight: '95%',
		pointerEvents: 'auto',
		position: 'relative',
		overflow: 'visible',
	},
	scrollContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: 16,
		overflow: 'visible',
	},
	rowTop: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	iconCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		overflow: 'visible',
	},
	iconWrap: {
		transform: 'scale(1.2)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	rightCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
	},
	titleText: {
		fontSize: 18,
		fontFamily: family.bold,
		fontWeight: '700',
	},
	levelBubble: {
		position: 'absolute',
		top: -10,
		right: -6,
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: '#FFE247',
		border: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
	},
	levelBubbleText: {
		fontSize: 14,
		fontFamily: family.semibold,
		color: '#111',
	},
	descriptionText: {
		fontSize: 14,
		fontFamily: family.medium,
		lineHeight: '18px',
	},
	progressSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
	},
	progressBar: {
		height: 8,
		backgroundColor: 'rgba(255,255,255,0.15)',
		borderRadius: 4,
		overflow: 'hidden',
		position: 'relative',
	},
	progressFill: {
		height: '100%',
		borderRadius: 4,
		transition: 'width 0.3s ease',
	},
	progressText: {
		fontSize: 12,
		fontFamily: family.medium,
		textAlign: 'right',
	},
	// close button removed
};
