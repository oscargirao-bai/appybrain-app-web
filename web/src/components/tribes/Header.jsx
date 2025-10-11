import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../common/SvgIcon.jsx';

export default function TribesHeader({
	title = 'Tribos',
	allTribes = [],
	userTribe,
	isInTribe = false,
	onSelect
}) {
	const colors = useThemeColors();

	// Sort tribes: user's tribe first, then others
	const sortedTribes = useMemo(() => {
		if (!isInTribe || !userTribe) {
			return allTribes;
		}

		const userTribeData = allTribes.find(t => t.id === userTribe.id);
		const otherTribes = allTribes.filter(t => t.id !== userTribe.id);

		return userTribeData ? [userTribeData, ...otherTribes] : allTribes;
	}, [allTribes, userTribe, isInTribe]);

	// Use the sorted list of tribes
	const [active, setActive] = useState(userTribe?.id || sortedTribes[0]?.id || null);

	useEffect(() => {
		// Only set initial active tribe if none is selected yet
		if (!active && sortedTribes.length > 0) {
			// Set default to user's tribe if they have one, otherwise first tribe
			const defaultTribe = (isInTribe && userTribe) ? userTribe.id : sortedTribes[0].id;
			setActive(defaultTribe);
		}
	}, [sortedTribes, active, isInTribe, userTribe]);

	// Scale animation state
	const [scaleStates, setScaleStates] = useState({});

	// Update animations when active tribe changes
	useEffect(() => {
		const newScales = {};
		sortedTribes.forEach(t => {
			newScales[t.id] = t.id === active ? 1 : 0.75;
		});
		setScaleStates(newScales);
	}, [active, sortedTribes]);

	const handlePress = (tribe) => {
		setActive(tribe.id);
		onSelect && onSelect(tribe);
	};

	return (
		<div style={{
			paddingTop: 4,
			paddingBottom: 10,
			paddingLeft: 16,
			paddingRight: 16,
			overflow: 'visible'
		}}>
			<div style={{
				display: 'flex',
				flexDirection: 'row',
				overflowX: 'auto',
				paddingTop: 16,
				paddingBottom: 16,
				paddingLeft: 16,
				paddingRight: 4,
				gap: 12
			}}>
				{sortedTribes.map(t => {
					const isActive = t.id === active;
					const isUserTribe = isInTribe && userTribe && t.id === userTribe.id;
					const scale = scaleStates[t.id] || 0.94;

					// Use the tribe's color or fallback to theme color
					const tribeColor = t.color || colors.primary;
					const tribeIconColor = t.iconColor || colors.text;

					return (
						<div
							key={t.id}
							style={{
								width: 92,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								marginLeft: 4,
								overflow: 'visible',
								...(isActive ? {
									filter: `drop-shadow(0 0 12px ${tribeColor})`,
								} : {})
							}}
						>
							<button
								onClick={() => handlePress(t)}
								style={{
									width: '100%',
									aspectRatio: '1.35',
									border: `2px solid ${isActive ? tribeColor : colors.border}`,
									borderRadius: 26,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									backgroundColor: tribeColor,
									cursor: 'pointer',
									padding: 0,
									...(isActive ? {
										boxShadow: `0 0 12px ${tribeColor}cc`,
									} : {})
								}}
								aria-label={`Abrir tribo ${t.name}`}
							>
								<div style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									transform: `scale(${scale})`,
									transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
								}}>
									{t.icon && t.icon.includes('<svg') ? (
										<SvgIcon
											svgString={t.icon}
											size={60}
											color={tribeIconColor}
										/>
									) : (
										<span style={{
											fontSize: 32,
											fontWeight: 600,
											color: tribeIconColor
										}}>
											{t.icon || '◇'}
										</span>
									)}
								</div>
							</button>
							<span style={{
								marginTop: 6,
								fontSize: 12,
								fontStyle: 'italic',
								fontWeight: isActive ? 800 : 700,
								color: colors.text,
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								maxWidth: '100%'
							}}>
								{t.name}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
