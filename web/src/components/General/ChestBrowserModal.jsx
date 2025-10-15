import React, { useState, useEffect, useRef } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import DataManager from '../../services/DataManager.jsx';
import ApiManager from '../../services/ApiManager.jsx';
import { family } from '../../constants/font.jsx';

// Import chest images
const chestImages = {
  bronze: '/assets/chests/chest-bronze.png',
  silver: '/assets/chests/chest-silver.png',
  gold: '/assets/chests/chest-gold.png',
  epic: '/assets/chests/chest-epic.png',
};

const chestImagesOpened = {
  bronze: '/assets/chests/chest-bronze-opened.png',
  silver: '/assets/chests/chest-silver-opened.png',
  gold: '/assets/chests/chest-gold-opened.png',
  epic: '/assets/chests/chest-epic-opened.png',
};

export default function ChestBrowserModal({ visible, onClose, dataSource = 'stars', onChestOpened }) {
	const colors = useThemeColors();
	const scrollRef = useRef(null);
	const [chests, setChests] = useState([]);
	const [loadingChestId, setLoadingChestId] = useState(null);
	const [progressData, setProgressData] = useState({ current: 0, nextThreshold: 100 });

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
			
			const progressInfo = {
				current: sourceData?.current || 0,
				nextThreshold: sourceData?.nextThreshold || 100
			};
			setProgressData(progressInfo);
			
			// Scroll to bottom after content is loaded
			setTimeout(() => {
				if (scrollRef.current) {
					scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
				}
			}, 0);
		}
	}, [visible, dataSource]);

	const handleOpen = async (chest) => {
		if (!chest || chest.openedAt) return;
		setLoadingChestId(chest.id);
		try {
			const response = await ApiManager.openChest(chest.id);
			if (response?.success) {
				const rewards = [];
				if (response.coins > 0) rewards.push({ id: 'coins', type: 'coins', amount: response.coins });
				if (response.cosmeticId) rewards.push({ id: 'cosmetic', type: 'cosmetic', cosmeticId: response.cosmeticId, amount: 1 });
				await DataManager.refreshSection('userInfo');
				await DataManager.refreshSection('chests');
				await DataManager.refreshSection('shop');
				setLoadingChestId(null);
				onChestOpened && onChestOpened(rewards, chest.chestType);
				onClose && onClose();
			} else {
				setLoadingChestId(null);
			}
		} catch (e) {
			setLoadingChestId(null);
		}
	};

	if (!visible) {
		return null;
	}

	// Calculate progression bar height
	const sortedChests = [...chests].sort((a, b) => (a.milestone || 0) - (b.milestone || 0));
	const maxMilestone = sortedChests.length > 0 ? Math.max(...sortedChests.map(c => c.milestone || 0)) : 100;
	
	let pixelsPerUnit;
	if (dataSource === 'points') {
		pixelsPerUnit = 0.5;
	} else {
		pixelsPerUnit = 25;
	}
	
	const barHeight = maxMilestone * pixelsPerUnit;
	
	let currentChestIndex = -1;
	let nextChestIndex = 0;
	for (let i = 0; i < sortedChests.length; i++) {
		if (progressData.current >= (sortedChests[i].milestone || 0)) {
			currentChestIndex = i;
			nextChestIndex = i + 1;
		} else {
			nextChestIndex = i;
			break;
		}
	}
	
	let progressPercent = 0;
	if (sortedChests.length > 0) {
		progressPercent = progressData.current / maxMilestone;
	}
	
	const fillHeight = barHeight * progressPercent;

	return (
		<div style={styles.modalContainer}>
			<div style={{...styles.backdrop, backgroundColor: colors.backdrop + 'AA'}}>
				<button style={styles.backdropHit} onClick={onClose} aria-label="Fechar baús" />
				<div style={{...styles.panel, backgroundColor: colors.card, borderColor: colors.text + '22'}}>
					<span style={{...styles.title, color: colors.text}}>Progressão de Baús</span>
					
					<div
						ref={scrollRef}
						style={styles.scrollContent}
					>
						<div style={styles.progressContainer}>
							<div style={styles.leftCol}>
								<div style={styles.progressInner}>
									{/* Progress bar background */}
									<div style={{...styles.progressBarBg, height: barHeight, backgroundColor: colors.text + '1A'}}>
										{/* Progress fill - fills from top to bottom */}
										<div style={{...styles.progressFill, height: fillHeight, backgroundColor: colors.secondary + 'AA'}} />
									</div>
									
									{/* Chest checkpoints */}
									<div style={{...styles.checkpointsContainer, height: barHeight + 24}}>
										{sortedChests.map((chest, index) => {
											const milestone = chest.milestone || 0;
											const topPosition = milestone * pixelsPerUnit;
											const isReached = progressData.current >= milestone;
											const canOpen = chest.grantedAt && !chest.openedAt && !chest.isUpcoming;
											const isOpened = chest.openedAt;

											const chestImage = isOpened 
												? (chestImagesOpened[chest.chestType] || chestImagesOpened.bronze)
												: (chestImages[chest.chestType] || chestImages.bronze);

											return (
												<div
													key={chest.id}
													style={{...styles.checkpoint, top: topPosition}}
												>
													{/* Milestone marker */}
													<div style={styles.milestoneContainer}>
														<div style={{...styles.milestoneMarker, backgroundColor: colors.card}} />
													</div>

													{/* Chest icon and info */}
													<div style={styles.chestInfo}>
														{canOpen && (
															<div style={{...styles.chestGlow, backgroundColor: colors.secondary + '40', boxShadow: `0 0 15px ${colors.secondary}80`}} />
														)}
														<button
															onClick={() => canOpen ? handleOpen(chest) : null}
															disabled={!canOpen || loadingChestId === chest.id}
															style={{
																...styles.chestButton,
																opacity: (!canOpen || loadingChestId === chest.id) ? 0.8 : 1,
																cursor: canOpen ? 'pointer' : 'default',
															}}
														>
															<div style={{
																...styles.chestContainer,
																opacity: chest.isUpcoming ? 0.6 : 1,
															}}>
																<img 
																	src={chestImage} 
																	alt={`Baú ${chest.chestType}`}
																	style={styles.chestImage}
																/>
															</div>
														</button>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
							<div style={styles.rightCol} />
						</div>
						<div style={{ height: 20 }} />
					</div>
					
					<button style={{...styles.closeBtn, borderColor: colors.text + '22'}} onClick={onClose}>
						<span style={{...styles.closeText, color: colors.text}}>Fechar</span>
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
		width: '100%',
		maxWidth: 400,
		borderRadius: 16,
		padding: 20,
		borderWidth: '1px',
		borderStyle: 'solid',
		maxHeight: '85%',
		position: 'relative',
		zIndex: 1,
		display: 'flex',
		flexDirection: 'column',
	},
	title: {
		fontSize: 18,
		fontFamily: family.bold,
		textAlign: 'center',
		marginBottom: 16,
		display: 'block',
	},
	scrollContent: {
		flex: 1,
		overflowY: 'auto',
		paddingTop: 8,
		paddingBottom: 56,
	},
	progressContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
		paddingLeft: 68,
		paddingRight: 68,
		width: '100%',
	},
	leftCol: {
		width: '48%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	rightCol: {
		width: '52%',
	},
	progressInner: {
		width: 120,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: -8,
		position: 'relative',
	},
	progressBarBg: {
		width: 8,
		borderRadius: 4,
		position: 'relative',
	},
	progressFill: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		borderRadius: 4,
	},
	checkpointsContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
	},
	checkpoint: {
		position: 'absolute',
		left: 0,
		right: 0,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		transform: 'translateY(-12px)',
	},
	milestoneContainer: {
		position: 'absolute',
		left: '50%',
		marginLeft: -7,
		display: 'flex',
		alignItems: 'center',
	},
	milestoneMarker: {
		width: 14,
		height: 4,
		borderRadius: 3,
	},
	chestInfo: {
		position: 'absolute',
		left: '100%',
		marginLeft: -32,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	chestGlow: {
		position: 'absolute',
		width: 60,
		height: 60,
		borderRadius: 30,
		left: -4,
		top: -4,
		zIndex: 0,
		animation: 'pulse 2s ease-in-out infinite',
	},
	chestButton: {
		position: 'relative',
		zIndex: 1,
		background: 'transparent',
		border: 'none',
		padding: 0,
	},
	chestContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	chestImage: {
		width: 52,
		height: 52,
	},
	closeBtn: {
		marginTop: 16,
		paddingTop: 12,
		paddingBottom: 12,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 12,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: 'transparent',
		cursor: 'pointer',
	},
	closeText: {
		fontSize: 15,
		fontFamily: family.bold,
	},
};
