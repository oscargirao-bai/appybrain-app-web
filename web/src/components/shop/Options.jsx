import React, { useState, useRef, useEffect } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import Icon from '../common/Icon.jsx';

// Horizontal selectable options bar for Shop categories
// Only three icon options: avatar, background, frames
export default function Options({
	value,
	onChange,
	style,
	height = 44,
	minWidth = 72,
	iconSize = 22,
	radius = 18,
	gap = 12,
}) {
	const colors = useThemeColors();
	const options = [
		{ key: 'avatar', icon: 'user', label: 'Avatar' },
		{ key: 'background', icon: 'image', label: 'Background' },
		{ key: 'frames', icon: 'square', label: 'Molduras' },
	];
	const [internal, setInternal] = useState('avatar');
	const current = value ?? internal;

	// Animation state (positions for sliding highlight)
	const [highlightStyle, setHighlightStyle] = useState({ x: 0, w: minWidth });
	const layoutsRef = useRef({});

	// Trigger slide when current changes and layout known
	useEffect(() => {
		const lay = layoutsRef.current[current];
		if (lay) {
			setHighlightStyle({ x: lay.x, w: lay.w });
		}
	}, [current]);

	function select(k) {
		if (value == null) setInternal(k);
		onChange && onChange(k);
	}

	return (
		<div style={{
			marginTop: 12,
			alignSelf: 'center',
			border: `2px solid ${colors.primary}22`,
			backgroundColor: `${colors.background}11`,
			borderRadius: 28,
			paddingTop: 8,
			paddingBottom: 8,
			paddingLeft: 14,
			paddingRight: 14,
			...style
		}}>
			<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
				{/* Sliding highlight */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						height,
						borderRadius: radius,
						backgroundColor: colors.primary,
						transform: `translateX(${highlightStyle.x}px)`,
						width: highlightStyle.w,
						transition: 'transform 260ms cubic-bezier(0.25, 0.1, 0.25, 1), width 260ms cubic-bezier(0.25, 0.1, 0.25, 1)',
						pointerEvents: 'none'
					}}
				/>
				{options.map(opt => {
					const active = opt.key === current;
					return (
						<button
							key={opt.key}
							ref={el => {
								if (el) {
									const rect = el.getBoundingClientRect();
									const parentRect = el.parentElement.getBoundingClientRect();
									layoutsRef.current[opt.key] = { x: rect.left - parentRect.left, w: rect.width };
									// If first render matches current ensure highlight in place
									if (opt.key === current && highlightStyle.w === minWidth && highlightStyle.x === 0) {
										setHighlightStyle({ x: rect.left - parentRect.left, w: rect.width });
									}
								}
							}}
							onClick={() => select(opt.key)}
							style={{
								minWidth,
								height,
								borderRadius: radius,
								marginRight: 12,
								paddingLeft: 14,
								paddingRight: 14,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								background: 'transparent',
								border: 'none',
								cursor: 'pointer',
								position: 'relative',
								zIndex: 1
							}}
							aria-label={`Selecionar ${opt.label}`}
						>
							<Icon name={opt.icon} size={iconSize} color={active ? colors.background : colors.primary} />
						</button>
					);
				})}
			</div>
		</div>
	);
}
