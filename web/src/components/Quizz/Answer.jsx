import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Animated } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import MathJaxRenderer from '../General/MathJaxRenderer';


/**
 * Answer list
 * Props:
 *  - options: Array<{ id: string, html?: string, text?: string }>
 *  - selectedId?: string
 *  - onSelect?: (id: string) => void
 */
export default function Answer({ options = [], selectedId, onSelect, optionHeight = 64, correctId, isCorrect, resetKey }) {
	const colors = useThemeColors();
		const evalOutcome = useCallback((id) => {
			if (typeof isCorrect === 'function') {
				try { return isCorrect(id) ? 'correct' : 'wrong'; } catch { return null; }
			}
			if (correctId) return id === correctId ? 'correct' : 'wrong';
			return null;
		}, [isCorrect, correctId]);

	const renderItem = ({ item }) => (
		<AnswerRow
			key={item.id}
			item={item}
			optionHeight={optionHeight}
			colors={colors}
						onPress={() => onSelect && onSelect(item.id)}
						evalOutcome={evalOutcome}
		/>
	);

	return (
	    <FlatList
		    data={options}
		    keyExtractor={(it) => (resetKey ? `${resetKey}:${it.id}` : it.id)}
			renderItem={renderItem}
			ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
			contentContainerStyle={{ paddingTop: 14 }}
			scrollEnabled={false}
		    extraData={resetKey}
		/>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		borderWidth: 2,
		borderRadius: 14,
		paddingHorizontal: 4,
		paddingVertical: 4,
		alignItems: 'center',
		gap: 8,
		overflow: 'hidden',
	},
	badge: {
		width: 32,
		height: 32,
		borderRadius: 16,
		borderWidth: 2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: { fontSize: 16, fontWeight: '800', fontFamily: family.bold },
});

function AnswerRow({ item, optionHeight, colors, onPress, evalOutcome }) {
	const fade = useRef(new Animated.Value(0)).current;
	const statusRef = useRef('idle'); // 'idle' | 'correct' | 'wrong'
	let fsize = 16;

	if (String(item.html).length <= 40 && String(item.html).includes("\\(")) {
		fsize = 14;
	}
	if (String(item.html).length <= 25 && !String(item.html).includes("\\(")) {
		fsize = 22;
	}
	if (String(item.html).length >= 70 && String(item.html).length <= 115 && !String(item.html).includes("\\(")) {
		fsize = 12;
	}
    if (String(item.html).length > 115 && !String(item.html).includes("\\(")) {
		fsize = 10;
	}
	const trigger = () => {
		// One-shot highlight animation
		Animated.sequence([
			Animated.timing(fade, { toValue: 1, duration: 120, useNativeDriver: true }),
			Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
		]).start();
		if (statusRef.current === 'idle') {
			const outcome = evalOutcome ? evalOutcome(item.id) : null;
			if (outcome === 'correct' || outcome === 'wrong') statusRef.current = outcome;
		}
		onPress && onPress();
	};

	const bgColor = statusRef.current === 'correct' ? SUCCESS_BG : statusRef.current === 'wrong' ? DANGER_BG : 'transparent';
	const borderColor = statusRef.current === 'correct' ? SUCCESS : statusRef.current === 'wrong' ? DANGER : colors.border;

	return (
		<Pressable
			onPress={trigger}
			style={({ pressed }) => [
				styles.row,
				{ borderColor, backgroundColor: bgColor, height: optionHeight },
				pressed && { opacity: 0.9 },
			]}
		>
			<Animated.View
				pointerEvents="none"
				style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary + '33', opacity: fade, borderRadius: 14 }]}
			/>
			<View style={{ flex: 1, height: '100%', justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 12 }}>
				{item.html ? (
					<MathJaxRenderer 
						content={item.html} 
						enabled={true}
						baseFontSize={fsize} 
						scrollEnabled={false}
						compact={true}
						inlineDisplay={true}
						textAlign="left"
						style={{ flex: 1, minHeight: 28, width: '100%' }} 
					/>
				) : (
					<Text style={{ color: colors.text, fontSize: 12, fontFamily: family.regular, textAlign: 'left' }} numberOfLines={2} ellipsizeMode="tail" selectable={false}>{item.text}</Text>
				)}
			</View>
		</Pressable>
	);
}

const SUCCESS = '#2ecc71';
const DANGER = '#e74c3c';
const SUCCESS_BG = 'rgba(46, 204, 113, 0.15)';
const DANGER_BG = 'rgba(231, 76, 60, 0.15)';
