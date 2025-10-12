import React, { useState, useRef, useEffect } from 'react';
import {Easing} from 'react-native';
import { useThemeColors } from '../../services/Theme';
import SvgIcon from '../../components/General/SvgIcon';

// Horizontal selectable options bar for Shop categories
// Only three icon options: avatar, background, frames
export default function Options({
  value,
  onChange,
  style,
  height = 44, // button height
  minWidth = 72, // base width for rectangle
  iconSize = 22,
  radius = 18,
  gap = 12,
}) {
	const colors = useThemeColors();
	const options = [
    { key: 'avatar', icon: 'user', label: 'Avatar' },
    { key: 'background', icon: 'image', label: 'Background' },
    { key: 'frames', icon: 'square', label: 'Molduras' },
  ];
  const [internal, setInternal] = useState('avatar');
  const current = value ?? internal;

  // Animation state (positions for sliding highlight)
  const animX = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(minWidth)).current;
  const layoutsRef = useRef({};

  // Trigger slide when current changes and layout known
  useEffect(() => {
    const lay = layoutsRef.current[current];
    if (lay) {
      // Both animations run on JS thread (width isn't supported by native driver; keep translateX consistent to avoid hybrid warning)
      Animated.parallel([
        Animated.timing(animX, { toValue: lay.x, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        Animated.timing(animW, { toValue: lay.w, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]).start();
    }
  }, [current, animX, animW]);

  function select(k) {
    if (value == null) setInternal(k);
    onChange && onChange(k);
  }

  return (
    <div style={{...styles.container, ...{ borderColor: colors.primary + '22'}}>
      <div style={styles.row}>
        {/* Sliding highlight */}
        <Animated.View
          pointerEvents="none"
          style={[styles.highlight, {
            height,
            borderRadius: radius,
            backgroundColor: colors.primary,
            transform: [{ translateX: animX }],
            width: animW,
          }]}
        />
        {options.map(opt => {
          const active = opt.key === current;
          return (
            <button               key={opt.key}
              
              aria-label={`Selecionar ${opt.label}`}
              onLayout={e => {
                const { x, width: w } = e.nativeEvent.layout;
                layoutsRef.current[opt.key] = { x, w };
                // If first render matches current ensure highlight in place
                if (opt.key === current && animW._value === minWidth && animX._value === 0) {
                  animX.setValue(x);
                  animW.setValue(w);
                }
              }}
              onClick={() => select(opt.key)}
              style={{...styles.iconBtn, ...{
                minWidth}}
            >
              <SvgIcon name={opt.icon} size={iconSize} color={active ? colors.background : colors.primary} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { marginTop: 12, alignSelf: 'center', borderWidth: 2, borderRadius: 28, paddingVertical: 8, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconBtn: { marginRight: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  highlight: { position: 'absolute', left: 0, top: 0 },
};

