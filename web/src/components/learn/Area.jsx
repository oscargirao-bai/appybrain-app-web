import React, { useRef } from 'react';
import { Pressable, View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useThemeColors } from '../../services/Theme';
import { family } from '../../constants/font';
import Icon from '@react-native-vector-icons/lucide';
import SvgIcon from '../General/SvgIcon';
import DataManager from '../../services/DataManager';
import Svg, { Defs, ClipPath, Rect, Polygon } from 'react-native-svg';

/**
 * DisciplineCircle – circular discipline display with:
 *  - 3 stars on top in podium formation (middle star higher)
 *  - Circular icon container with discipline color
 *  - Title below the circle
 * Props:
 *  - title: string (discipline name)
 *  - iconName: lucide icon name (fallback)
 *  - svgIcon: string (SVG markup from API)
 *  - color: string (hex color from API)
 *  - iconColor: string (icon color from API)
 *  - disciplineId: number (for getting star progress)
 *  - onPress: function
 *  - style: external style override
 */
export default function DisciplineCircle({ 
  title, 
  iconName = 'book-open', 
  svgIcon, 
  color, 
  iconColor,
  disciplineId,
  onPress, 
  style 
}) {
  const colors = useThemeColors();
  const scale = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => Animated.timing(scale, { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const handlePressOut = () => Animated.timing(scale, { toValue: 0, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  const pressScale = scale.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  // Use API colors
  const circleBackgroundColor = color ? addAlpha(color, 0.2) : colors.card;
  const circleColor = color || colors.border;
  const finalIconColor = iconColor || colors.text;

  return (
    <Animated.View style={[styles.container, style]}>

        {/* Icon and title in the same row */}
        <View style={styles.contentRow}>
          {/* Circular icon container */}
          <View style={[
            styles.circle, 
            { 
              backgroundColor: circleColor,
              borderColor: circleBackgroundColor,
            }
          ]}>
            {svgIcon ? (
              <SvgIcon 
                svgString={svgIcon} 
                size={32} 
                color={finalIconColor} 
              />
            ) : (
              <Icon 
                name={iconName} 
                size={32} 
                color={finalIconColor} 
              />
            )}
          </View>

          {/* Title next to icon */}
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        </View>
    </Animated.View>
  );
}

function addAlpha(hexOrRgba, alpha) {
  if (!hexOrRgba) return `rgba(0,0,0,${alpha})`;
  if (hexOrRgba.startsWith('rgba') || hexOrRgba.startsWith('rgb')) {
    return hexOrRgba.replace(/rgba?\(([^)]+)\)/, (m, inner) => {
      const parts = inner.split(',').map(p => p.trim());
      const [r,g,b] = parts;
      return `rgba(${r},${g},${b},${alpha})`;
    });
  }
  let h = hexOrRgba.replace('#','');
  if (h.length === 3) h = h.split('').map(c => c+c).join('');
  const int = parseInt(h,16);
  const r = (int>>16)&255, g=(int>>8)&255, b=int&255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginVertical: 6,
    width: 200, // Increased width to accommodate longer titles
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  circle: {
    width: 65, // Smaller circle
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3, // Thicker border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20, // Slightly smaller font to fit better
    fontWeight: '700',
    fontFamily: family.bold,
    textAlign: 'left',
    lineHeight: 22, // Adjusted line height
    flex: 1,
  },
});