import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import SvgIcon from '../General/SvgIcon';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import { family } from '../../constants/font';

// Expected item shape:
// { id: string, title: string, icon: string (SVG), color: string (hex), stars: number, maxStars: number }
// For MVP we assume maxStars = 3 (★ levels) per conteúdo.

// Numeric star badge replacing individual star icons
function StarCount({ stars, max, iconColor }) {
	const colors = useThemeColors();
	const pct = (stars / max) || 0;
	const full = pct >= 1;
	return (
		<View
			style={[styles.countBadge, { borderColor: iconColor || colors.text }]}
			accessibilityLabel={`${stars} estrelas`}
		>
			<Icon name="star" size={14} color={iconColor || colors.text} style={{ marginRight: 4 }} />
			<Text style={[styles.countText, { color: iconColor || colors.text }]}>{stars}</Text>
		</View>
	);
}

// Utilitário simples para aplicar alpha a uma cor hex (fallback para retornar se já rgb/rgba)
function addAlpha(hex, alpha) {
  if (!hex || hex.startsWith('rgb')) return hex;
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c=>c+c).join('');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ContentList({ data, onPressItem }) {
	const colors = useThemeColors();
	const { translate } = useTranslate();

	return (
		<FlatList
			data={data}
			keyExtractor={(item) => item.id}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={styles.listContent}
				renderItem={({ item, index }) => {
				const pct = (item.stars / item.maxStars) || 0;
				// Usa a cor recebida em item.color; fallback para primary se ausente
				const baseColor = item.color || colors.primary;
				const iconColor = item.iconColor || colors.primary;
				const fillColor = addAlpha(baseColor, 0.8);
				const containerBg = addAlpha(baseColor, 0.5);
				return (
					<Pressable
						style={({ pressed }) => [styles.rowOuter, pressed && { opacity: 0.9 }]}
						onPress={() => onPressItem && onPressItem(item)}
						accessibilityRole="button"
						accessibilityLabel={`${translate('learn.openContent')}: ${item.title}. ${item.stars} / ${item.maxStars} ${translate('quizResult.stars')}.`}
					>
						<View style={[styles.progressContainer, { backgroundColor: baseColor, borderColor: containerBg }]}> 
							<View style={[styles.progressFillFull, { backgroundColor: fillColor, flex: pct }]} />
							<View style={{ flex: 1 - pct }} />
							<View style={styles.rowContent} pointerEvents="none"> 
								{item.icon ? (
									<View style={[styles.leftIcon, { width: 45, height: 45 }]}>
										<SvgIcon 
											svgString={item.icon} 
											size={45} 
											color={iconColor} 
										/>
									</View>
								) : (
									<Icon name="book-open" size={40} color={baseColor} style={styles.leftIcon} />
								)}
								<Text style={[styles.itemTitle, { color: iconColor }]} numberOfLines={2}>{item.title}</Text>
								<StarCount stars={item.stars} max={item.maxStars} iconColor={iconColor} />
							</View>
						</View>
					</Pressable>
				);
			}}
			ItemSeparatorComponent={() => <View style={styles.separator} />}
			ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.muted, paddingVertical: 24 }}>{translate('learn.noContents')}</Text>}
		/>
	);
}

const styles = StyleSheet.create({
	listContent: { paddingHorizontal: 0, paddingBottom: 400, marginTop: 8 },
	rowOuter: { marginVertical: 8 },
	progressContainer: { flexDirection: 'row', borderWidth: 2, borderRadius: 16, minHeight: 86, overflow: 'hidden' },
	progressFillFull: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
	rowContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
	leftIcon: { marginRight: 10 },
	itemTitle: { flex: 1, fontSize: 20, fontFamily: family.bold },
	countBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30, borderWidth: 2 },
	countText: { fontSize: 12, fontFamily: family.bold },
	separator: { height: 0 },
});

