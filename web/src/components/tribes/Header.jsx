import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ScrollView, Pressable, Animated } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../General/SvgIcon';
import { family } from '../../constants/font';

export default function TribesHeader({ 
  title = 'Tribos', 
  allTribes = [], 
  userTribe, 
  isInTribe = false,
  onSelect 
}) {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 768 ? 28 : 16;

  // Sort tribes: user's tribe first, then others
  const sortedTribes = useMemo(() => {
    if (!isInTribe || !userTribe) {
      return allTribes;
    }
    
    const userTribeData = allTribes.find(t => t.id === userTribe.id);
    const otherTribes = allTribes.filter(t => t.id !== userTribe.id);
    
    return userTribeData ? [userTribeData, ...otherTribes] : allTribes;
  }, [allTribes, userTribe, isInTribe]);

  // Use the sorted list of tribes
  const [active, setActive] = useState(userTribe?.id || sortedTribes[0]?.id || null);
  
  useEffect(() => {
    // Only set initial active tribe if none is selected yet
    if (!active && sortedTribes.length > 0) {
      // Set default to user's tribe if they have one, otherwise first tribe
      const defaultTribe = (isInTribe && userTribe) ? userTribe.id : sortedTribes[0].id;
      setActive(defaultTribe);
    }
  }, [sortedTribes, active, isInTribe, userTribe]);

  // Removed indicator logic; keeping simple scale highlight only
  const layouts = useRef({});

  const scaleMap = useRef({});

  // Initialize scales for all tribes
  useEffect(() => {
    sortedTribes.forEach(t => {
      if (!scaleMap.current[t.id]) {
        scaleMap.current[t.id] = new Animated.Value(t.id === active ? 1 : 0.94);
      }
    });
  }, [sortedTribes, active]);

  // Update animations when active tribe changes
  useEffect(() => {
    sortedTribes.forEach(t => {
      const scale = scaleMap.current[t.id];
      if (scale) {
        const isActive = t.id === active;
        Animated.spring(scale, { 
          toValue: isActive ? 1 : 0.75, 
          useNativeDriver: true, 
          damping: 18, 
          stiffness: 240, 
          mass: 0.6 
        }).start();
      }
    });
  }, [active, sortedTribes]);

  const handlePress = useCallback((tribe) => {
    setActive(tribe.id);
    onSelect && onSelect(tribe);
  }, [onSelect]);

  return (
    <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedTribes.map(t => {
          const isActive = t.id === active; // This should be ANY selected tribe, not just user's tribe
          const isUserTribe = isInTribe && userTribe && t.id === userTribe.id;
          const scale = scaleMap.current[t.id] || new Animated.Value(0.94);
          
          // Use the tribe's color or fallback to theme color
          const tribeColor = t.color || colors.primary;
          const tribeIconColor = t.iconColor || colors.text;
          
          return (
            <View key={t.id} style={[
              styles.tribeWrapper,
              // Add container glow for even more visibility
              isActive ? {
                shadowColor: tribeColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 5,
              } : {}
            ]}>
              <Pressable
                onPress={() => handlePress(t)}
                onLayout={(e) => {
                  const { x, width: w, height: h } = e.nativeEvent.layout;
                  layouts.current[t.id] = { x, w, h };
                }}
                style={({ pressed }) => [
                  styles.pill,
                  { 
                    borderColor: isActive ? tribeColor : colors.border, 
                    backgroundColor: tribeColor, // Always show tribe color
                    // Add glow effect for selected tribe only
                    ...(isActive ? {
                      shadowColor: tribeColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 12,
                      elevation: 8, // For Android
                    } : {})
                  },
                  pressed && { opacity: 0.6 }
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Abrir tribo ${t.name}`}
              >
                <Animated.View style={[styles.symbolContainer, { transform: [{ scale }] }]}>
                  {t.icon && t.icon.includes('<svg') ? (
                    <SvgIcon 
                      svgString={t.icon} 
                      size={60} 
                      color={tribeIconColor} 
                    />
                  ) : (
                    <Animated.Text style={[styles.symbol, { color: tribeIconColor }]}>
                      {t.icon || '◇'}
                    </Animated.Text>
                  )}
                </Animated.View>
              </Pressable>
              <Text style={[styles.tribeLabel, { color: colors.text, fontWeight: isActive ? '800' : '700' }]} numberOfLines={1}>
                {t.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 10,
    overflow: 'visible', // Prevent shadow clipping
  },
  title: {
    fontSize: 22,
    fontFamily: family.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scrollContent: {
    paddingVertical: 16, // Increased to prevent shadow clipping
    paddingRight: 4,
    paddingLeft: 16, // Increased left padding to prevent shadow clipping on first item
  },
  tribeWrapper: {
    width: 92,
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 4, // Add small left margin for better shadow visibility
    overflow: 'visible', // Ensure shadow is not clipped
  },
  pill: {
    width: '100%',
    aspectRatio: 1.35,
    borderWidth: 2,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  symbol: { fontSize: 32, fontFamily: family.semibold },
  symbolContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tribeLabel: { marginTop: 6, fontSize: 12, fontStyle: 'italic', fontFamily: family.bold }
  // indicator removed
});

