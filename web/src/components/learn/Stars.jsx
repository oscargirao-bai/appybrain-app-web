import React, { useState, useEffect } from 'react';
import DataManager from '../../services/DataManager';

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
    if (windowWidth < 350) return Math.floor(size * 0.7);
    if (windowWidth < 400) return Math.floor(size * 0.85);
    return size;
  };

  const effectiveSize = getResponsiveSize();

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const starData = await DataManager.getUserStarsScoped({ areaId, categoryId, contentId });
        if (starData && typeof starData.earned !== 'undefined') {
          setEarned(starData.earned);
          setMax(starData.max || 3);
          if (editable) setLocalRating(starData.earned);
        }
      } catch (err) {
        console.error('Error fetching stars:', err);
      }
    };
    fetchStars();
  }, [areaId, categoryId, contentId, editable]);

  const handleStarPress = (index) => {
    if (!editable) return;
    const newVal = index + 1;
    setLocalRating(newVal);
    onChange(newVal);
  };

  const getStarFill = (index) => {
    const val = editable ? localRating : earned;
    if (val >= index + 1) return 1;
    if (val > index) return val - index;
    return 0;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 4, ...style }}>
      {[0, 1, 2].map((index) => (
        <button
          key={index}
          onClick={() => handleStarPress(index)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: editable ? 'pointer' : 'default',
          }}
          disabled={!editable}
          aria-label={`Star ${index + 1}`}
        >
          <Star
            fillFraction={getStarFill(index)}
            size={effectiveSize}
            filledColor="#FFC107"
            strokeColor="#E0E0E0"
          />
        </button>
      ))}
    </div>
  );
}
