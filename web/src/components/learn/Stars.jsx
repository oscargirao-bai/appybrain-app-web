import React from 'react';

function Star({ filled = 1, size = 32 }){
  const frac = Math.max(0, Math.min(1, filled));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id="starFillClip">
          <rect x="0" y={24 - 24 * frac} width="24" height={24 * frac} />
        </clipPath>
      </defs>
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896 4.664 23.165l1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.168L12 18.896 4.664 23.165l1.402-8.168L.132 9.21l8.2-1.192L12 .587z" fill="#FFC107" stroke="#222" strokeWidth="1.2" clipPath="url(#starFillClip)" />
    </svg>
  );
}

export default function Stars({ value = 0, size = 48 }){
  const ratio = Math.max(0, Number(value)||0) / 3; // normalize 0..3
  const v = ratio * 3;
  const f1 = Math.min(1, Math.max(0, v - 0));
  const f2 = Math.min(1, Math.max(0, v - 1));
  const f3 = Math.min(1, Math.max(0, v - 2));
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <Star filled={f1} size={size} />
      <Star filled={f2} size={size} />
      <Star filled={f3} size={size} />
    </div>
  );
}
