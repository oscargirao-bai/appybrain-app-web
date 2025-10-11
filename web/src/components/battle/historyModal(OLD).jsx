import React, { useEffect, useRef, useState } from 'react';
import {Modal} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/color';
import IconCircleButton from './IconCircleButton';
import { Lucide } from '@react-native-vector-icons/lucide';
import { post } from '../../services/serviceApi';
import { useAuth } from '../../services/serviceAuth';
import { useTranslate } from '../../hooks/useTranslate';

/**
 * HistoryModal
 * Modal listing Battle history split in two sections: Pending and Completed.
 */
export default function HistoryModal({ visible, onClose, pending = [], completed = [], meName = 'Tu' }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [pendingList, setPendingList] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();
  const { translate } = useTranslate();

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [visible, anim]);

  // Fetch battle list when modal opens
  useEffect(() => {
    let mounted = true;

    async function fetchBattles() {
      setLoading(true);
      try {
        const resp = await post('/api/app/battle_list');
        console.log('Battle list response:', resp);

        if (!mounted) return;

        if (resp && resp.success && Array.isArray(resp.battles)) {
          const mapStats = (results) => {
            if (!Array.isArray(results) || results.length === 0) return null;
            let correct = 0;
            let total = results.length;
            let timeMs = 0;
            results.forEach(r => {
              if (r && (r.correct === true || r.correct === 1)) correct += 1;
              if (r && typeof r.timeMs === 'number') timeMs += r.timeMs;
              if (r && typeof r.timeSec === 'number') timeMs += r.timeSec * 1000;
            };
            return { correct, total, timeSec: (timeMs / 1000) };
          };

          const lefts = [];
          const rights = [];

          resp.battles.forEach(b => {
            const isPending = b.endedAt === null || b.endedAt === undefined;

            // Decide whether the current user is player1 or player2
            const meIsPlayer1 = !!(user && b.player1Id && user.id === b.player1Id);
            const meIsPlayer1ByName = !meIsPlayer1 && !!(meName && b.player1Nickname && b.player1Nickname === meName);
            const amPlayer1 = meIsPlayer1 || meIsPlayer1ByName;

            // Build labels so 'left' is the current user when we can identify them
            const left = amPlayer1 ? (b.player1Nickname || meName || 'Tu') : (b.player2Nickname || meName || '?');
            const right = amPlayer1 ? (b.player2Nickname || '?') : (b.player1Nickname || '?');

            // Map stats accordingly
            const leftStats = amPlayer1 ? mapStats(b.player1Results || []) : mapStats(b.player2Results || []);
            const rightStats = amPlayer1 ? mapStats(b.player2Results || []) : mapStats(b.player1Results || []);

            let status = 'pending';
            if (!isPending) {
              if (amPlayer1) {
                if (b.winnerId === b.player1Id) status = 'win';
                else if (b.winnerId === b.player2Id) status = 'lose';
              } else {
                if (b.winnerId === b.player2Id) status = 'win';
                else if (b.winnerId === b.player1Id) status = 'lose';
              }
            }

            const battleSessionId = b.battleSessionId || b.sessionId || b.id || null;
            const item = { left, right, leftStats, rightStats, status, battleSessionId };

            if (isPending) lefts.push(item);
            else rights.push(item);
          };

          setPendingList(lefts);
          setCompletedList(rights);
        } else {
          setPendingList([]);
          setCompletedList([]);
        }
      } catch (err) {
        console.warn('Failed to load battle history:', err.message || err);
        setPendingList([]);
        setCompletedList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (visible) fetchBattles();

    return () => { mounted = false; };
  }, [visible, meName, user]);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] };
  const opacity = anim;

  // If parent passed arrays, use them as initial values; otherwise our fetch will populate
  useEffect(() => {
    if (Array.isArray(pending) && pending.length > 0) setPendingList(pending);
    if (Array.isArray(completed) && completed.length > 0) setCompletedList(completed);
  }, [pending, completed]);

  // Determine whether we have any real items to show
  const hasAny = (pendingList && pendingList.length > 0) || (completedList && completedList.length > 0);
  // pendingList and completedList contain the real data (or empty arrays)
  const pendingToRender = pendingList || [];
  const completedToRender = completedList || [];

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <div style={styles.backdrop}>
        {/* Click outside to close */}
        <button style={styles.backdropHit} onClick={onClose} />
        <div style={{ width: '100%', alignItems: 'center' }}>
          <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}> 
            {/* Close */}
            <div style={styles.closeWrap}>
              <IconCircleButton size={36} rounded={12} onClick={onClose}>
                <Lucide name="x" size={20} color={colors.text.primary} />
              </IconCircleButton>
            </div>

            <span style={styles.title}>{translate('battle.history.title') || 'Battle History'}</span>

            <div style={styles.scrollBox}>
              {/* If there are no battles, show a centered translated message */}
              {!hasAny ? (
                <div style={styles.emptyWrap}>
                  <span style={styles.emptyText}>{translate('battle.history.empty') || translate('battle.noRecent') || 'No battles available'}</span>
                </div>
              ) : (
                <div contentContainerStyle={{ paddingBottom: 64 }} showsVerticalScrollIndicator nestedScrollEnabled>
                  {/* Pending */}
                  <span style={styles.sectionTitle}>{translate('battle.history.pending') || 'Pending'}</span>
                  <div style={styles.sectionBox}>
                    {pendingToRender.map((it, idx) => (
                      <HistoryItem key={`p-${idx}`} {...it} onClose={onClose} navigation={navigation} />
                    ))}
                  </div>

                  {/* Completed */}
                  <span style={{...styles.sectionTitle, ...{ marginTop: 18 }}}>{translate('battle.history.completed') || 'Completed'}</span>
                  <div style={styles.sectionBox}>
                    {completedToRender.map((it, idx) => (
                      <HistoryItem key={`c-${idx}`} {...it} onClose={onClose} navigation={navigation} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Animated.View>
        </div>
      </div>
    </Modal>
  );
}

function HistoryItem({ left, right, leftStats, rightStats, status = 'pending', battleSessionId = null, onClose, navigation }) {
  const { translate } = useTranslate();
  const isPending = status === 'pending';
  const isWin = status === 'win';
  const isLose = status === 'lose';

  let bg = colors.surface;
  let border = colors.border;
  if (isWin) { bg = 'rgba(16,185,129,0.15)'; border = colors.success; }
  if (isLose) { bg = 'rgba(239,68,68,0.15)'; border = colors.error; }

  return (
    <button       onClick={() => {
        if (battleSessionId) {
          // Close modal first so navigation isn't blocked by modal overlay
          try { onClose && onClose(); } catch (e) {}
          navigation?.navigate('battleResult', { battleSessionId };
        }
      }}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <div style={{...styles.item, ...{ backgroundColor: bg}}> 
        <div pointerEvents="none" style={styles.vsOverlay}>
          <span style={{...styles.vs, ...styles.vsCenter}}>{translate('battle.vs') || 'VS'}</span>
        </div>
        <div style={styles.itemRow}>
          <span style={{...styles.itemName, ...{ textAlign: 'left' }}} numberOfLines={1}>{left}</span>
          <span style={{...styles.itemName, ...{ textAlign: 'right' }}} numberOfLines={1}>{right}</span>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statsCol}>
            {leftStats ? (
              <>
                <span style={styles.statsText}>{leftStats.correct}/{leftStats.total} {translate('battle.history.correct') || 'Correct'}</span>
                <span style={styles.statsText}>{Number(leftStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime') || 'Total time'}</span>
              </>
            ) : (
              <span style={styles.statsText}>?/? {translate('battle.history.correct') || 'Correct'}</span>
            )}
          </div>
          <div style={styles.statsCol}>
            {rightStats ? (
              <>
                <span style={{...styles.statsText, ...{ textAlign: 'right' }}}>{rightStats.correct}/{rightStats.total} {translate('battle.history.correct') || 'Correct'}</span>
                <span style={{...styles.statsText, ...{ textAlign: 'right' }}}>{Number(rightStats.timeSec || 0).toFixed(1)}s {translate('battle.history.totalTime') || 'Total time'}</span>
              </>
            ) : (
              <span style={{...styles.statsText, ...{ textAlign: 'right' }}}>?/? {translate('battle.history.correct') || 'Correct'}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Responsive sizing for the modal card and scroll area (fixed height)
const { width: W, height: H } = Dimensions.get('window');
const CARD_W = Math.min(640, Math.round(W * 0.94));
const CARD_BASE_H = Math.min(760, Math.round(H * 0.86));
// Increase current (50% base) height by 25% => 62.5% of base
const CARD_H = Math.max(120, Math.round(CARD_BASE_H * 0.625));
const SCROLL_H = Math.max(60, CARD_H - 70); // leave room for title/close/paddings

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.black50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  backdropHit: { ...StyleSheet.absoluteFillObject },
  card: {
    width: CARD_W,
    maxWidth: '94%',
    height: CARD_H,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  closeWrap: { position: 'absolute', right: 10, top: 10, zIndex: 2 },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  scrollBox: { height: SCROLL_H, width: '100%' },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 6,
  },
  sectionBox: { gap: 10, width: '92%' },
  item: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    position: 'relative',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { flex: 1, color: colors.text.primary, fontSize: 16, fontWeight: '800' },
  vs: { color: colors.text.primary, fontSize: 18, fontWeight: '900', marginHorizontal: 12 },
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
  statsText: { color: colors.text.secondary, fontSize: 12, fontWeight: '600' },
  emptyWrap: { flex: 1, height: SCROLL_H, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.text.secondary, fontSize: 14, fontWeight: '700', textAlign: 'center' },
};
