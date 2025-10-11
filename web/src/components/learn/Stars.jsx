import React, { useState, useEffect } from 'react';

import Svg, { Path, Defs, ClipPath, Rect } from 'react-native-svg';
import DataManager from '../../services/DataManager';

// Simple star SVG that can be filled or empty.
const Star = ({ fillFraction = 0, size = 48, filledColor = '#FFC107', strokeColor = 'transparent' }) => {
  // Star path (five-pointed) sized for 24x24 viewBox
  const d = 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192L12 .587z';

  // Unique clip id to avoid collisions
  const clipId = `clip-${Math.random().toString(36).slice(2)}`;

  // clamp fraction
  const frac = Math.max(0, Math.min(1, Number(fillFraction) || 0));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <ClipPath id={clipId}>
          {/* Clip rect from bottom to top based on fill fraction */}
          <Rect x="0" y={String(24 - (frac * 24))} width="24" height={String(frac * 24)} />
        </ClipPath>
      </Defs>

      {/* Base star filled with stroke color (empty appearance) */}
      <Path d={d} fill={strokeColor} stroke="#2C2C2C" strokeWidth="1.2" />

      {/* Filled overlay clipped by rectangle to create bottom-to-top fill effect */}
      <Path d={d} fill={filledColor} stroke="#2C2C2C" strokeWidth="1.2" clipPath={`url(#${clipId})`} />
    </Svg>
  );
};

/**
 * Stars component (3 stars)
 * Props:
 *  - areaId, categoryId, contentId (optional) — fetch stars scoped to these if provided
 *  - editable: boolean (default false) — if true, user can tap to change rating
  *  - onChange: function(newValue) called only when editable=true
  *  - size: number (pixel size of each star)
  *  - style: container style
 */
export default function Stars({ areaId = null, categoryId = null, contentId = null, editable = false, onChange = () => {}, size = 20, style, responsive = false }) {
  const [earned, setEarned] = useState(0);
  const [max, setMax] = useState(0);
  const [localRating, setLocalRating] = useState(0); // used only when editable
  const { width: windowWidth } = useWindowDimensions();

  // Calculate responsive size if enabled
  const getResponsiveSize = () => {
    if (!responsive) return size;
    
    // Base size for 375px wide screens (typical phone), scale proportionally
    const baseWidth = 375;
    const scaleFactor = windowWidth / baseWidth;
    
    // More conservative scaling for smaller phones
    // Reduce size more aggressively on small screens
    let clampedScale;
    if (windowWidth <= 320) {
      // Very small phones: scale down significantly
      clampedScale = Math.max(0.6, Math.min(0.8, scaleFactor));
    } else if (windowWidth <= 375) {
      // Small phones: moderate scale down
      clampedScale = Math.max(0.7, Math.min(1.0, scaleFactor));
    } else {
      // Larger screens: normal scaling
      clampedScale = Math.max(0.8, Math.min(1.3, scaleFactor));
    }
    
    return Math.round(size * clampedScale);
  };

  const responsiveSize = getResponsiveSize();

  // Compute filled count from earned/max scaled to 0..3
  const computeFilled = (earnedStars, maxStars) => {
    if (!maxStars || maxStars <= 0) return 0;
    const ratio = earnedStars / maxStars;
    return Math.round(ratio * 3);
  });

  // Load initial data from DataManager based on provided scope
  const loadFromDataManager = () => {
    try {
      if (contentId) {
        const content = DataManager.getContentStars(contentId) || {};
        // Prefer totalStars when available, otherwise sum individual difficulties if present
        let e = 0;
        if (typeof content.totalStars === 'number') {
          e = content.totalStars;
        } else if (content.stars && typeof content.stars === 'object') {
          const easy = Number(content.stars.easy || 0);
          const hard = Number(content.stars.hard || 0);
          const genius = Number(content.stars.genius || 0);
          e = easy + hard + genius;
        }
        const m = typeof content.maxStars === 'number' ? content.maxStars : 3;
        setEarned(e);
        setMax(m);
        return;
      }

      if (categoryId) {
        const cat = DataManager.getCategoryStars(categoryId) || { earnedStars: 0, maxStars: 0 });
        setEarned(cat.earnedStars || 0);
        setMax(cat.maxStars || 0);
        return;
      }

      if (areaId) {
        const area = DataManager.getAreaStars(areaId) || { earnedStars: 0, maxStars: 0 });
        setEarned(area.earnedStars || 0);
        setMax(area.maxStars || 0);
        return;
      }

      // Default: total stars
      const totals = DataManager.getTotalStars() || { earnedStars: 0, maxStars: 0 });
      setEarned(totals.earnedStars || 0);
      setMax(totals.maxStars || 0);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadFromDataManager();
    // Subscribe to updates so stars refresh when DataManager notifies
    const unsubscribe = DataManager.subscribe(() => {
      loadFromDataManager();
    });
    return unsubscribe;
  }, [areaId, categoryId, contentId]);

  // When editable, maintain a local rating (1..3). If not editable, rating comes from data.
  const rating = editable ? localRating : computeFilled(earned, max);

  // Compute fill fraction for each star (0..1) based on earned/max
  const computeStarFraction = (index) => {
    if (!max || max <= 0) return 0;
    
    // Calculate how many complete stars we should have filled
    const totalFillRatio = earned / max;
    const totalVisualStars = totalFillRatio * 3;
    
    // For star at position 'index' (1, 2, or 3)
    if (totalVisualStars >= index) {
      // This star should be completely filled
      return 1;
    } else if (totalVisualStars >= (index - 1)) {
      // This star should be partially filled
      return totalVisualStars - (index - 1);
    } else {
      // This star should be empty
      return 0;
    }
  };

  const handlePress = (i) => {
    if (!editable) return;
    setLocalRating(i);
    try { onChange(i); } catch (e) {}
  };

  // Calculate margins based on responsive size
  const starMargin = Math.round(responsiveSize * 0.1); // 10% of star size
  const centerStarOffset = Math.round(responsiveSize * 0.2); // 20% of star size for center star elevation

  return (
    <div style={{...styles.row, ...style}}>
      {[1, 2, 3].map((i) => {
        const frac = editable ? (i <= rating ? 1 : 0) : computeStarFraction(i);
        
        // Calculate positioning: center star elevated, side stars slightly lower
        const marginTop = i === 2 ? -centerStarOffset : Math.round(centerStarOffset * 2.0);
        const marginRight = i < 3 ? starMargin : 0;
        
        return (
          <button             key={i}
            onClick={() => handlePress(i)}
            activeOpacity={editable ? 0.7 : 1}
            accessibilityRole={editable ? 'button' : 'image'}
            aria-label={editable ? `Set ${i} star${i > 1 ? 's' : ''}` : `Stars: ${earned}/${max}`}
            disabled={!editable}
          >
            <div style={{ marginRight, marginTop }}>
              <Star size={responsiveSize} fillFraction={frac} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

const styles = {
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
};
