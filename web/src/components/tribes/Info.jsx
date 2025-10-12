import React, { useMemo } from 'react';

import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../../components/General/SvgIcon';
import SvgIcon from '../General/SvgIcon';
import { family } from '../../constants/font';

// Card showing tribe high-level info
export default function TribeInfo({
	name = 'Desporto',
	description = 'Tribo para os entusiastas do desporto.',
	members = 110,
	joined = false, // whether current user is already in the tribe
	onJoin,         // called when user taps Entrar
	onLeave,        // called when user taps Sair
	disabledJoin = false,
	tribeIconName = 'volleyball', // lucide icon name for tribe visualization
	icon,           // SVG icon string from API
	accentColor,
	iconColor,      // Icon color from API
}) {
	const colors = useThemeColors();
	const accent = accentColor || colors.primary;
	const tribeIconColor = iconColor || colors.text;

	const joinLabel = useMemo(() => (joined ? 'Sair' : 'Entrar'), [joined]);

	return (
		<div style={{...styles.card, ...{ backgroundColor: colors.surface || colors.background}}> 
			<div style={styles.topRowHorizontal}>
				<div style={styles.rightBlock}>
					<div style={styles.titleRowWithButton}>
						<span style={{...styles.titleLeft, ...{ color: colors.text}} numberOfLines={1}>{name}</span>
						<button 							onClick={joined ? onLeave : onJoin}
							disabled={!joined && disabledJoin}
							style={({ pressed }) => [
								styles.joinBtnSmall,
								joined ? { backgroundColor: colors.error } : { backgroundColor: disabledJoin ? colors.text + '33' : colors.correct },
								pressed && !(disabledJoin && !joined) && { opacity: 0.85 }
							]}
							
							aria-label={`${joined ? 'Sair da' : 'Entrar na'} tribo ${name}`}
							accessibilityState={{ disabled: !joined && disabledJoin }}
						>
							<SvgIcon name={joined ? 'log-out' : 'log-in'} size={14} color={'#fff'} style={{ marginRight: 4 }} />
							<span style={styles.joinTextSmall}>{joinLabel}</span>
						</button>
					</div>
					<div style={styles.statsBelowNameRow}>
						<div style={{...styles.statInlineCompact, ...{ backgroundColor: colors.text + '08'}}> 
							<SvgIcon name="users" size={12} color={colors.text} style={{ marginRight: 3 }} />
							<span style={{...styles.statValueInline, ...{ color: colors.text }}}>{members}</span>
						</div>
					</div>
					<span style={{...styles.descriptionInline, ...{ color: colors.text + 'CC' }}} numberOfLines={3}>{description}</span>
				</div>
				<div style={{...styles.avatarCircleSmall, ...{ borderColor: accent}}> 
					{icon && icon.includes('<svg') ? (
						<SvgIcon 
							svgString={icon} 
							size={72} 
							color={tribeIconColor} 
						/>
					) : (
						<Icon
							name={tribeIconName}
							size={48}
							color={tribeIconColor}
							accessibilityElementsHidden={false}
							importantForAccessibility="no-hide-descendants"
						/>
					)}
				</div>
			</div>
			{/* botão movido para a linha do título */}
		</div>
	);
}

const styles = {
	card: {
		borderWidth: 1,
		borderRadius: 22,
		padding: 18,
		marginHorizontal: 16,
		marginTop: 16,
	},
// topRow removed (button moved below description)
	joinBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 10,
	},
	joinBtnSmall: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 10,
	},
	joinTextSmall: {
		color: '#fff',
		fontSize: 12,
		fontFamily: family.bold,
	},
	titleRowWithButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 2,
	},
	topRowHorizontal: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	avatarCircleSmall: {
		width: 100,
		height: 100,
		borderRadius: 999,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	avatarSymbolSmall: {},
	rightBlock: {
		flex: 1,
		justifyContent: 'center',
	},
	titleLeft: {
		fontSize: 24,
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
	statsRowLeft: {
		flexDirection: 'row',
		marginTop: 8,
	},
	inlineHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	inlineStatsWrapper: {
		flexDirection: 'row',
		marginLeft: 10,
		alignItems: 'center',
		flexShrink: 0,
	},
	statsBelowNameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 6,
	},
	statInlineCompact: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 7,
		borderWidth: 1,
		marginRight: 6,
	},
	statInline: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 8,
		borderWidth: 1,
		marginRight: 8,
	},
	statValueInline: {
		fontSize: 13,
		fontFamily: family.bold,
	},
	descriptionInline: {
		fontSize: 13,
		fontFamily: family.medium,
		marginTop: 6,
		lineHeight: 18,
	},
	joinText: {
		color: '#fff',
		fontSize: 14,
		fontFamily: family.bold,
	},
	avatarWrapper: {
		alignItems: 'center',
		marginTop: 10,
	},
	avatarCircle: {
		width: 120,
		height: 120,
		borderRadius: 999,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 14,
	},
	avatarSymbol: {
		fontSize: 42,
		fontFamily: family.semibold,
	},
	title: {
		fontSize: 24,
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
	statsRow: {
		flexDirection: 'row',
		marginTop: 14,
	},
	statPill: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 10,
		borderWidth: 1,
		marginHorizontal: 4,
	},
	statValue: {
		fontSize: 14,
		fontFamily: family.bold,
	},
	description: {
		fontSize: 13,
		fontFamily: family.medium,
		textAlign: 'center',
		marginTop: 16,
		lineHeight: 18,
	},
};
