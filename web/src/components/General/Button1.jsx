import React, { useEffect, useRef, useState } from 'react';
// Easing removed
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';

/**
 * Clash Royale style animated button.
 * Props:
 *  - label   : string (text inside the button)
 *  - color   : base hex color (main face). Falls back to theme primary.
 *  - onPress : function
 *  - style   : style override (applied to outer container)
 *
 * Visual / Motion:
 *  - Layered 3D stack (dark back plate + gradient face)
 *  - Gradient now: [prop color, theme.secondary]
 *  - Subtle floating/bobbing idle animation
 *  - Periodic shine sweep across the face (off-screen start)
 *  - Gentle breathing glow (reduced)
 *  - Press effect: compress + slight darken
 *  - Internal color palette removed (simplified)
 */
export default function Button1({ label, color, onPress, style }) {
	const themeColors = useThemeColors();
	const { translate } = useTranslate();
	const resolvedLabel = label || translate('common.play');
	const baseColor = color || themeColors.primary;
	
	// Determine gradient colors based on the base color
	const isYellow = baseColor && (baseColor.toLowerCase().includes('#ffd') || baseColor.toLowerCase().includes('#ff') || baseColor.toLowerCase() === '#ffd700');
	const gradientColors = isYellow ? [baseColor, '#FFA500'] : [baseColor, themeColors.secondary];

	// Quick utilities (keep small footprint)
	const hexToRgb = (h) => {
		let x = h?.replace('#', '') || '000000';
		if (x.length === 3) x = x.split('').map(c => c + c).join('');
		const n = parseInt(x, 16);
		return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 });
	};
	const rgbToHex = ({ r, g, b }) => '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
	const mix = (a, b, t) => ({ r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t) });
	const addAlpha = (hex, alpha) => {
		const { r, g, b } = hexToRgb(hex);
		return `rgba(${r},${g},${b},${alpha})`;
	};
	const darken = (hex, amt = 0.25) => {
		const rgb = hexToRgb(hex); const d = mix(rgb, { r: 0, g: 0, b: 0 }, amt); return rgbToHex(d);
	};
	const lighten = (hex, amt = 0.4) => {
		const rgb = hexToRgb(hex); const l = mix(rgb, { r: 255, g: 255, b: 255 }, amt); return rgbToHex(l);
	};

	const borderColor = darken(baseColor, 0.28); // menos escuro para contorno mais leve
	// back plate removido para clarear o botão
	// innerShadow removido (sem sombra inferior interna)
	const highlightStart = addAlpha('#FFFFFF', 0.85);
	const highlightMid = addAlpha('#FFFFFF', 0.25);
	const sparkColor = addAlpha('#FFFFFF', 0.65);
	const auraColor = addAlpha(lighten(baseColor, 0.3), 0.35);
	const textStrokeColor = darken(baseColor, 0.35); // stroke mais suave
	const textStrokeShadow = addAlpha(darken(baseColor, 0.5), 0.55); // sombra de texto menos intensa

	// Animated values
	const bob = useRef(new Animated.Value(0)).current;           // vertical bob
	const glow = useRef(new Animated.Value(0)).current;          // glow pulse
	const shine = useRef(new Animated.Value(0)).current;         // shine translate
	const pressAnim = useRef(new Animated.Value(0)).current;     // 0 idle, 1 pressed
	const [faceW, setFaceW] = useState(0); // measured face width for proper shine travel

	useEffect(() => {
		// Idle bobbing
		Animated.loop(
			Animated.sequence([
				Animated.timing(bob, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
				Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
			])
		).start();

		// Glow breathing
		Animated.loop(
			Animated.sequence([
				Animated.timing(glow, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
				Animated.timing(glow, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
			])
		).start();

		// Shine sweep (loop with delay between sweeps)
		let cancelled = false;
		const runSweep = () => {
			if (cancelled) return;
			shine.setValue(0);
			Animated.sequence([
				Animated.delay(900),
				Animated.timing(shine, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
				Animated.delay(1600),
			]).start(({ finished }) => { if (finished && !cancelled) runSweep(); };
		};
		runSweep();
		return () => { cancelled = true; });
	}, [bob, glow, shine]);

	// Interpolations
	const bobTranslate = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
	// Reduced breathing amplitude (smaller effect)
	const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1.0] });
	const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.18] });
	// Shine travels fully across using numeric pixel values (percent strings break native driver)
	const startX = faceW ? -1.2 * faceW : -400; // further off-screen so it's not visible initially
	const endX = faceW ? 1.2 * faceW : 400;
	const shineX = shine.interpolate({ inputRange: [0, 1], outputRange: [startX, endX] });
	// Opacity stays 0 at rest, fades in quickly, stays, then fades out near end
	const shineOpacity = shine.interpolate({
		inputRange: [0, 0.08, 0.85, 1],
		outputRange: [0, 0.55, 0.55, 0],
		// clamp is default
	});
	const pressScale = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
	const pressTranslate = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });

	const handlePressIn = () => {
		Animated.timing(pressAnim, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
	};
	const handlePressOut = () => {
		Animated.timing(pressAnim, { toValue: 0, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
	};

	return (
		<Animated.View style={[styles.wrapper, { transform: [{ translateY: bobTranslate }] }, style]}>      
			{/* Outer subtle aura */}
			<Animated.View style={[styles.aura, { opacity: glowOpacity, transform: [{ scale: glowScale }], backgroundColor: auraColor }]} />

			<button 				
				aria-label={resolvedLabel}
				onClick={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={styles.pressArea}
			>
				<Animated.View style={{ transform: [{ translateY: pressTranslate }, { scale: pressScale }] }}>
					{/* Back plate removida para reduzir tons escuros */}
					{/* Main face with gradient */}
					<LinearGradient
						colors={gradientColors}
						start={{ x: 0.25, y: 0 }}
						end={{ x: 0.9, y: 1 }}
						style={{...styles.face, ...{ borderColor: borderColor }}}
						onLayout={(e) => setFaceW(e.nativeEvent.layout.width)}>
						{/* Inner top highlight */}
						<LinearGradient
							colors={[highlightStart, highlightMid, 'rgba(255,255,255,0)']}
							start={{ x: 0.5, y: 0 }}
							end={{ x: 0.5, y: 1 }}
							style={styles.innerHighlight}
						/>
						{/* Bottom inner shadow removida */}
						{/* Shine sweep (now starts invisible off-screen) */}
						<Animated.View style={[styles.shine, { opacity: shineOpacity, transform: [{ translateX: shineX }, { rotate: '18deg' }] }]}>              
							<LinearGradient
								colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
								locations={[0, 0.5, 1]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={styles.shineGrad}
							/>
						</Animated.View>
						{/* Text layers */}
						<div style={styles.textWrap} pointerEvents="none">
							<span style={{...styles.text, ...styles.textStroke}}>{resolvedLabel}</span>
							<span style={{...styles.text, ...{ color: themeColors.text }}}>{resolvedLabel}</span>
						</div>
					</LinearGradient>
					{/* Specular dot */}
						<div style={{...styles.spark, ...{ backgroundColor: sparkColor }}} />
				</Animated.View>
			</button>
		</Animated.View>
	);
}

const styles = {
	wrapper: {
		alignSelf: 'center',
		minWidth: 160,
		// Removed vertical padding so the aura can be perfectly centered
	},
	pressArea: {
		alignSelf: 'stretch',
	},
	aura: {
		position: 'absolute',
		top: -16, left: -20, right: -20, bottom: -16, // symmetric expansion around button
		borderRadius: 40,
	},
	// plateBack removida (eliminado tom escuro extra)
	face: {
		height: 60,
		borderRadius: 20,
		borderWidth: 3,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 26,
		// sombra suavizada
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.14,
		shadowRadius: 5,
		elevation: 2,
		overflow: 'hidden',
	},
	innerHighlight: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: '70%',
	},
	// innerShadow style removido
	shine: {
		position: 'absolute',
		top: -20,
		bottom: -20,
		width: 110,
		opacity: 0.55,
	},
	shineGrad: { flex: 1 },
	textWrap: { position: 'relative' },
	text: {
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: 0.4,
	},
	textStroke: {
		position: 'absolute',
		top: 0,
		left: 0,
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 3,
	},
	spark: {
		position: 'absolute',
		top: 10,
		right: 16,
		width: 26,
		height: 12,
		borderRadius: 12,
	},
};
