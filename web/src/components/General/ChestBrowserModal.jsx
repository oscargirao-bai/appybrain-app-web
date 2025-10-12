import React, { useState, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.jsx';
import Chest from './Chest.jsx';
import { family } from '../../constants/font';

export default function ChestBrowserModal({ visible, onClose, dataSource = 'stars', onChestOpened }) {
	const colors = useThemeColors();
	const [chests, setChests] = useState([]);

	useEffect(() => {
		if (visible) {
			const chestData = DataManager.getUserChests();
			let sourceData = {};
			if (dataSource === 'points') {
				sourceData = chestData?.points || {};
			} else {
				sourceData = chestData?.stars || {};
			}
			const existingChests = sourceData?.chests || [];
			const allChests = [...existingChests];
			const nextThreshold = sourceData?.nextThreshold;
			const nextChestType = sourceData?.nextChestType || 'bronze';
			if (nextThreshold && !existingChests.find(c => c.milestone === nextThreshold)) {
				allChests.push({
					id: `upcoming-${nextThreshold}`,
					source: sourceData.source || 'stars',
					chestType: nextChestType,
					milestone: nextThreshold,
					grantedAt: null,
					openedAt: null,
					isUpcoming: true
				});
			}
			const sortedChests = allChests.sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
			setChests(sortedChests);
		}
	}, [visible, dataSource]);

	if (!visible) {
		return null;
	}

	return (
		<div style={styles.modalContainer}>
			<div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'CC'}}>
				<button style={styles.backdropHit} onClick={onClose} aria-label="Fechar baús" />
				<div style={{...styles.panel, backgroundColor: colors.background, borderColor: colors.border}}>
					<span style={{...styles.title, color: colors.text}}>Os Meus Baús</span>
					<div style={styles.scrollContent}>
						{chests.map((chest) => (
							<div key={chest.id} style={styles.chestItem}>
								<Chest
									chestType={chest.chestType}
									dataSource={dataSource}
									size={80}
								/>
								<span style={{...styles.milestone, color: colors.text}}>{chest.milestone} {dataSource === 'points' ? 'pts' : 'estrelas'}</span>
							</div>
						))}
					</div>
					<button
						style={{...styles.closeBtn, backgroundColor: colors.primary}}
						onClick={onClose}
						aria-label="Fechar"
					>
						<span style={styles.closeBtnText}>Fechar</span>
					</button>
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
	panel: {
		width: '90%',
		maxWidth: 500,
		maxHeight: '80%',
		borderRadius: 20,
		padding: 20,
		borderWidth: '1px',
		borderStyle: 'solid',
		boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
		position: 'relative',
		zIndex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	title: {
		fontSize: 22,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
		textAlign: 'center',
		marginBottom: 16,
	},
	scrollContent: {
		flex: 1,
		overflowY: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: 16,
		marginBottom: 16,
	},
	chestItem: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
		padding: 12,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.05)',
	},
	milestone: {
		fontSize: 16,
		fontFamily: family.bold,
	},
	closeBtn: {
		paddingTop: 14,
		paddingBottom: 14,
		borderRadius: 12,
		border: 'none',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	closeBtnText: {
		fontSize: 16,
		fontFamily: family.bold,
		color: '#FFFFFF',
	},
};
