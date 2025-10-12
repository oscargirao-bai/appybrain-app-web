import React, { useEffect, useRef } from 'react';
import LucideIcon from './LucideIcon.jsx';
import { useThemeColors } from '../../services/Theme.jsx';

/**
 * Custom bottom NavBar (tab bar) used in MainTabs.
 * Props:
 *  - icons: string[] lucide icon names (length = number of tabs)
 *  - currentPage: number (active index)
 *  - handleTabPress: (index:number)=>void
 */
export default function NavBar({ icons = [], currentPage = 0, handleTabPress }) {
	const colors = useThemeColors();
	const containersRef = useRef([]);

	const activeColor = () => colors.primary;
	const barBg = colors.card || colors.background;
	const barBorder = colors.border || (colors.text + '25');

	const innerPadding = 18;

	return (
		<div style={{ 
			position: 'fixed',
			bottom: 0,
			left: '50%',
			transform: 'translateX(-50%)',
			backgroundColor: barBg,
			width: '100%',
			minWidth: '375px',
			maxWidth: '600px',
			zIndex: 1000
		}}>
			<div style={{...styles.container, ...{
					backgroundColor: barBg,
					borderColor: barBorder,
					width: '100%',
					paddingBottom: innerPadding,
					minHeight: 64}}}>        
				{/* Dot/underline indicator */}
				{icons.length > 0 && (
					<div
						style={{...styles.indicator, 
								backgroundColor: activeColor(currentPage),
								pointerEvents: 'none'}}
					/>
				)}
				{icons.map((icon, i) => {
					const isActive = i === currentPage;
					return (
						<button
							key={icon + i}
							ref={(el) => {
								if (el) {
									const { offsetLeft: x, offsetWidth: w } = el;
									containersRef.current[i] = { x, w };
								}
							}}
							style={{...styles.tabBtn, 
									opacity: isActive ? 1 : 0.65,
									transform: isActive ? 'scale(1.15)' : 'scale(1)'}}
							onClick={() => handleTabPress?.(i)}
						>
							<LucideIcon
								name={icon}
								size={24}
								color={isActive ? activeColor(i) : colors.text + '80'}
							/>
						</button>
					);
				})}
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 14,
		minHeight: 64,
		paddingLeft: 12,
		paddingRight: 12,
		borderTop: '1px solid',
		borderRadius: 0,
		backdropFilter: 'blur(10px)',
	},
	tabBtn: {
		flex: 1,
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		border: 'none',
		background: 'transparent',
		cursor: 'pointer',
		transition: 'transform 0.2s ease',
	},
	indicator: {
		position: 'absolute',
		bottom: 22,
		height: 6,
		width: 40,
		borderRadius: 4,
	},
};
