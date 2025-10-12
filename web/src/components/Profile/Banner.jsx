import React, { useState } from 'react';

import { useThemeColors } from '../../services/Theme.jsx';
import LinearGradient from '../General/LinearGradient.jsx';
import SvgIcon from '../General/SvgIcon.jsx';

export default function Banner({
	avatarSource,
	bannerImageSource,
	frameSource,
	frameScale = 1,
	bottomFlat = true,
	topFlat = false,
	aspectRatio = 560 / 260,
	onPress,
	style,
}) {
	const colors = useThemeColors();
	
	const bannerImg = bannerImageSource || null;
	const avatarImg = avatarSource || null;
	const hasBannerImg = !!bannerImg;

	const avatarBgLightBlue = '#E3F0FF';
	const avatarIconBlue = '#1856A6';

	const [bannerLoaded, setBannerLoaded] = useState(false);
	const [avatarLoaded, setAvatarLoaded] = useState(false);
	const [frameLoaded, setFrameLoaded] = useState(false);

	const bannerOpacity = 1;
	const avatarOpacity = 1;
	const frameOpacity = 1;

	function onBannerLoad() { setBannerLoaded(true); }
	function onAvatarLoad() { setAvatarLoaded(true); }
	function onFrameLoad() { setFrameLoaded(true); }

	const topRadius = topFlat ? 0 : 22;
	const bottomRadius = bottomFlat ? 0 : 22;
	const containerRadiusStyle = {
		borderTopLeftRadius: topRadius,
		borderTopRightRadius: topRadius,
		borderBottomLeftRadius: bottomRadius,
		borderBottomRightRadius: bottomRadius,
	};

	const wrapperRadiusStyle = containerRadiusStyle;

	const handlePress = React.useCallback(() => {
		if (typeof onPress === 'function') {
			onPress();
			return;
		}
		// Web: could navigate but for now no-op
	}, [onPress]);

	return (
		<button
			onClick={handlePress}
			aria-label="Ir para Perfil"
			style={{
				...styles.wrapper,
				...wrapperRadiusStyle,
				backgroundColor: hasBannerImg ? 'transparent' : colors.primary,
				...style,
			}}
		>
			<div style={styles.bannerShadowWrapper}>
				<div style={{
					...styles.bannerContainer,
					backgroundColor: hasBannerImg ? 'transparent' : colors.primary,
					aspectRatio,
					...containerRadiusStyle,
				}}>
					{bannerImg ? (
						<img
							src={bannerImg}
							onLoad={onBannerLoad}
							style={{
								...styles.absoluteFill,
								objectFit: 'cover',
								opacity: bannerOpacity,
							}}
							alt="Banner"
						/>
					) : (
						<LinearGradient
							colors={["#FFE259", "#FFD000"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							style={{...styles.absoluteFill, ...containerRadiusStyle}}
						/>
					)}
					{frameSource && (
						<img
							src={frameSource}
							onLoad={onFrameLoad}
							style={{
								...styles.bannerFrameOverlay,
								objectFit: 'stretch',
								opacity: frameOpacity,
								pointerEvents: 'none',
							}}
							alt="Frame"
						/>
					)}
					<div style={styles.avatarOuter}>
						<div style={{
							...styles.avatarCircle,
							borderColor: colors.background,
						}}>
							{avatarImg ? (
								<img
									src={avatarImg}
									onLoad={onAvatarLoad}
									style={{
										...styles.avatarImg,
										objectFit: 'cover',
										opacity: avatarOpacity,
									}}
									alt="Avatar"
								/>
							) : (
								<div style={{
									...styles.avatarImg,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: avatarBgLightBlue,
								}}>
									<SvgIcon name="user" size={64} color={avatarIconBlue} />
								</div>
							)}
							{!avatarLoaded && avatarImg && (
								<div style={{
									...styles.avatarPlaceholder,
									backgroundColor: colors.background,
								}} />
							)}
						</div>
					</div>
				</div>
			</div>
		</button>
	);
}

const styles = {
	wrapper: {
		width: '100%',
		border: 'none',
		padding: 0,
		cursor: 'pointer',
	},
	bannerShadowWrapper: {
		borderRadius: 22,
		overflow: 'visible',
	},
	bannerContainer: {
		overflow: 'hidden',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	absoluteFill: {
		position: 'absolute',
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
	},
	avatarOuter: {
		width: 108,
		height: 108,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		zIndex: 1,
	},
	avatarCircle: {
		width: 108,
		height: 108,
		borderRadius: 54,
		borderWidth: 4,
		borderStyle: 'solid',
		overflow: 'hidden',
		backgroundColor: '#00000011',
		position: 'relative',
	},
	avatarImg: { 
		width: '100%', 
		height: '100%',
	},
	avatarPlaceholder: { 
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: '100%',
		height: '100%',
	},
	bannerFrameOverlay: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: '100%',
		height: '100%',
		zIndex: 2,
	},
};
