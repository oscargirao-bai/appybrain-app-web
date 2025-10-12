import React from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from './SvgIcon.jsx';
import DataManager from '../../services/DataManager.jsx';
import { family } from '../../constants/font';

function getOpenedChestImage(chestType) {
	const map = {
		bronze: '/assets/chests/chest-bronze-opened.png',
		silver: '/assets/chests/chest-silver-opened.png',
		gold: '/assets/chests/chest-gold-opened.png',
		epic: '/assets/chests/chest-epic-opened.png',
	};
	return map[chestType] || map.bronze;
}

function defaultRewards() {
	return [
		{ id: 'r1', type: 'coins', amount: 120 },
		{ id: 'r2', type: 'tips', amount: 2 },
	];
}

export default function ChestRewardModal({ visible, onClose, rewards = defaultRewards(), chestType = 'bronze' }) {
	const colors = useThemeColors();
	const chestOpenedImg = getOpenedChestImage(chestType);

	if (!visible) {
		return null;
	}

	const RewardItem = ({ item }) => {
		if (item.type === 'coins') {
			return (
				<div style={{...styles.rewardCard, borderColor: colors.text + '22'}}>
					<SvgIcon name="coins" size={28} color={colors.secondary} />
					<span style={{...styles.rewardAmount, color: colors.text}}>{item.amount}</span>
					<span style={{...styles.rewardLabel, color: colors.text + 'AA'}}>Coins</span>
				</div>
			);
		} else if (item.type === 'cosmetic') {
			const cosmetic = DataManager.getCosmeticById(item.cosmeticId);
			const imageUrl = cosmetic?.imageUrl || cosmetic?.previewUrl;
			return (
				<div style={{...styles.rewardCard, borderColor: colors.text + '22'}}>
					{imageUrl ? (
						<img 
							src={imageUrl}
							style={{...styles.cosmeticIcon, objectFit: "contain"}}
							alt="Cosmetic"
						/>
					) : (
						<SvgIcon name="image" size={28} color={colors.secondary} />
					)}
					<span style={{...styles.rewardAmount, color: colors.text}}>+1</span>
					<span style={{...styles.rewardLabel, color: colors.text + 'AA'}}>Cosmético</span>
				</div>
			);
		} else {
			return (
				<div style={{...styles.rewardCard, borderColor: colors.text + '22'}}>
					<SvgIcon name="lightbulb" size={28} color={colors.secondary} />
					<span style={{...styles.rewardAmount, color: colors.text}}>{item.amount}</span>
					<span style={{...styles.rewardLabel, color: colors.text + 'AA'}}>Dicas</span>
				</div>
			);
		}
	};

	return (
		<div style={styles.modalContainer}>
			<button style={{...styles.backdrop, backgroundColor: '#000000AA'}} onClick={onClose} aria-label="Fechar recompensa" />
			<div style={styles.centerWrap}>
				<div style={{...styles.panel, backgroundColor: colors.background, borderColor: colors.text + '22'}}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
						<span style={{...styles.title, color: colors.text}}>Baú Aberto!</span>
						<span style={{...styles.subtitle, color: colors.text + 'AA'}}>Recebeste:</span>
					</div>
					<div style={{ marginBottom: 10 }}>
						<img src={chestOpenedImg} style={{ width: 150, height: 120, objectFit: "contain" }} alt="Chest opened" />
					</div>
					<div style={styles.rewardsRow}>
						{rewards.map((r) => <RewardItem key={r.id} item={r} />)}
					</div>
					<button 
						onClick={onClose}
						style={{...styles.closeBtn, backgroundColor: colors.primary + 'DD'}}
						aria-label="Fechar"
					>
						<span style={{...styles.closeText, color: colors.onPrimary || '#FFF'}}>OK</span>
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
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
		borderRadius: 28,
		padding: 24,
		borderWidth: '1px',
		borderStyle: 'solid',
		width: '100%',
		maxWidth: 460,
		alignItems: 'center',
		overflow: 'hidden',
		pointerEvents: 'auto',
		position: 'relative',
	},
	title: {
		fontSize: 22,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
	},
	subtitle: {
		fontSize: 14,
		fontFamily: family.semibold,
		marginTop: 4,
	},
	rewardsRow: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: 14,
		marginBottom: 22,
	},
	rewardCard: {
		width: 120,
		paddingTop: 14,
		paddingBottom: 14,
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 20,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: 6,
	},
	rewardAmount: {
		fontSize: 20,
		fontFamily: family.bold,
	},
	rewardLabel: {
		fontSize: 12,
		fontFamily: family.semibold,
	},
	closeBtn: {
		marginTop: 4,
		paddingTop: 14,
		paddingBottom: 14,
		paddingLeft: 34,
		paddingRight: 34,
		borderRadius: 40,
		border: 'none',
		cursor: 'pointer',
	},
	closeText: {
		fontSize: 15,
		fontFamily: family.bold,
		letterSpacing: '0.5px',
	},
	cosmeticIcon: {
		width: 32,
		height: 32,
	},
};
