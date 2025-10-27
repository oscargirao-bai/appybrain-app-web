import React, { useEffect, useRef, useState } from 'react';
import LucideIcon from './LucideIcon.jsx';
import { useThemeColors, useTheme } from '../../services/Theme.jsx';

/**
 * Custom bottom NavBar (tab bar) used in MainTabs.
 * Props:
 *  - icons: string[] lucide icon names (length = number of tabs)
 *  - currentPage: number (active index)
 *  - handleTabPress: (index:number)=>void
 */
export default function NavBar({ icons = [], currentPage = 0, handleTabPress }) {
	const colors = useThemeColors();
	const { resolvedTheme } = useTheme();
	const containersRef = useRef([]);
	const containerWrapRef = useRef(null);
	const [indicatorLeft, setIndicatorLeft] = useState(0);
	const [indicatorReady, setIndicatorReady] = useState(false);

	const activeColor = () => colors.primary;
	const barBg = colors.card || colors.background;
	const barBorder = colors.border || (colors.text + '25');

	const indicatorWidth = 40;
	const innerPadding = 18;

	// Measure and position the indicator under the active tab
	const updateIndicator = () => {
		const item = containersRef.current[currentPage];
		if (!item) return false;
		const { x, w } = item;
		const left = x + Math.max(0, (w - indicatorWidth) / 2);
		setIndicatorLeft(left);
		setIndicatorReady(true);
		return true;
	};

	useEffect(() => {
		// Try on next frame to ensure refs are laid out
		let raf = requestAnimationFrame(() => {
			if (!updateIndicator()) {
				// Try again shortly if layout not ready
				raf = requestAnimationFrame(updateIndicator);
			}
		});
		return () => cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, icons.length]);

	useEffect(() => {
		// Recalculate on resize to keep indicator centered
		const onResize = () => {
			updateIndicator();
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div ref={containerWrapRef} style={{ 
			position: 'relative',
			backgroundColor: barBg,
			width: '100%',
			boxSizing: 'border-box',
			zIndex: 2
		}}>
			<div style={{...styles.container, ...{
					backgroundColor: barBg,
					borderColor: barBorder,
					width: '100%',
					paddingBottom: innerPadding,
					boxSizing: 'border-box',
					minHeight: 64}}}>        
				{/* Underline indicator (always visible under active tab) */}
				{icons.length > 0 && (
					<div
						style={{
							...styles.indicator,
							backgroundColor: activeColor(currentPage),
							width: indicatorWidth,
							left: indicatorLeft,
							opacity: indicatorReady ? 1 : 0,
							pointerEvents: 'none'
						}}
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
								color={(() => {
									if (isActive) return activeColor(i);
									// In light mode only, render Learn (book) and Battle (swords) as black when inactive.
									// In dark mode keep the existing white/text color so contrast remains correct.
									if (resolvedTheme === 'light' && (icon === 'book' || icon === 'swords')) return '#000000';
									return colors.text + '80';
								})()}
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
		bottom: 18,
		height: 6,
		borderRadius: 4,
		transition: 'left 180ms ease, opacity 120ms ease',
	},
};
