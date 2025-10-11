import React, { useEffect, useRef } from 'react';


import { Lucide } from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';

/**
 * Custom bottom NavBar (tab bar) used in MainTabs.
 * Props:
 *  - icons: string[] lucide icon names (length = number of tabs)
 *  - currentPage: number (active index)
 *  - handleTabPress: (index:number)=>void
 *  - tabColors?: string[] (optional color per tab for active state & indicator)
 */
export default function NavBar({ icons = [], currentPage = 0, handleTabPress }) {
	const colors = useThemeColors();
	const insets = useSafeAreaInsets();
	const indicatorX = useRef(new Animated.Value(0)).current;
	const indicatorW = useRef(new Animated.Value(0)).current;
	const containersRef = useRef([]);

	// Animate indicator whenever currentPage changes
	useEffect(() => {
		const layout = containersRef.current[currentPage];
		if (layout) {
			// Both animations JS-driven to avoid mixing native + JS nodes that caused error
			Animated.spring(indicatorX, { toValue: layout.x + layout.w / 2, useNativeDriver: false, bounciness: 12 }).start();
			Animated.spring(indicatorW, { toValue: layout.w * 0.28, useNativeDriver: false, bounciness: 12 }).start();
		}
	}, [currentPage, indicatorX, indicatorW]);

	const activeColor = () => colors.primary;
	// Use a solid background color from the theme so the nav bar is opaque
	const barBg = colors.card || colors.background;
	const barBorder = colors.border || (colors.text + '25');

	// Non-overlapping layout: bar occupies its own space at the bottom so screens end above it.
	// Use safe-area inset to ensure the bar is always fully visible above system UI (home indicator)
	const bottomPadding = (insets.bottom || 0);
	const innerPadding = 18; // base inner padding used previously

	return (
		<div style={{ backgroundColor: barBg, width: '100%' }}>
			<div style={{...styles.container, ...{
					backgroundColor: barBg}}>        
				{/* Animated dot/underline indicator */}
				{icons.length > 0 && (
					<Animated.View
						pointerEvents="none"
						style={{...styles.indicator, ...{
								backgroundColor: activeColor(currentPage)}}
					/>
				)}
				{icons.map((icon, i) => {
					const isActive = i === currentPage;
					const scale = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;
					useEffect(() => {
						if (isActive) {
							Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, friction: 6 }).start();
						} else {
							Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
						}
					}, [isActive, scale]);
					return (
						<button 							key={icon + i}
							onLayout={(e) => {
								const { x, width: w } = e.nativeEvent.layout;
								containersRef.current[i] = { x, w };
								if (i === currentPage) {
									indicatorX.setValue(x + w / 2);
									indicatorW.setValue(w * 0.28);
								}
							}}
							
							accessibilityState={{ selected: isActive }}
							style={styles.tabBtn}
							onClick={() => handleTabPress?.(i)}
						>
							<Animated.View style={{ transform: [{ scale }] }}>
										<Lucide
											name={icon}
											size={24}
											color={isActive ? activeColor(i) : colors.text + '80'}
											style={{ opacity: isActive ? 1 : 0.65 }}
										/>
									</Animated.View>
						</button>
					);
				})}
			</div>
		</div>
	);
}

const styles = {
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 14,
		minHeight: 64,
		paddingHorizontal: 12,
		borderTopWidth: StyleSheet.hairlineWidth,  // Only top border
		borderRadius: 0,  // Remove rounded corners to fill full width
		backdropFilter: Platform.OS === 'web' ? 'blur(10px)' : undefined,
	},
	tabBtn: {
		flex: 1,
		paddingHorizontal: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	indicator: {
		position: 'absolute',
		bottom: 22,
		height: 6,
		borderRadius: 4,
	},
};

