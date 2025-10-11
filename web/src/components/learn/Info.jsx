import React from 'react';
import Icon from '../common/Icon.jsx';
import { t } from '../../services/Translate.js';

export default function Info({ username='—', tribe, stars=0, coins=0 }){
  const nf = (n)=> new Intl.NumberFormat('pt-PT').format(n||0);
  return (
    <div className="w-info">
      <div className="w-left">
        <div className="w-username">{username}</div>
        <div className="w-tribe">{tribe || t('common.noTribe')}</div>
      </div>
      <div className="w-metrics">
        <div className="w-pill"><Icon name="star" size={18} color="#ffc107" /><span>{nf(stars)}</span></div>
        <div className="w-pill"><Icon name="coins" size={18} color="#f5c542" /><span>{nf(coins)}</span></div>
      </div>
      <style>{`
        .w-info{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid rgba(0,0,0,.15);border-top:0;border-radius:0 0 18px 18px;background:#fff}
        .w-left{min-width:0}
        .w-username{font-weight:800;font-size:16px}
        .w-tribe{opacity:.7;font-size:14px;margin-top:2px}
        .w-metrics{display:flex;gap:6px}
        .w-pill{display:flex;align-items:center;gap:6px;border:1px solid rgba(0,0,0,.2);border-radius:12px;padding:6px 10px;background:#fff;font-weight:600}
      `}</style>
    </div>
  );
}
