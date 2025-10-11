import React, { useState, useEffect } from 'react';
import DataManager from '../../services/DataManager.js';

function Star({ fillFraction = 0, size = 48 }){
  const frac = Math.max(0, Math.min(1, Number(fillFraction)||0));
  const clipId = `clip-${Math.random().toString(36).slice(2)}`;
  const d = 'M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896l-7.336 3.869 1.402-8.168L.132 9.21l8.2-1.192L12 .587z';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs><clipPath id={clipId}><rect x="0" y={24 - (frac * 24)} width="24" height={frac * 24} /></clipPath></defs>
      <path d={d} fill="transparent" stroke="#2C2C2C" strokeWidth="1.2" />
      <path d={d} fill="#FFC107" stroke="#2C2C2C" strokeWidth="1.2" clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export default function Stars({ value, size = 48, responsive = false }){
  const [earned, setEarned] = useState(0);
  const [max, setMax] = useState(0);
  useEffect(() => {
    const update = () => {
      const totals = DataManager.getTotalStars();
      setEarned(totals.earnedStars||0);
      setMax(totals.maxStars||0);
    };
    update();
    const unsub = DataManager.subscribe(update);
    return unsub;
  }, []);
  const computeFrac = (index) => {
    if (!max || max <= 0) return 0;
    const totalFill = (earned / max) * 3;
    if (totalFill >= index) return 1;
    else if (totalFill >= (index - 1)) return totalFill - (index - 1);
    else return 0;
  };
  const f1 = computeFrac(1), f2 = computeFrac(2), f3 = computeFrac(3);
  const s = responsive ? size : size;
  const centerOffset = Math.round(s * 0.2);
  const margin = Math.round(s * 0.1);
  return (
    <div style={{ display:'flex', alignItems:'center' }}>
      <div style={{ marginTop: centerOffset * 2, marginRight: margin }}><Star fillFraction={f1} size={s} /></div>
      <div style={{ marginTop: -centerOffset, marginRight: margin }}><Star fillFraction={f2} size={s} /></div>
      <div style={{ marginTop: centerOffset * 2 }}><Star fillFraction={f3} size={s} /></div>
    </div>
  );
}
