import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../General/SvgIcon.jsx';
import { family } from '../../constants/font.jsx';

export default function TribesHeader({
	title,
	allTribes = [],
	userTribe,
	isInTribe = false,
	onSelect,
	selectedTribe,
}) {
	const colors = useThemeColors();
	const width = typeof window !== 'undefined' ? window.innerWidth : 0;
	const horizontalPadding = width >= 768 ? 28 : 16;

	const sortedTribes = useMemo(() => {
		if (!isInTribe || !userTribe) {
			return allTribes;
		}

		const userTribeData = allTribes.find((tribe) => tribe.id === userTribe.id);
		const otherTribes = allTribes.filter((tribe) => tribe.id !== userTribe.id);
		return userTribeData ? [userTribeData, ...otherTribes] : allTribes;
	}, [allTribes, userTribe, isInTribe]);

	const [active, setActive] = useState(() => selectedTribe?.id || userTribe?.id || sortedTribes[0]?.id || null);

	// Atualizar active quando selectedTribe mudar (navegação externa)
	useEffect(() => {
		if (selectedTribe?.id && selectedTribe.id !== active) {
			console.log('[TribesHeader] Updating active to selectedTribe:', selectedTribe.name, 'id:', selectedTribe.id);
			setActive(selectedTribe.id);
		}
	}, [selectedTribe]);

	useEffect(() => {
		if (!sortedTribes.length) {
			setActive(null);
			return;
		}
		const stillExists = active ? sortedTribes.some((tribe) => tribe.id === active) : false;
		if (!stillExists) {
			const defaultId = (isInTribe && userTribe?.id) || sortedTribes[0]?.id;
			setActive(defaultId ?? null);
			if (defaultId) {
				const defaultTribe = sortedTribes.find((tribe) => tribe.id === defaultId);
				if (defaultTribe && onSelect) {
					onSelect(defaultTribe);
				}
			}
		}
	}, [sortedTribes, active, isInTribe, userTribe, onSelect]);

	const handlePress = useCallback(
		(tribe) => {
			setActive(tribe.id);
			onSelect?.(tribe);
		},
		[onSelect],
	);

	return (
		<div style={styles.container}>
			{title ? (
				<div style={{ ...styles.titleRow }}>
					<span style={{ ...styles.title, color: colors.text }}>{title}</span>
				</div>
			) : null}
			<div
				style={{
					...styles.scrollContent,
					paddingLeft: horizontalPadding,
					paddingRight: horizontalPadding,
				}}
			>
				{sortedTribes.map((tribe) => {
					const isActive = tribe.id === active;
					const tribeColor = tribe.color || colors.primary;
					const tribeIconColor = tribe.iconColor || colors.text;

					return (
						<button
							type="button"
							key={tribe.id}
							onClick={() => handlePress(tribe)}
							style={{
								...styles.tribeWrapper,
								transform: isActive ? 'scale(1)' : 'scale(0.78)',
						}}
						>
							<div
								style={{
									...styles.pill,
									backgroundColor: tribeColor,
									borderColor: tribeColor,
								}}
							>
								<div style={styles.symbolContainer}>
									{tribe.icon && tribe.icon.includes('<svg') ? (
										<SvgIcon svgString={tribe.icon} size={60} color={tribeIconColor} />
									) : (
										<span style={{ ...styles.symbol, color: tribeIconColor }}>
											{tribe.icon || '◇'}
										</span>
									)}
								</div>
							</div>
							<span
								style={{
									...styles.tribeLabel,
									color: colors.text,
								}}
							>
								{tribe.name}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

const styles = {
	container: {
		width: '100%',
		paddingTop: 4,
		paddingBottom: 10,
		overflow: 'visible',
	},
	titleRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 4,
	},
	title: {
		fontSize: 22,
		fontFamily: family.bold,
		letterSpacing: 0.5,
	},
	scrollContent: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		overflowX: 'auto',
		gap: 16,
		paddingTop: 16,
		paddingBottom: 16,
	},
	tribeWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'flex-start',
		gap: 8,
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		outline: 'none',
		padding: 0,
		transition: 'transform 0.25s ease, box-shadow 0.25s ease',
	},
	pill: {
		width: 92,
		height: 68,
		borderRadius: 26,
		borderWidth: '2px',
		borderStyle: 'solid',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
	},
	symbolContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	symbol: {
		fontSize: 32,
		fontFamily: family.semibold,
	},
	tribeLabel: {
		fontSize: 12,
		fontFamily: family.bold,
		fontStyle: 'italic',
		textAlign: 'center',
		maxWidth: 92,
	},
};
