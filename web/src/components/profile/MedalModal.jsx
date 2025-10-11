import React, { useEffect, useState } from 'react';
import Icon from '../common/Icon.jsx';
import SvgIcon from '../common/SvgIcon.jsx';
import './MedalModal.css';

export default function MedalModal({ visible, onClose, medal }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!visible || !medal) return null;

  const progress = Math.min(1, medal.target ? medal.current / medal.target : 0);

  return (
    <div className={`medal-modal ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="medal-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="medal-modal-content">
          <div className="medal-row-top">
            <div className={`medal-icon-circle ${medal.unlocked ? 'unlocked' : 'locked'}`} style={{ 
              backgroundColor: medal.unlocked ? (medal.color || '#FFD700') : '#00000011',
              borderColor: medal.unlocked ? (medal.color ? medal.color + '66' : '#FFD70066') : '#00000033'
            }}>
              {medal.icon && medal.icon.includes('<svg') ? (
                <div style={{ transform: 'scale(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SvgIcon svgString={medal.icon} size={34} />
                </div>
              ) : (
                <div style={{ transform: 'scale(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={medal.icon || 'medal'} size={38} color={medal.unlocked ? (medal.iconColor || '#222') : '#00000055'} />
                </div>
              )}
              {!medal.hideLevel && medal.unlocked && medal.level > 0 && (
                <div className="level-badge" style={{ backgroundColor: medal.color || '#FFD700' }}>
                  <span>{medal.level ?? 1}</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, paddingLeft: 14 }}>
              <h3 className="medal-title">{medal.title || medal.id}</h3>
              <p className="medal-desc">{medal.description || 'Sem descrição.'}</p>
            </div>
          </div>
          {medal.target !== null && medal.target !== undefined && (
            <div className="medal-progress-wrap">
              <div className="medal-progress-bar">
                <div className="medal-progress-fill" style={{ width: `${progress * 100}%` }} />
                <div className="medal-progress-label">
                  <span>{medal.current}/{medal.target}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
