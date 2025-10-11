import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated, Easing, Image } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import Icon from '@react-native-vector-icons/lucide';
import DataManager from '../../services/DataManager';
import { family } from '../../constants/font';

// Helper function to get opened chest image based on type
function getOpenedChestImage(chestType) {
	switch (chestType) {
		case 'bronze':
			return require('../../../assets/chests/chest-bronze-opened.png');
		case 'silver':
			return require('../../../assets/chests/chest-silver-opened.png');
		case 'gold':
			return require('../../../assets/chests/chest-gold-opened.png');
		case 'epic':
			return require('../../../assets/chests/chest-epic-opened.png');
		default:
			return require('../../../assets/chests/chest-bronze-opened.png'); // Default fallback
	}
}

// Simple reward mock generator (future: pass via props)
function defaultRewards() {
	return [
		{ id: 'r1', type: 'coins', amount: 120 },
		{ id: 'r2', type: 'tips', amount: 2 },
	];
}

export default function ChestRewardModal({ visible, onClose, rewards = defaultRewards(), chestType = 'bronze' }) {
	const colors = useThemeColors();
	const scale = useRef(new Animated.Value(0.6)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	const glow = useRef(new Animated.Value(0)).current;
	const chestFloat = useRef(new Animated.Value(0)).current; // 0..1 up/down
	
	// Get the correct chest image based on type
	const chestOpenedImg = getOpenedChestImage(chestType);

	useEffect(() => {
		if (visible) {
			scale.setValue(0.6);
			opacity.setValue(0);
			glow.setValue(0);
			chestFloat.setValue(0);
			Animated.parallel([
				Animated.timing(scale, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
				Animated.timing(opacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
			]).start();
			Animated.loop(
				Animated.sequence([
					Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
					Animated.timing(glow, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
				])
			).start();
			Animated.loop(
				Animated.sequence([
					Animated.timing(chestFloat, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
					Animated.timing(chestFloat, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
				])
			).start();
		}
	}, [visible, scale, opacity, glow, chestFloat]);

	const glowOpacity = glow.interpolate({ inputRange: [0,1], outputRange: [0.35, 0.8] });
	const glowScale = glow.interpolate({ inputRange: [0,1], outputRange: [1, 1.25] });
	const chestTranslate = chestFloat.interpolate({ inputRange: [0,1], outputRange: [0, -12] });

	const RewardItem = ({ item, index }) => {
		// Handle different reward types
		if (item.type === 'coins') {
			return (
				<View style={[styles.rewardCard, { borderColor: colors.text + '22', backgroundColor: colors.card + '55' }]}> 
					<Icon name="coins" size={28} color={colors.secondary} />
					<Text style={[styles.rewardAmount, { color: colors.text }]}>{item.amount}</Text>
					<Text style={[styles.rewardLabel, { color: colors.text + 'AA' }]}>Coins</Text>
				</View>
			);
		} else if (item.type === 'cosmetic') {
			// Get cosmetic data for the icon
			const cosmetic = DataManager.getCosmeticById(item.cosmeticId);
			const imageUrl = cosmetic?.imageUrl || cosmetic?.previewUrl;
			
			return (
				<View style={[styles.rewardCard, { borderColor: colors.text + '22', backgroundColor: colors.card + '55' }]}> 
					{imageUrl ? (
						<Image 
							source={{ uri: imageUrl }} 
							style={styles.cosmeticIcon}
							resizeMode="contain"
						/>
					) : (
						<Icon name="image" size={28} color={colors.secondary} />
					)}
					<Text style={[styles.rewardAmount, { color: colors.text }]}>+1</Text>
					<Text style={[styles.rewardLabel, { color: colors.text + 'AA' }]}>Cosmético</Text>
				</View>
			);
		} else {
			// Default case (tips, etc.)
			return (
				<View style={[styles.rewardCard, { borderColor: colors.text + '22', backgroundColor: colors.card + '55' }]}> 
					<Icon name="lightbulb" size={28} color={colors.secondary} />
					<Text style={[styles.rewardAmount, { color: colors.text }]}>{item.amount}</Text>
					<Text style={[styles.rewardLabel, { color: colors.text + 'AA' }]}>Dicas</Text>
				</View>
			);
		}
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={[styles.backdrop, { backgroundColor: '#000000AA' }]}> 
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar recompensa" />
				<Animated.View style={[styles.panel, { backgroundColor: colors.background, borderColor: colors.text + '22', transform: [{ scale }], opacity }]}> 
					<View style={{ alignItems: 'center', marginBottom: 14 }}>
						<Text style={[styles.title, { color: colors.text }]}>Baú Aberto!</Text>
						<Text style={[styles.subtitle, { color: colors.text + 'AA' }]}>Recebeste:</Text>
					</View>
					<Animated.View style={{ marginBottom: 10, transform: [{ translateY: chestTranslate }] }}>
						<Image source={chestOpenedImg} style={{ width: 150, height: 120 }} resizeMode="contain" />
					</Animated.View>
					<View style={styles.rewardsRow}>
						{rewards.map((r, i) => <RewardItem key={r.id} item={r} index={i} />)}
					</View>
					<Pressable
						onPress={onClose}
						style={({ pressed }) => [styles.closeBtn, { backgroundColor: colors.primary + 'DD' }, pressed && { opacity: 0.85 }]}
						accessibilityRole="button"
						accessibilityLabel="Fechar"
					>
						<Text style={[styles.closeText, { color: colors.onPrimary || '#FFF' }]}>OK</Text>
					</Pressable>
					<Animated.View pointerEvents="none" style={[styles.glow, { backgroundColor: colors.secondary + '55', opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
	panel: { borderRadius: 28, padding: 24, borderWidth: 1, width: '100%', maxWidth: 460, alignItems: 'center', overflow: 'hidden' },
	title: { fontSize: 22, fontFamily: family.bold, letterSpacing: 0.5 },
	subtitle: { fontSize: 14, fontFamily: family.semibold, marginTop: 4 },
	rewardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginBottom: 22 },
	rewardCard: { width: 120, paddingVertical: 14, borderWidth: 1, borderRadius: 20, alignItems: 'center', gap: 6 },
	rewardAmount: { fontSize: 20, fontFamily: family.bold },
	rewardLabel: { fontSize: 12, fontFamily: family.semibold },
	closeBtn: { marginTop: 4, paddingVertical: 14, paddingHorizontal: 34, borderRadius: 40 },
	closeText: { fontSize: 15, fontFamily: family.bold, letterSpacing: 0.5 },
	cosmeticIcon: { width: 32, height: 32 },
	glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 28 },
});

