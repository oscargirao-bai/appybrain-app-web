import React, { useEffect, useState } from 'react';
import DataManager from '../../services/DataManager.js';
import { t } from '../../services/Translate.js';
import Icon from '../../components/common/Icon.jsx';
import Area from '../../components/learn/Area.jsx';

export default function Category({ onNavigate, disciplineId }) {
  const [disciplines, setDisciplines] = useState([]);

  useEffect(() => {
    const updateData = () => {
      const disciplinesData = DataManager.getDisciplines();
      setDisciplines(disciplinesData);
    };
    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, []);

  return (
    <div className="page-50" style={{ minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => onNavigate('Learn')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{t('titles.learn')}</h1>
      </header>
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', padding: '0 20px', gap: 16 }}>
        {disciplines.map(d => (
          <div key={d.id} style={{ margin: 8 }}>
            <Area 
              title={d.title} 
              svgIcon={d.icon} 
              color={d.color} 
              iconColor={d.iconColor} 
              onPress={() => console.log('Open content for', d.id)} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
