import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Animated, ScrollView, Dimensions } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { useTranslate } from '../../services/Translate';
import Icon from '@react-native-vector-icons/lucide';
import { family } from '../../constants/font';

/**
 * HistoryModal (no-API)
 * Modal listing Battle history split in two sections: Pending and Completed.
 * Receives all data via props (no fetching, no services inside).
 *
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - pending: Array<HistoryItem>
 *  - completed: Array<HistoryItem>
 *  - title?: string (override)
 *  - onOpenBattle?: (battleSessionId: string) => void
 *
 * HistoryItem shape:
 *  { left: string, right: string,
 *    leftStats?: { correct: number, total: number, timeSec?: number },
 *    rightStats?: { correct: number, total: number, timeSec?: number },
 *    status: 'pending' | 'win' | 'lose',
 *    battleSessionId?: string }
 */
export default function HistoryModal({ visible, onClose, pending = [], completed = [], title, onOpenBattle }) {
  const colors = useThemeColors();
  const { translate } = useTranslate();
  const styles = React.useMemo(() => createStyles(colors), [colors]); // Reactive to color changes

  // simple mount/unmount animation
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: visible ? 1 : 0, duration: visible ? 180 : 150, useNativeDriver: true }).start();
  }, [visible, anim]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const opacity = anim;

  const hasAny = (pending?.length || 0) > 0 || (completed?.length || 0) > 0;

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropHit} onPress={onClose} />
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}> 
            {/* Close button */}
            <Pressable onPress={onClose} style={styles.closeWrap} accessibilityRole="button" accessibilityLabel={translate('common.close')}>
              <Icon name="x" size={22} color={colors.text} />
            </Pressable>

            <Text style={[styles.title, { color: colors.text }]}>
              {title || translate('battle.history.title')}
            </Text>

            <View style={styles.scrollBox}>
              {!hasAny ? (
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: colors.muted }]}>{translate('battle.history.empty')}</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator nestedScrollEnabled>
                  {/* Pending */}
                  {pending?.length > 0 && (
                    <>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>{translate('battle.history.pending')}</Text>
                      <View style={styles.sectionBox}>
                        {pending.map((it, idx) => (
                          <HistoryRow key={`p-${idx}`} item={it} colors={colors} translate={translate} onOpenBattle={onOpenBattle} onClose={onClose} />
                        ))}
                      </View>
                    </>
                  )}
                  {/* Completed */}
                  {completed?.length > 0 && (
                    <>
                      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 18 }]}>{translate('battle.history.completed')}</Text>
                      <View style={styles.sectionBox}>
                        {completed.map((it, idx) => (
                          <HistoryRow key={`c-${idx}`} item={it} colors={colors} translate={translate} onOpenBattle={onOpenBattle} onClose={onClose} />
                        ))}
                      </View>
                    </>
                  )}
                </ScrollView>
              )}
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

function HistoryRow({ item, colors, translate, onOpenBattle, onClose }) {
  const { left, right, leftStats, rightStats, status = 'pending', battleSessionId } = item || {};
  const isPending = status === 'pending';
  const isWin = status === 'win';
  const isLose = status === 'lose';

  let bg = colors.card;
  let border = colors.border;
  if (isWin) { bg = 'rgba(16,185,129,0.15)'; border = colors.success || '#10B981'; }
  if (isLose) { bg = 'rgba(239,68,68,0.15)'; border = colors.error || '#EF4444'; }

  return (
    <Pressable
      onPress={() => {
        if (battleSessionId && onOpenBattle) {
          // First navigate, then close modal to avoid navigation state issues
          onOpenBattle(battleSessionId);
          // Close modal after a brief delay to ensure navigation completes
          setTimeout(() => {
            try { onClose && onClose(); } catch {}
          }, 100);
        }
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[rowStyles.item, { backgroundColor: bg, borderColor: border }]}> 
        <View pointerEvents="none" style={rowStyles.vsOverlay}>
          <Text style={[rowStyles.vs, rowStyles.vsCenter, { color: colors.text }]}>{translate('battle.vs')}</Text>
        </View>
        <View style={rowStyles.itemRow}>
          <Text style={[rowStyles.itemName, { textAlign: 'left', color: colors.text }]} numberOfLines={1}>{left}</Text>
          <Text style={[rowStyles.itemName, { textAlign: 'right', color: colors.text }]} numberOfLines={1}>{right}</Text>
        </View>
        <View style={rowStyles.statsRow}>
          <View style={rowStyles.statsCol}>
            {leftStats ? (
              <>
                <Text style={[rowStyles.statsText, { color: colors.muted }]}>{leftStats.correct}/{leftStats.total} {translate('battle.history.correct')}</Text>
                <Text style={[rowStyles.statsText, { color: colors.muted }]}>{Number(leftStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime')}</Text>
              </>
            ) : (
              <Text style={[rowStyles.statsText, { color: colors.muted }]}>?/? {translate('battle.history.correct')}</Text>
            )}
          </View>
          <View style={rowStyles.statsCol}>
            {rightStats ? (
              <>
                <Text style={[rowStyles.statsText, { textAlign: 'right', color: colors.muted }]}>{rightStats.correct}/{rightStats.total} {translate('battle.history.correct')}</Text>
                <Text style={[rowStyles.statsText, { textAlign: 'right', color: colors.muted }]}>{Number(rightStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime')}</Text>
              </>
            ) : (
              <Text style={[rowStyles.statsText, { textAlign: 'right', color: colors.muted }]}>?/? {translate('battle.history.correct')}</Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const { width: W, height: H } = Dimensions.get('window');
const CARD_W = Math.min(640, Math.round(W * 0.94));
const CARD_BASE_H = Math.min(760, Math.round(H * 0.86));
const CARD_H = Math.max(120, Math.round(CARD_BASE_H * 0.625));
const SCROLL_H = Math.max(60, CARD_H - 70);

function createStyles(colors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay?.black50 || 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    backdropHit: { ...StyleSheet.absoluteFillObject },
    card: {
      width: CARD_W,
      maxWidth: '94%',
      height: CARD_H,
      backgroundColor: colors.card || colors.background,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    closeWrap: { position: 'absolute', right: 10, top: 10, zIndex: 2, padding: 6 },
    title: {
      fontSize: 20,
      fontFamily: family.bold,
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: 8,
    },
    scrollBox: { height: SCROLL_H, width: '100%' },
    sectionTitle: {
      fontSize: 16,
      fontFamily: family.bold,
      marginTop: 4,
      marginBottom: 6,
    },
    sectionBox: { gap: 10, width: '92%', alignSelf: 'center' },
    emptyWrap: { flex: 1, height: SCROLL_H, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontSize: 14, fontFamily: family.bold, textAlign: 'center' },
  });
}

const rowStyles = StyleSheet.create({
  item: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    position: 'relative',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { flex: 1, fontSize: 16, fontFamily: family.bold },
  vs: { fontSize: 18, fontFamily: family.bold, marginHorizontal: 12 },
  vsCenter: { marginHorizontal: 0 },
  vsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  statsCol: { flex: 1 },
  statsText: { fontSize: 12, fontFamily: family.semibold },
});
