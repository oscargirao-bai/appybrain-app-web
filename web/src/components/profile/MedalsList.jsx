import React, { useState, useRef, useEffect } from 'react';
import Icon from '../common/Icon.jsx';
import SvgIcon from '../common/SvgIcon.jsx';
import './MedalsList.css';

const FALLBACK_MEDALS = Array.from({ length: 20 }, (_, i) => ({
  id: `medal-${i}`,
  icon: 'medal',
  unlocked: i < 5,
  new: i < 2,
  title: `Medalha ${i + 1}`,
  description: 'Descrição da medalha',
  level: i % 3 + 1,
  current: i * 10,
  target: 100
}));

export default function MedalsList({ medals: medalsProp, title = 'Medalhas', onMedalPress, style = {} }) {
  const medals = medalsProp && medalsProp.length ? medalsProp : FALLBACK_MEDALS;
  const [internalMedals, setInternalMedals] = useState(medals);
  const [page, setPage] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    setInternalMedals(medals);
  }, [medals]);

  const columnsPerScreen = window.innerWidth >= 768 ? 5 : 4;
  const rows = 2;
  const columnData = [];
  for (let i = 0; i < internalMedals.length; i++) {
    const colIndex = Math.floor(i / rows);
    if (!columnData[colIndex]) columnData[colIndex] = [];
    const m = internalMedals[i];
    const isNew = !!(m.newMedal || m.new);
    columnData[colIndex].push({ ...m, justUnlocked: m.unlocked && isNew, _isNew: isNew });
  }

  const pages = Math.ceil(columnData.length / columnsPerScreen);
  const cellWidth = 100 / columnsPerScreen;

  const handleMedalPress = (medal) => {
    if (onMedalPress) onMedalPress(medal);
    setInternalMedals(prev => prev.map(m => m.id === medal.id ? { ...m, newMedal: false, new: false } : m));
  };

  return (
    <div className="medals-list" style={style}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>{title}</h3>
      <div className="medals-scroll" ref={scrollRef} onScroll={(e) => {
        const offsetX = e.target.scrollLeft;
        const virtual = Math.round(offsetX / e.target.offsetWidth);
        if (virtual !== page) setPage(virtual);
      }}>
        <div className="medals-row" style={{ width: `${columnData.length * cellWidth}%` }}>
          {columnData.map((col, colIdx) => (
            <div key={colIdx} className="medals-column" style={{ width: `${cellWidth}%` }}>
              {col.map((medal, idx) => (
                <MedalButton key={`${medal.id}-${idx}`} medal={medal} onPress={() => handleMedalPress(medal)} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="medals-dots">
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} className={i === page ? 'dot active' : 'dot'} onClick={() => {
            scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' });
          }} />
        ))}
      </div>
    </div>
  );
}

function MedalButton({ medal, onPress }) {
  const isNew = !!medal.justUnlocked;
  const badgeColor = medal.color || '#FFD700';
  const iconColor = medal.iconColor || '#222';

  return (
    <div className={`medal-cell ${isNew ? 'new' : ''}`}>
      <button onClick={onPress} className="medal-btn">
        <div className={medal.unlocked ? 'medal-outer active' : 'medal-outer inactive'} style={{ borderColor: medal.unlocked ? badgeColor : '#00000033' }}>
          <div className={medal.unlocked ? 'medal-inner active' : 'medal-inner inactive'} style={{ backgroundColor: medal.unlocked ? badgeColor : '#00000011' }}>
            {medal.icon && medal.icon.includes('<svg') ? (
              <SvgIcon svgString={medal.icon} size={34} color={medal.unlocked ? iconColor : '#00000055'} />
            ) : (
              <Icon name={medal.icon || 'medal'} size={34} color={medal.unlocked ? iconColor : '#00000055'} />
            )}
            {isNew && <div className="new-dot" />}
          </div>
        </div>
      </button>
    </div>
  );
}
