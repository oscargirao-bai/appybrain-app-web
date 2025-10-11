import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../common/Icon.jsx';

// ChallengeCard
// Props: { title, description, coins, expiresAt, availableUntil, imageUrl, onPress, userHasPlayed, availableFrom }
export default function ChallengeCard({
	title,
	description,
	coins = 0,
	expiresAt,
	availableUntil,
	availableFrom,
	imageUrl,
	onPress,
	userHasPlayed = 0
}) {
	const colors = useThemeColors();

	// Determine challenge state
	const now = new Date();
	const startTime = availableFrom ? new Date(availableFrom) : null;
	const endTime = availableUntil ? new Date(availableUntil) : null;

	const isCompleted = userHasPlayed === 1;
	const isExpired = endTime && now > endTime;
	const isNotStarted = startTime && now < startTime;
	const isAvailable = !isCompleted && !isExpired && !isNotStarted;

	const timeLeftLabel = useMemo(() => {
		// Use availableUntil from API or fallback to expiresAt
		const endTime = availableUntil || expiresAt;
		if (!endTime) return null;

		const now = Date.now();
		const end = typeof endTime === 'string' ? new Date(endTime).getTime() :
			typeof endTime === 'number' ? endTime : new Date(endTime).getTime();

		if (end <= now) return 'Expirado';

		let diff = Math.max(0, end - now);
		const days = Math.floor(diff / (24 * 60 * 60 * 1000));
		diff -= days * 24 * 60 * 60 * 1000;
		const hours = Math.floor(diff / (60 * 60 * 1000));
		diff -= hours * 60 * 60 * 1000;
		const minutes = Math.floor(diff / (60 * 1000));
		return `${days}d:${hours}h:${minutes}m`;
	}, [expiresAt, availableUntil]);

	return (
		<button
			onClick={isAvailable ? onPress : undefined}
			disabled={!isAvailable}
			style={{
				display: 'flex',
				flexDirection: 'row',
				border: `1px solid ${colors.text}${isAvailable ? '15' : '08'}`,
				borderRadius: 16,
				padding: 12,
				marginTop: 12,
				backgroundColor: `${colors.text}${isAvailable ? '08' : '05'}`,
				opacity: isAvailable ? 1 : 0.6,
				cursor: isAvailable ? 'pointer' : 'default',
				width: '100%',
				textAlign: 'left'
			}}
		>
			<div style={{
				width: 52,
				height: 52,
				borderRadius: 14,
				border: `1px solid ${colors.text}${isAvailable ? '22' : '10'}`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				marginRight: 12,
				backgroundColor: colors.surface,
				position: 'relative'
			}}>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={title}
						style={{
							width: 40,
							height: 40,
							borderRadius: 10,
							objectFit: 'contain',
							opacity: isAvailable ? 1 : 0.5
						}}
					/>
				) : (
					<Icon name="file-text" size={26} color={isAvailable ? colors.secondary : colors.muted} />
				)}
				{isCompleted && (
					<div style={{
						position: 'absolute',
						top: -4,
						right: -4,
						width: 20,
						height: 20,
						borderRadius: 10,
						backgroundColor: colors.success,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
						<Icon name="check" size={12} color="white" />
					</div>
				)}
				{isExpired && !isCompleted && (
					<div style={{
						position: 'absolute',
						top: -4,
						right: -4,
						width: 20,
						height: 20,
						borderRadius: 10,
						backgroundColor: colors.danger || '#FF6B6B',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}>
						<Icon name="x" size={12} color="white" />
					</div>
				)}
			</div>
			<div style={{ flex: 1 }}>
				<div style={{
					fontSize: 16,
					fontWeight: 800,
					marginBottom: 2,
					color: isAvailable ? colors.secondary : colors.muted,
					whiteSpace: 'nowrap',
					overflow: 'hidden',
					textOverflow: 'ellipsis'
				}}>
					{title}
				</div>
				{description ? (
					<div style={{
						fontSize: 13,
						lineHeight: '18px',
						marginBottom: 8,
						color: `${isAvailable ? colors.text : colors.muted}CC`,
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}>
						{description}
					</div>
				) : null}
				<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
						<Icon name="coins" size={18} color={isAvailable ? colors.primary : colors.muted} />
						<span style={{
							fontSize: 13,
							fontWeight: 800,
							color: isAvailable ? colors.primary : colors.muted,
							marginLeft: 6
						}}>
							{coins}
						</span>
					</div>
					{timeLeftLabel ? (
						<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
							<Icon name="clock" size={18} color={colors.muted} />
							<span style={{
								fontSize: 13,
								fontWeight: 700,
								color: colors.muted,
								marginLeft: 6
							}}>
								{timeLeftLabel}
							</span>
						</div>
					) : null}
					{isCompleted && (
						<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
							<span style={{
								fontSize: 12,
								fontWeight: 600,
								color: colors.muted
							}}>
								Completado
							</span>
						</div>
					)}
				</div>
			</div>
		</button>
	);
}
