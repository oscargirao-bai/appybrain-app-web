import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import LucideIcon from '../General/LucideIcon.jsx';
import { family } from '../../constants/font.jsx';

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
		<div style={{
			...styles.card,
			backgroundColor: colors.surface || colors.background,
			borderColor: colors.text + '22'
		}}>
			<div style={styles.topRowHorizontal}>
				<div style={styles.rightBlock}>
					<div style={styles.titleRowWithButton}>
						<span style={{
							...styles.titleLeft,
							color: colors.text,
							flex: 1,
							display: '-webkit-box',
							WebkitLineClamp: 1,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
						}}>
							{name}
						</span>
						<button
							onClick={joined ? onLeave : onJoin}
							disabled={!joined && disabledJoin}
							style={{
								...styles.joinBtnSmall,
								backgroundColor: joined ? colors.error : (disabledJoin ? colors.text + '33' : colors.correct),
								opacity: (!joined && disabledJoin) ? 0.5 : 1,
								cursor: (!joined && disabledJoin) ? 'not-allowed' : 'pointer',
							}}
						>
							<LucideIcon name={joined ? 'log-out' : 'log-in'} size={14} color={'#fff'} style={{ marginRight: 4 }} />
							<span style={styles.joinTextSmall}>{joinLabel}</span>
						</button>
					</div>
					<div style={styles.statsBelowNameRow}>
						<div style={{
							...styles.statInlineCompact,
							backgroundColor: colors.text + '08',
							borderColor: colors.text + '22'
						}}>
						<LucideIcon name="users" size={12} color={colors.text} style={{ marginRight: 3 }} />
						<span style={{...styles.statValueInline, color: colors.text}}>{members}</span>
						</div>
					</div>
					<span style={{
						...styles.descriptionInline,
						color: colors.text + 'CC',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
					}}>
						{description}
					</span>
				</div>
				<div style={{
					...styles.avatarCircleSmall,
					borderColor: accent,
					backgroundColor: accent,
					marginRight: 0,
					marginLeft: 14
				}}>
					{icon && icon.includes('<svg') ? (
						<SvgIcon 
							svgString={icon} 
							size={72} 
							color={tribeIconColor} 
						/>
					) : (
						<SvgIcon
							name={tribeIconName}
							size={48}
							color={tribeIconColor}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

const styles = {
	card: {
		borderWidth: '1px',
		borderStyle: 'solid',
		borderRadius: 22,
		padding: 18,
		marginLeft: 16,
		marginRight: 16,
		marginTop: 16,
	},
	joinBtnSmall: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 6,
		paddingBottom: 6,
		borderRadius: 10,
		border: 'none',
	},
	joinTextSmall: {
		color: '#fff',
		fontSize: 12,
		fontFamily: family.bold,
	},
	titleRowWithButton: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 2,
	},
	topRowHorizontal: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	avatarCircleSmall: {
		width: 100,
		height: 100,
		borderRadius: 999,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 14,
	},
	rightBlock: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
	},
	titleLeft: {
		fontSize: 24,
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
	statsBelowNameRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 6,
	},
	statInlineCompact: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 8,
		paddingRight: 8,
		paddingTop: 3,
		paddingBottom: 3,
		borderRadius: 7,
		borderWidth: '1px',
		borderStyle: 'solid',
		marginRight: 6,
	},
	statValueInline: {
		fontSize: 13,
		fontFamily: family.bold,
	},
	descriptionInline: {
		fontSize: 13,
		fontFamily: family.medium,
		marginTop: 6,
		lineHeight: 1.4,
	},
};
