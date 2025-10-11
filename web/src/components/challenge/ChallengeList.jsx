import React, { useMemo } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import ChallengeCard from './ChallengeCard.jsx';

// items: [{ id, title, description, coins, expiresAt }]
export default function ChallengeList({ title = 'DESAFIOS', items = [], onPressItem, showHeader = true }) {
	const colors = useThemeColors();

	const data = useMemo(() => items || [], [items]);

	return (
		<div style={{ marginTop: 8 }}>
			{showHeader ? (
				<div style={{ marginTop: 8, marginBottom: 4, paddingLeft: 6, paddingRight: 6 }}>
					<div style={{
						fontSize: 20,
						fontWeight: 900,
						letterSpacing: 1.2,
						color: '#F05454'
					}}>{title}</div>
					<div style={{
						height: 2,
						width: 96,
						borderRadius: 2,
						marginTop: 2,
						backgroundColor: '#F05454'
					}} />
				</div>
			) : null}
			<div style={{
				paddingBottom: 120,
				overflowY: 'auto'
			}}>
				{data.map((item, idx) => (
					<ChallengeCard
						key={`challenge-${item.id || idx}`}
						title={item.title}
						description={item.description}
						coins={item.coins}
						expiresAt={item.expiresAt}
						availableUntil={item.availableUntil}
						availableFrom={item.availableFrom}
						imageUrl={item.imageUrl}
						userHasPlayed={item.userHasPlayed}
						onPress={onPressItem ? () => onPressItem(item) : undefined}
					/>
				))}
				<div style={{ height: 120 }} />
			</div>
		</div>
	);
}
