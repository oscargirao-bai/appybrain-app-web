import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../common/Icon.jsx';
import SvgIcon from '../common/SvgIcon.jsx';

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
			backgroundColor: colors.surface || colors.background,
			border: `1px solid ${colors.text}22`,
			borderRadius: 22,
			padding: 18,
			marginLeft: 16,
			marginRight: 16,
			marginTop: 16
		}}>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
				<div style={{ flex: 1, justifyContent: 'center' }}>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
						<span style={{
							fontSize: 24,
							fontWeight: 700,
							color: colors.text,
							flex: 1,
							letterSpacing: 0.5,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis'
						}}>{name}</span>
						<button
							onClick={joined ? onLeave : onJoin}
							disabled={!joined && disabledJoin}
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								paddingLeft: 10,
								paddingRight: 10,
								paddingTop: 6,
								paddingBottom: 6,
								borderRadius: 10,
								backgroundColor: joined ? colors.error : (disabledJoin ? `${colors.text}33` : colors.correct),
								border: 'none',
								cursor: (!joined && disabledJoin) ? 'not-allowed' : 'pointer',
								opacity: (!joined && disabledJoin) ? 0.6 : 1
							}}
							aria-label={`${joined ? 'Sair da' : 'Entrar na'} tribo ${name}`}
						>
							<Icon name={joined ? 'log-out' : 'log-in'} size={14} color="#fff" style={{ marginRight: 4 }} />
							<span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{joinLabel}</span>
						</button>
					</div>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
						<div style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
							paddingLeft: 8,
							paddingRight: 8,
							paddingTop: 3,
							paddingBottom: 3,
							borderRadius: 7,
							border: `1px solid ${colors.text}22`,
							backgroundColor: `${colors.text}08`,
							marginRight: 6
						}}>
							<Icon name="users" size={12} color={colors.text} style={{ marginRight: 3 }} />
							<span style={{ fontSize: 13, fontWeight: 700, color: colors.text }}>{members}</span>
						</div>
					</div>
					<p style={{
						fontSize: 13,
						fontWeight: 500,
						color: `${colors.text}CC`,
						marginTop: 6,
						lineHeight: '18px',
						margin: '6px 0 0 0',
						display: '-webkit-box',
						WebkitLineClamp: 3,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}>{description}</p>
				</div>
				<div style={{
					width: 100,
					height: 100,
					borderRadius: 999,
					border: `2px solid ${accent}`,
					backgroundColor: accent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					marginLeft: 14,
					marginRight: 0
				}}>
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
						/>
					)}
				</div>
			</div>
		</div>
	);
}
