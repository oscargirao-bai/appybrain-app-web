import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';

function SectionTitle({ label, colors }) {
	return (
		<span style={{ ...styles.sectionTitle, color: colors.text }}>{label}</span>
	);
}

export default function FriendlyHistoryModal({
	visible,
	onClose,
	data = { toPlay: [], pending: [], completed: [] },
	onPlay,
	onOpenBattle,
	loading = false,
}) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
	const maxCardHeight = Math.min(560, Math.round(viewportHeight * 0.8));
	const minCardHeight = 260;
	const cardHeight = Math.max(minCardHeight, maxCardHeight);
	const headerBlock = 54;
	const scrollHeight = Math.max(160, cardHeight - headerBlock - 12);
	const { toPlay = [], pending = [], completed = [] } = data;
	const hasAny = toPlay.length + pending.length + completed.length > 0;

	if (!visible) return null;

	return (
		<div style={styles.modalContainer}>
			<div style={{ ...styles.backdrop, backgroundColor: colors.overlay?.black50 || 'rgba(0,0,0,0.5)' }}>
				<button style={styles.backdropHit} onClick={onClose} aria-label={translate('common.close')} />
				<div style={styles.cardWrap}>
					<div
						style={{
							...styles.card,
							backgroundColor: colors.card || colors.background,
							borderColor: colors.border,
							height: 'auto',
							maxHeight: maxCardHeight,
						}}
					>
						<button onClick={onClose} style={styles.closeWrap} aria-label={translate('common.close')}>
							<LucideIcon name="x" size={22} color={colors.text} />
						</button>
						<span style={{ ...styles.title, color: colors.text }}>{translate('battle.friendly.title')}</span>
						<div style={{ ...styles.scrollBox, maxHeight: scrollHeight }}>
							{loading && !hasAny && (
								<div style={styles.emptyWrap}>
									<span style={{ ...styles.emptyText, color: colors.muted }}>{translate('common.loading')}</span>
								</div>
							)}
							{!loading && !hasAny && (
								<div style={styles.emptyWrap}>
									<span style={{ ...styles.emptyText, color: colors.muted }}>{translate('battle.friendly.empty')}</span>
								</div>
							)}
							{hasAny && (
								<div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
									{toPlay.length > 0 && (
										<div>
											<SectionTitle label={translate('battle.friendly.sections.play')} colors={colors} />
											<div style={styles.sectionBox}>
												{toPlay.map((item) => (
													<FriendlyRow
														key={`play-${item.battleSessionId}`}
														item={item}
														colors={colors}
														type="play"
														onPlay={onPlay}
													/>
												))}
											</div>
										</div>
									)}
									{pending.length > 0 && (
										<div>
											<SectionTitle label={translate('battle.friendly.sections.pending')} colors={colors} />
											<div style={styles.sectionBox}>
												{pending.map((item) => (
													<FriendlyRow
														key={`pending-${item.battleSessionId}`}
														item={item}
														colors={colors}
														type="pending"
														onOpenBattle={onOpenBattle}
													/>
												))}
											</div>
										</div>
									)}
									{completed.length > 0 && (
										<div>
											<SectionTitle label={translate('battle.friendly.sections.completed')} colors={colors} />
											<div style={styles.sectionBox}>
												{completed.map((item) => (
													<FriendlyRow
														key={`completed-${item.battleSessionId}`}
														item={item}
														colors={colors}
														type="completed"
														onOpenBattle={onOpenBattle}
												/>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function FriendlyRow({ item, colors, type, onPlay, onOpenBattle }) {
	const { translate } = useTranslate();
	const base = {
		...rowStyles.base,
		backgroundColor: colors.card,
		borderColor: colors.border,
	};

	const handleOpen = () => {
		if (type === 'completed' || type === 'pending') {
					onOpenBattle && onOpenBattle(item);
		}
	};

	if (type === 'play') {
		return (
			<div style={{ ...base, backgroundColor: colors.background + 'CC' }}>
				<div style={rowStyles.namesRow}>
					<span style={{ ...rowStyles.name, textAlign: 'left', color: colors.text }}>{item.left}</span>
					<button
						style={{ ...rowStyles.playButton, background: colors.primary, color: '#1A1A1A' }}
						onClick={() => onPlay && onPlay(item)}
					>
						{translate('battle.friendly.playCta')}
					</button>
					<span style={{ ...rowStyles.name, textAlign: 'right', color: colors.text }}>{item.right}</span>
				</div>
			</div>
		);
	}

	if (type === 'pending') {
		return (
			<button style={{ ...base, cursor: 'pointer' }} onClick={handleOpen}>
				<div style={rowStyles.namesRow}>
					<span style={{ ...rowStyles.name, textAlign: 'left', color: colors.text }}>{item.left}</span>
					<span style={{ ...rowStyles.statusTag, backgroundColor: '#47391b', color: '#f1c46c' }}>{translate('battle.history.pending')}</span>
					<span style={{ ...rowStyles.name, textAlign: 'right', color: colors.text }}>{item.right}</span>
				</div>
			</button>
		);
	}

	const statusColors = resolveStatusColors(item.status, colors);
	return (
		<button style={{ ...base, cursor: 'pointer', backgroundColor: statusColors.bg, borderColor: statusColors.border }} onClick={handleOpen}>
			<div style={rowStyles.vsOverlay}>
				<span style={{ ...rowStyles.vsText, color: colors.text }}>{translate('battle.vs')}</span>
			</div>
			<div style={rowStyles.namesRow}>
				<span style={{ ...rowStyles.name, textAlign: 'left', color: colors.text }}>{item.left}</span>
				<span style={{ ...rowStyles.name, textAlign: 'right', color: colors.text }}>{item.right}</span>
			</div>
			<div style={rowStyles.statsRow}>
				<StatsBlock stats={item.leftStats} colors={colors} align="left" />
				<StatsBlock stats={item.rightStats} colors={colors} align="right" />
			</div>
		</button>
	);
}

function StatsBlock({ stats, colors, align }) {
	const { translate } = useTranslate();
	if (!stats) {
		return (
			<div style={rowStyles.statsCol}>
				<span style={{ ...rowStyles.statsText, color: colors.muted, textAlign: align }}>{`?/? ${translate('battle.history.correct')}`}</span>
			</div>
		);
	}

	return (
		<div style={rowStyles.statsCol}>
			<span style={{ ...rowStyles.statsText, color: colors.muted, textAlign: align }}>{`${stats.correct}/${stats.total} ${translate('battle.history.correct')}`}</span>
			<span style={{ ...rowStyles.statsText, color: colors.muted, textAlign: align }}>{`${Number(stats.timeSec || 0).toFixed(1)}s ${translate('battle.history.totalTime')}`}</span>
		</div>
	);
}

function resolveStatusColors(status, colors) {
	if (status === 'win') {
		return { bg: 'rgba(27,164,91,0.15)', border: colors.success || '#1BA45B' };
	}
	if (status === 'lose') {
		return { bg: 'rgba(239,68,68,0.15)', border: colors.error || '#EF4444' };
	}
	return { bg: colors.card, border: colors.border };
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
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
		position: 'relative',
	},
	backdropHit: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
	},
	cardWrap: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	card: {
		width: 520,
		maxWidth: '94%',
		borderRadius: 18,
		borderWidth: '1px',
		borderStyle: 'solid',
		padding: 14,
		boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
		position: 'relative',
		zIndex: 1,
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
	},
	closeWrap: {
		position: 'absolute',
		right: 10,
		top: 10,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 6,
	},
	title: {
		display: 'block',
		fontSize: 20,
		fontFamily: family.bold,
		textAlign: 'center',
		marginTop: 4,
	},
	scrollBox: {
		overflowY: 'auto',
		paddingRight: 4,
	},
	sectionTitle: {
		display: 'block',
		fontSize: 16,
		fontFamily: family.bold,
		marginBottom: 8,
	},
	sectionBox: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
		width: '92%',
		marginLeft: 'auto',
		marginRight: 'auto',
	},
	emptyWrap: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 140,
	},
	emptyText: {
		fontSize: 14,
		fontFamily: family.bold,
		textAlign: 'center',
	},
};

const rowStyles = {
	base: {
		borderRadius: 14,
		borderWidth: '1px',
		borderStyle: 'solid',
		padding: 12,
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
	},
	namesRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 12,
	},
	name: {
		flex: 1,
		fontSize: 16,
		fontFamily: family.bold,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	playButton: {
		border: 'none',
		borderRadius: 20,
		fontSize: 14,
		fontFamily: family.bold,
		padding: '6px 18px',
		cursor: 'pointer',
	},
	statusTag: {
		fontSize: 14,
		fontFamily: family.bold,
		padding: '6px 16px',
		borderRadius: 18,
	},
	statsRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 16,
	},
	statsCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
	},
	statsText: {
		fontSize: 12,
		fontFamily: family.semibold,
	},
	vsOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		pointerEvents: 'none',
		display: 'flex',
		justifyContent: 'center',
		marginTop: -4,
	},
	vsText: {
		fontSize: 18,
		fontFamily: family.bold,
	},
};
