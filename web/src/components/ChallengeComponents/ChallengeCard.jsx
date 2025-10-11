import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Icon from '@react-native-vector-icons/lucide';
import { useThemeColors } from '../../services/Theme';

// ChallengeCard
// Props: { title, description, coins, expiresAt, availableUntil, imageUrl, onPress, userHasPlayed, availableFrom }
export default function ChallengeCard({ 
  title, 
  description, 
  coins = 0, 
  expiresAt, 
  availableUntil, 
  availableFrom,
  imageUrl, 
  onPress,
  userHasPlayed = 0
}) {
  const colors = useThemeColors();

  // Determine challenge state
  const now = new Date();
  const startTime = availableFrom ? new Date(availableFrom) : null;
  const endTime = availableUntil ? new Date(availableUntil) : null;
  
  const isCompleted = userHasPlayed === 1;
  const isExpired = endTime && now > endTime;
  const isNotStarted = startTime && now < startTime;
  const isAvailable = !isCompleted && !isExpired && !isNotStarted;

  const timeLeftLabel = useMemo(() => {
    // Use availableUntil from API or fallback to expiresAt
    const endTime = availableUntil || expiresAt;
    if (!endTime) return null;

    const now = Date.now();
    const end = typeof endTime === 'string' ? new Date(endTime).getTime() :
      typeof endTime === 'number' ? endTime : new Date(endTime).getTime();
    
    if (end <= now) return 'Expirado';
    
    let diff = Math.max(0, end - now);
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    diff -= days * 24 * 60 * 60 * 1000;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    diff -= hours * 60 * 60 * 1000;
    const minutes = Math.floor(diff / (60 * 1000));
    return `${days}d:${hours}h:${minutes}m`;
  }, [expiresAt, availableUntil]);

  return (
    <Pressable
      onPress={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: colors.text + (isAvailable ? '08' : '05'), 
          borderColor: colors.text + (isAvailable ? '15' : '08'),
          opacity: isAvailable ? 1 : 0.6 
        },
        pressed && isAvailable && { opacity: 0.9 },
      ]}
      accessibilityRole={isAvailable && onPress ? 'button' : undefined}
    >
      <View style={[
        styles.leftIcon, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.text + (isAvailable ? '22' : '10') 
        }
      ]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.challengeImage, { opacity: isAvailable ? 1 : 0.5 }]}
            resizeMode="contain"
          />
        ) : (
          <Icon name="file-text" size={26} color={isAvailable ? colors.secondary : colors.muted} />
        )}
        {isCompleted && (
          <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
            <Icon name="check" size={12} color="white" />
          </View>
        )}
        {isExpired && !isCompleted && (
          <View style={[styles.statusBadge, { backgroundColor: colors.danger || '#FF6B6B' }]}>
            <Icon name="x" size={12} color="white" />
          </View>
        )}
      </View>
      <View style={styles.main}>
        <Text style={[
          styles.title, 
          { color: isAvailable ? colors.secondary : colors.muted }
        ]} numberOfLines={1}>
          {title}
        </Text>
        {description ? (
          <Text style={[
            styles.desc, 
            { color: (isAvailable ? colors.text : colors.muted) + 'CC' }
          ]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          <View style={styles.metaGroup}>
            <Icon name="coins" size={18} color={isAvailable ? colors.primary : colors.muted} />
            <Text style={[
              styles.metaText, 
              { 
                color: isAvailable ? colors.primary : colors.muted, 
                marginLeft: 6, 
                fontWeight: '800' 
              }
            ]}>
              {coins}
            </Text>
          </View>
          {timeLeftLabel ? (
            <View style={[styles.metaGroup, { marginLeft: 14 }]}>
              <Icon name="clock" size={18} color={colors.muted} />
              <Text style={[styles.metaText, { color: colors.muted, marginLeft: 6 }]}>
                {timeLeftLabel}
              </Text>
            </View>
          ) : null}
          {isCompleted && (
            <View style={[styles.metaGroup, { marginLeft: 14 }]}>
              <Text style={[styles.statusText, { color: colors.muted }]}>
                Completado
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
  },
  leftIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  challengeImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
});
