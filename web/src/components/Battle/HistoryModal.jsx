import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import { useTranslate } from '../../services/Translate.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';

export default function HistoryModal({ visible, onClose, pending = [], completed = [], title, onOpenBattle, loading = false }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();
	const hasAny = (pending?.length || 0) > 0 || (completed?.length || 0) > 0;
	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
	// App column is 50% centered – keep modal inside that with a small gutter
	const appColumnWidth = Math.min(680, Math.round(viewportWidth * 0.5));
	const cardWidth = Math.max(340, Math.min(620, appColumnWidth - 24));
	// Height: leave generous space but never overflow; allow internal scroll
	const maxCardHeight = Math.min(560, Math.round(viewportHeight * 0.8));
	const minCardHeight = 260;
	const cardHeight = Math.max(minCardHeight, maxCardHeight);
	const headerHeight = 54; // approx title + close
	const sectionMargin = 12;
	const scrollHeight = Math.max(160, cardHeight - headerHeight - sectionMargin);

	if (!visible) {
		return null;
	}

	return (
		<div style={styles.modalContainer}>
			<div style={{...styles.backdrop, backgroundColor: colors.overlay?.black50 || 'rgba(0,0,0,0.5)'}}>
				<button style={styles.backdropHit} onClick={onClose} aria-label="Fechar histórico" />
				<div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div style={{
						...styles.card,
						backgroundColor: colors.card || colors.background,
						borderColor: colors.border,
						width: cardWidth,
						maxHeight: maxCardHeight,
						height: 'auto',
					}}>
						<button onClick={onClose} style={styles.closeWrap} aria-label={translate('common.close')}>
							<LucideIcon name="x" size={22} color={colors.text} />
						</button>

						<span style={{...styles.title, color: colors.text}}>
							{title || translate('battle.history.title')}
						</span>

						<div style={{ ...styles.scrollBox, maxHeight: scrollHeight, overflowY: 'auto', paddingRight: 4 }}>
							{loading && !hasAny && (
								<div style={{ ...styles.emptyWrap, minHeight: 120 }}>
									<span style={{...styles.emptyText, color: colors.muted}}>{translate('common.loading')}</span>
								</div>
							)}
							{!loading && !hasAny && (
								<div style={{ ...styles.emptyWrap, minHeight: 120 }}>
									<span style={{...styles.emptyText, color: colors.muted}}>{translate('battle.history.empty')}</span>
								</div>
							)}
							{hasAny && (
								<>
									{pending?.length > 0 && (
										<>
											<span style={{...styles.sectionTitle, color: colors.text}}>{translate('battle.history.pending')}</span>
											<div style={styles.sectionBox}>
												{pending.map((it, idx) => (
													<HistoryRow key={`p-${idx}`} item={it} colors={colors} translate={translate} onOpenBattle={onOpenBattle} onClose={onClose} />
												))}
											</div>
										</>
									)}
									{completed?.length > 0 && (
										<>
											<span style={{...styles.sectionTitle, color: colors.text, marginTop: 18}}>{translate('battle.history.completed')}</span>
											<div style={styles.sectionBox}>
												{completed.map((it, idx) => (
													<HistoryRow key={`c-${idx}`} item={it} colors={colors} translate={translate} onOpenBattle={onOpenBattle} onClose={onClose} />
												))}
											</div>
										</>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function HistoryRow({ item, colors, translate, onOpenBattle, onClose }) {
	const { left, right, leftStats, rightStats, status = 'pending', battleSessionId } = item || {};
	const isPending = status === 'pending';
	const isWin = status === 'win';
	const isLose = status === 'lose';

	let bg = colors.card;
	let border = colors.border;
	if (isWin) { bg = 'rgba(16,185,129,0.15)'; border = colors.success || '#10B981'; }
	if (isLose) { bg = 'rgba(239,68,68,0.15)'; border = colors.error || '#EF4444'; }

	return (
		<button
			onClick={() => {
				if (battleSessionId && onOpenBattle) {
					onOpenBattle(battleSessionId);
					setTimeout(() => {
						try { onClose && onClose(); } catch {}
					}, 100);
				}
			}}
			style={{...rowStyles.item, backgroundColor: bg, borderColor: border}}
		>
			<div style={rowStyles.vsOverlay}>
				<span style={{...rowStyles.vs, ...rowStyles.vsCenter, color: colors.text}}>{translate('battle.vs')}</span>
			</div>
			<div style={rowStyles.itemRow}>
				<span style={{...rowStyles.itemName, textAlign: 'left', color: colors.text}}>{left}</span>
				<span style={{...rowStyles.itemName, textAlign: 'right', color: colors.text}}>{right}</span>
			</div>
			<div style={rowStyles.statsRow}>
				<div style={rowStyles.statsCol}>
					{leftStats ? (
						<>
							<span style={{...rowStyles.statsText, color: colors.muted}}>{leftStats.correct}/{leftStats.total} {translate('battle.history.correct')}</span>
							<span style={{...rowStyles.statsText, color: colors.muted}}>{Number(leftStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime')}</span>
						</>
					) : (
						<span style={{...rowStyles.statsText, color: colors.muted}}>?/? {translate('battle.history.correct')}</span>
					)}
				</div>
				<div style={rowStyles.statsCol}>
					{rightStats ? (
						<>
							<span style={{...rowStyles.statsText, textAlign: 'right', color: colors.muted}}>{rightStats.correct}/{rightStats.total} {translate('battle.history.correct')}</span>
							<span style={{...rowStyles.statsText, textAlign: 'right', color: colors.muted}}>{Number(rightStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime')}</span>
						</>
					) : (
						<span style={{...rowStyles.statsText, textAlign: 'right', color: colors.muted}}>?/? {translate('battle.history.correct')}</span>
					)}
				</div>
			</div>
		</button>
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
	card: {
		width: '100%',
		maxWidth: '94%',
		borderRadius: 18,
		borderWidth: '1px',
		borderStyle: 'solid',
		padding: 12,
		boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
		position: 'relative',
		zIndex: 1,
	},
	closeWrap: {
		position: 'absolute',
		right: 10,
		top: 10,
		zIndex: 2,
		padding: 6,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: {
		fontSize: 20,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
		textAlign: 'center',
		marginBottom: 8,
		display: 'block',
	},
	scrollBox: {
		width: '100%',
	},
	sectionTitle: {
		fontSize: 16,
		fontFamily: family.bold,
		marginTop: 4,
		marginBottom: 6,
		display: 'block',
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
	},
	emptyText: {
		fontSize: 14,
		fontFamily: family.bold,
		textAlign: 'center',
	},
};

const rowStyles = {
	item: {
		borderRadius: 14,
		borderWidth: '1px',
		borderStyle: 'solid',
		paddingTop: 10,
		paddingBottom: 10,
		paddingLeft: 12,
		paddingRight: 12,
		position: 'relative',
		cursor: 'pointer',
		width: '100%',
		textAlign: 'left',
	},
	itemRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	itemName: {
		flex: 1,
		fontSize: 16,
		fontFamily: family.bold,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	vs: {
		fontSize: 18,
		fontFamily: family.bold,
		marginLeft: 12,
		marginRight: 12,
	},
	vsCenter: {
		marginLeft: 0,
		marginRight: 0,
	},
	vsOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
		pointerEvents: 'none',
	},
	statsRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 4,
	},
	statsCol: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	statsText: {
		fontSize: 12,
		fontFamily: family.semibold,
	},
};
