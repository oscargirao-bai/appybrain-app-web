import React, { useState } from 'react';
import { View, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@react-native-vector-icons/lucide';
import { useNavigation } from '@react-navigation/native';

/**
 * Profile Banner (minimal variant) with support for avatar frames.
 * Layout:
 *  - Solid background (theme primary) + optional banner image
 *  - Centered circular avatar
 *  - Optional frame overlay (PNG com transparência) envolvendo TODO o banner (não apenas o avatar)
 *
 * Props:
 *  - avatarSource: {uri: string} | require('path')
 *  - bannerImageSource: optional background image
 *  - frameSource: optional overlay frame (transparent PNG). Example:
 *      import moldura from '../../../assets/moldura.png';
 *      <Banner frameSource={moldura} />
 *  - frameSizeScale: tweak size ratio of frame vs avatar (default 1.08)
 */
export default function Banner({
	avatarSource,
	bannerImageSource, // optional background
	frameSource, // overlay frame image that wraps the whole banner container
	frameScale = 1, // scale for frame relative to banner size
	bottomFlat = true, // when true, bottom corners are square
	topFlat = false, // NEW: when true, top corners are square
	aspectRatio = 560 / 260, // NEW: width / height (keeps previous 140 height at ~360 width)
    onPress, // optional custom press handler; defaults to navigate to Profile tab
    style, // optional style override for outer wrapper (width/alignment)
}) {
	const colors = useThemeColors();
    const navigation = useNavigation();
	// Default: yellow linear gradient for banner, Lucide user icon for avatar
	const defaultBanner = null; // handled below
	// bannerImg e avatarImg definidos abaixo para evitar duplicação

	const bannerImg = bannerImageSource || null; // null triggers gradient
	const avatarImg = avatarSource || null; // null triggers icon
	const hasBannerImg = !!bannerImg;

	// Cores para avatar default
	const avatarBgLightBlue = '#E3F0FF';
	const avatarIconBlue = '#1856A6';

	const [bannerLoaded, setBannerLoaded] = useState(false);
	const [avatarLoaded, setAvatarLoaded] = useState(false);
	const [frameLoaded, setFrameLoaded] = useState(false);

	// Simplify: remove fade animations (instant render) to avoid transient black/empty artifacts on fast tab switches
	const bannerOpacity = 1;
	const avatarOpacity = 1;
	const frameOpacity = 1;

	function onBannerLoad() { setBannerLoaded(true); }
	function onAvatarLoad() { setAvatarLoaded(true); }
	function onFrameLoad() { setFrameLoaded(true); }

	// dynamic border radius handling
	const topRadius = topFlat ? 0 : 22;
	const bottomRadius = bottomFlat ? 0 : 22;
	const containerRadiusStyle = {
		borderTopLeftRadius: topRadius,
		borderTopRightRadius: topRadius,
		borderBottomLeftRadius: bottomRadius,
		borderBottomRightRadius: bottomRadius,
	};

	// Apply same radius to wrapper to ensure background color matches rounded corners
	const wrapperRadiusStyle = containerRadiusStyle;

    const handlePress = React.useCallback(() => {
        if (typeof onPress === 'function') {
            onPress();
            return;
        }
		// Default behavior: navigate to standalone Profile screen (not in tabs)
		try {
			navigation.navigate('Profile');
        } catch (e) {
            // no-op if navigation not available
        }
    }, [navigation, onPress]);

	return (
	<TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel="Ir para Perfil"
			style={[styles.wrapper, wrapperRadiusStyle, { backgroundColor: hasBannerImg ? 'transparent' : colors.primary }, style]}
        > 
		<View style={styles.bannerShadowWrapper}>
			<View style={[styles.bannerContainer, { backgroundColor: hasBannerImg ? 'transparent' : colors.primary, aspectRatio }, containerRadiusStyle]}>          
				{/* Banner background: image or default yellow gradient */}
				{bannerImg ? (
					<Image
						source={bannerImg}
						resizeMode="cover"
						onLoad={onBannerLoad}
						style={[StyleSheet.absoluteFill, { opacity: bannerOpacity }, containerRadiusStyle]}
					/>
				) : (
					<LinearGradient
						colors={["#FFE259", "#FFD000"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={[StyleSheet.absoluteFill, containerRadiusStyle]}
					/>
				)}
				{/* Só mostra moldura se frameSource for passado */}
				{frameSource && (
					<Animated.Image
						source={frameSource}
						resizeMode="stretch"
						onLoad={onFrameLoad}
						style={[
							styles.bannerFrameOverlay,
							{ opacity: frameOpacity, transform: [{ scale: frameScale }] },
						]}
						pointerEvents="none"
					/>
				)}
				{/* Avatar (centered) */}
				<View style={styles.avatarOuter}>            
					<View style={[styles.avatarCircle, { borderColor: colors.background, backgroundColor: avatarImg ? 'transparent' : avatarBgLightBlue }]}>              
						{avatarImg ? (
							<Image
								source={avatarImg}
								resizeMode="cover"
								onLoad={onAvatarLoad}
								style={[styles.avatarImg, { opacity: avatarOpacity }]} />
						) : (
							<View style={[styles.avatarImg, { justifyContent: 'center', alignItems: 'center' }]}> 
								<Icon name="user" size={64} color={avatarIconBlue} />
							</View>
						)}
						{/* Não mostra placeholder se for avatar default */}
						{!avatarLoaded && avatarImg && (
							<View style={[styles.avatarPlaceholder, { backgroundColor: colors.background, position: 'absolute', inset: 0 }]} />
						)}
					</View>
				</View>
			</View>
		</View>
	</TouchableOpacity>
  );
}

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
	},
	bannerShadowWrapper: {
		borderRadius: 22,
		overflow: 'visible',
	},
	bannerContainer: {
		overflow: 'hidden',
		justifyContent: 'center',
		alignItems: 'center', // allow centering avatar horizontally
	},
	avatarOuter: {
		width: 108, // reduced 10%
		height: 108,
		justifyContent: 'center',
		alignItems: 'center',
	},
	avatarCircle: {
		width: 108,
		height: 108,
		borderRadius: 54,
		borderWidth: 4,
		overflow: 'hidden',
		backgroundColor: '#00000011',
	},
	avatarImg: { width: '100%', height: '100%' },
	avatarPlaceholder: { flex: 1 },
	bannerFrameOverlay: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '100%',
		height: '100%',
	},
  // Removed info box styles
});

