import React, { useEffect, useRef } from 'react';
import {Modal, Easing} from 'react-native';
import SvgIcon from '../../components/General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../General/SvgIcon';
import { family } from '../../constants/font';

/**
 * MedalModal
 * Props:
 *  visible: boolean
 *  onClose: () => void
 *  medal: {
 *    id: string
 *    icon: string
 *    title: string
 *    description: string
 *    level: number
 *    current: number
 *    target: number
 *    unlocked?: boolean
 *    hideLevel?: boolean (if true, don't show level badge)
 *  }
 */
export default function MedalModal({ visible, onClose, medal }) {
	const colors = useThemeColors();
	const scale = useRef(new Animated.Value(0.9)).current;
	const opacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		if (visible) {
			Animated.parallel([
				Animated.timing(scale, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
				Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
			]).start();
		} else {
			Animated.parallel([
				Animated.timing(scale, { toValue: 0.9, duration: 160, useNativeDriver: true }),
				Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
			]).start();
		}
	}, [visible, scale, opacity]);

	if (!medal) {
		return null;
	}

	const progress = Math.min(1, medal.target ? medal.current / medal.target : 0);
	// Removed percentage display per request

	return (
		<Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
			<button style={styles.backdrop} onClick={onClose}  aria-label="Fechar modal medalha" />
			<div style={styles.centerWrap} pointerEvents="box-none">
				<Animated.View style={[styles.panel, { backgroundColor: colors.card || '#0E1620', transform: [{ scale }], opacity, maxHeight: '95%', overflow: 'visible' }]}>      
					<div contentContainerStyle={{ padding: 0, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
						<div style={styles.rowTop}>
						<div style={{...styles.iconCircle, ...{ 
							backgroundColor: medal.unlocked ? (medal.color || colors.primary) : colors.cardBackground}}> 
							{medal.icon ? (
									<div style={{ transform: [{ scale: 1.2 }], alignItems: 'center', justifyContent: 'center' }}>
										<SvgIcon
											svgString={medal.icon}
											size={34}
										/>
									</div>
								) : (
									<div style={{ transform: [{ scale: 1.2 }], alignItems: 'center', justifyContent: 'center' }}>
										<SvgIcon 
											name="medal" 
											size={38} 
											color={medal.unlocked ? (medal.iconColor || colors.text) : colors.placeholder} 
										/>
									</div>
								)}
							{!medal.hideLevel && medal.unlocked && medal.level > 0 && (
								<div style={{...styles.levelBadge, ...{ backgroundColor: medal.color || colors.primary }}}> 
									<span style={styles.levelText}>{medal.level ?? 1}</span>
								</div>
							)}
						</div>
						<div style={{ flex: 1, paddingLeft: 14 }}>
							<span style={{...styles.title, ...{ color: colors.text }}}>{medal.title || medal.id}</span>
							<span style={{...styles.desc, ...{ color: colors.text + 'AA' }}}>{medal.description || 'Sem descrição.'}</span>
						</div>
						</div>
						{medal.target !== null && medal.target !== undefined && (
						<div style={styles.progressWrap}>
							<div style={{...styles.progressBar, ...{ backgroundColor: colors.border || '#14202C' }}}> 
								<div style={{...styles.progressFill, ...{ width: `${progress * 100}%`}} />
								<div style={styles.progressLabelWrap} pointerEvents="none">
									<span style={{...styles.progressLabel, ...{ color: colors.text }}}>{medal.current}/{medal.target}</span>
								</div>
							</div>
						</div>
						)}
					</div>
				</Animated.View>
			</div>
		</Modal>
	);
}

const styles = {
	backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' },
	centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, overflow: 'visible' },
	// allow the medal badge to overflow the rounded panel edge
	panel: { width: '100%', borderRadius: 18, padding: 18, paddingTop: 26, maxWidth: 560, overflow: 'visible' },
	rowTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
	// icon container should also allow overflow so the badge isn't clipped
	iconCircle: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 2, position: 'relative', overflow: 'visible' },
	// raise the badge slightly and ensure it renders above the panel on Android/iOS
	levelBadge: { position: 'absolute', top: -10, right: -6, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', zIndex: 999, elevation: 20 },
	levelText: { fontSize: 14, fontFamily: family.bold, color: '#0E1620' },
	title: { fontSize: 18, fontFamily: family.bold, marginBottom: 4 },
	desc: { fontSize: 13, lineHeight: 18, fontFamily: family.medium },
	progressWrap: { marginTop: 4 },
	progressBar: { height: 28, borderRadius: 14, overflow: 'hidden', position: 'relative' },
	progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
	progressLabelWrap: { position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
	progressLabel: { fontSize: 13, fontFamily: family.bold },
	progressPct: { fontSize: 12, fontFamily: family.semibold, textAlign: 'right', marginTop: 6 },
	closeBtn: { marginTop: 20, alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
	closeText: { fontSize: 15, fontFamily: family.bold },
};
