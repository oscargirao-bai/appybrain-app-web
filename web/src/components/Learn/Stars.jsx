import React, { useState, useEffect } from 'react';
import DataManager from '../../services/DataManager.jsx';

const Star = ({ fillFraction = 0, size = 48, filledColor = '#FFC107', strokeColor = 'transparent' }) => {
  const d = 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192L12 .587z';
  const clipId = `clip-${Math.random().toString(36).slice(2)}`;
  const frac = Math.max(0, Math.min(1, Number(fillFraction) || 0));

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={24 - (frac * 24)} width="24" height={frac * 24} />
        </clipPath>
      </defs>
      <path d={d} fill={strokeColor} stroke="#2C2C2C" strokeWidth="1.2" />
      <path d={d} fill={filledColor} stroke="#2C2C2C" strokeWidth="1.2" clipPath={`url(#${clipId})`} />
    </svg>
  );
};

export default function Stars({ 
  areaId = null, 
  categoryId = null, 
  contentId = null, 
  editable = false, 
  onChange = () => {}, 
  size = 20, 
  style, 
  responsive = false 
}) {
  const [earned, setEarned] = useState(0);
  const [max, setMax] = useState(0);
  const [localRating, setLocalRating] = useState(0);
  const windowWidth = window.innerWidth;

  const getResponsiveSize = () => {
    if (!responsive) return size;
    
    const baseWidth = 375;
    const scaleFactor = windowWidth / baseWidth;
    
    let clampedScale;
    if (windowWidth <= 320) {
      clampedScale = Math.max(0.6, Math.min(0.8, scaleFactor));
    } else if (windowWidth <= 375) {
      clampedScale = Math.max(0.7, Math.min(1.0, scaleFactor));
    } else {
      clampedScale = Math.max(0.8, Math.min(1.3, scaleFactor));
    }
    
    return Math.round(size * clampedScale);
  };

  const responsiveSize = getResponsiveSize();

  const computeFilled = (earnedStars, maxStars) => {
    if (!maxStars || maxStars <= 0) return 0;
    const ratio = earnedStars / maxStars;
    return Math.round(ratio * 3);
  };

  const loadFromDataManager = () => {
    try {
      if (contentId) {
        const content = DataManager.getContentStars(contentId) || {};
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
        const cat = DataManager.getCategoryStars(categoryId) || { earnedStars: 0, maxStars: 0 };
        setEarned(cat.earnedStars || 0);
        setMax(cat.maxStars || 0);
        return;
      }

      if (areaId) {
        const area = DataManager.getAreaStars(areaId) || { earnedStars: 0, maxStars: 0 };
        setEarned(area.earnedStars || 0);
        setMax(area.maxStars || 0);
        return;
      }

      const totals = DataManager.getTotalStars() || { earnedStars: 0, maxStars: 0 };
      setEarned(totals.earnedStars || 0);
      setMax(totals.maxStars || 0);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadFromDataManager();
    const unsubscribe = DataManager.subscribe(() => {
      loadFromDataManager();
    });
    return unsubscribe;
  }, [areaId, categoryId, contentId]);

  const rating = editable ? localRating : computeFilled(earned, max);

  const computeStarFraction = (index) => {
    if (!max || max <= 0) return 0;
    
    const totalFillRatio = earned / max;
    const totalVisualStars = totalFillRatio * 3;
    
    if (totalVisualStars >= index) {
      return 1;
    } else if (totalVisualStars >= (index - 1)) {
      return totalVisualStars - (index - 1);
    } else {
      return 0;
    }
  };

  const handlePress = (i) => {
    if (!editable) return;
    setLocalRating(i);
    try { onChange(i); } catch (e) {}
  };

  const starMargin = Math.round(responsiveSize * 0.1);
  const centerStarOffset = Math.round(responsiveSize * 0.2);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', ...style }}>
      {[1, 2, 3].map((i) => {
        const frac = editable ? (i <= rating ? 1 : 0) : computeStarFraction(i);
        
        const marginTop = i === 2 ? -centerStarOffset : Math.round(centerStarOffset * 2.0);
        const marginRight = i < 3 ? starMargin : 0;
        
        return (
          <button
            key={i}
            onClick={() => handlePress(i)}
            disabled={!editable}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: editable ? 'pointer' : 'default',
              opacity: editable ? 1 : 1,
              marginRight,
              marginTop,
            }}
            aria-label={editable ? `Set ${i} star${i > 1 ? 's' : ''}` : `Stars: ${earned}/${max}`}
          >
            <Star size={responsiveSize} fillFraction={frac} />
          </button>
        );
      })}
    </div>
  );
}
