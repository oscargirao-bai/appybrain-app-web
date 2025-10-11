import React, { useMemo } from 'react';

function getChestImage(type) {
  switch (type) {
    case 'silver': return '/assets/chests/chest-silver.png';
    case 'gold': return '/assets/chests/chest-gold.png';
    case 'epic': return '/assets/chests/chest-epic.png';
    case 'bronze':
    default: return '/assets/chests/chest-bronze.png';
  }
}

export default function Chest({ size = 86, data }) {
  // data shape mirrors RN: { stars: { current, nextThreshold, chests: [...] }, points: {...} }
  const src = data?.stars || {};
  const available = (src.chests || []).filter(c => c.openedAt === null && c.grantedAt); 
  const hasAvailable = available.length > 0;
  const current = Number(src.current || 0);
  const target = Number(src.nextThreshold || 10);
  const lastEarned = (src.chests || [])
    .filter(c => c.grantedAt)
    .sort((a,b) => new Date(b.grantedAt) - new Date(a.grantedAt))[0] || null;
  const start = Number(lastEarned?.milestone || 0);
  const range = Math.max(1, target - start);
  const prog = hasAvailable ? 1 : Math.max(0, Math.min(1, (current - start) / range));
  const type = hasAvailable ? (available[0].chestType || 'bronze') : (src.nextChestType || 'bronze');

  const ring = useMemo(() => {
    const thickness = 8;
    const r = (size - thickness) / 2;
    const C = 2 * Math.PI * r;
    const dash = C * (1 - prog);
    return { thickness, r, C, dash };
  }, [size, prog]);

  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ position:'absolute', inset:0 }}>
        <circle cx={size/2} cy={size/2} r={ring.r} stroke={'#0003'} strokeWidth={ring.thickness} fill="none" />
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={ring.r} stroke={"url(#grad)"} strokeWidth={ring.thickness} strokeDasharray={`${ring.C} ${ring.C}`} strokeDashoffset={ring.dash} strokeLinecap="round" fill="none" />
        </g>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a6ddf" />
            <stop offset="100%" stopColor="#7fb2ff" />
          </linearGradient>
        </defs>
      </svg>
      <img src={getChestImage(type)} alt="chest" style={{ position:'absolute', inset:0, margin:'auto', width:size*0.58, height:size*0.58, objectFit:'contain' }} />
    </div>
  );
}
