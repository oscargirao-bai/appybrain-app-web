import React, { useEffect, useState, useMemo } from 'react';
import DataManager from '../../services/DataManager.js';
import { useThemeColors } from '../../services/Theme.jsx';
import { t } from '../../services/Translate.js';
import Icon from '../../components/common/Icon.jsx';
import SvgIcon from '../../components/common/SvgIcon.jsx';

function addAlpha(hex, alpha) {
  if (!hex || hex.startsWith('rgb')) return hex;
  let h = hex.replace('#','');
  if (h.length === 3) h = h.split('').map(c=>c+c).join('');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function CategoryCard({ item, onPress }) {
  const pct = (item.stars / item.maxStars) || 0;
  const baseColor = item.color || '#FFD700';
  const iconColor = item.iconColor || '#222';
  const fillColor = addAlpha(baseColor, 0.8);
  const containerBg = addAlpha(baseColor, 0.5);
  
  return (
    <button onClick={onPress} style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      border: `2px solid ${containerBg}`,
      borderRadius: 16,
      minHeight: 86,
      overflow: 'hidden',
      background: baseColor,
      cursor: 'pointer',
      padding: 0,
      marginBottom: 16
    }}>
      <div style={{ flex: pct, background: fillColor }} />
      <div style={{ flex: 1 - pct }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0 8px', pointerEvents: 'none' }}>
        {item.icon && item.icon.includes('<svg') ? (
          <div style={{ width: 45, height: 45, marginRight: 10 }}>
            <SvgIcon svgString={item.icon} size={45} color={iconColor} />
          </div>
        ) : (
          <Icon name="book-open" size={40} color={iconColor} style={{ marginRight: 10 }} />
        )}
        <div style={{ flex: 1, fontSize: 20, fontWeight: 700, color: iconColor, textAlign: 'left' }}>{item.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 30, border: `2px solid ${iconColor}` }}>
          <Icon name="star" size={14} color={iconColor} />
          <span style={{ fontSize: 12, fontWeight: 700, color: iconColor }}>{item.stars}</span>
        </div>
      </div>
    </button>
  );
}

export default function Category({ onNavigate, disciplineId }) {
  const colors = useThemeColors();
  const [discipline, setDiscipline] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const updateData = () => {
      if (disciplineId) {
        const disciplineData = DataManager.getAreaById?.(disciplineId);
        setDiscipline(disciplineData);
        
        const transformedCategories = (disciplineData?.categories || []).map(category => {
          const categoryStars = DataManager.getCategoryStars?.(category.id) || { earnedStars: 0, maxStars: 0 };
          return {
            id: category.id,
            title: category.title,
            icon: category.icon,
            color: category.color,
            iconColor: category.iconColor,
            stars: categoryStars.earnedStars,
            maxStars: categoryStars.maxStars
          };
        });
        setCategories(transformedCategories);
      }
    };
    updateData();
    const unsubscribe = DataManager.subscribe(updateData);
    return unsubscribe;
  }, [disciplineId]);

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const searchLower = searchText.toLowerCase().trim();
    return categories.filter(category => {
      const fullCategory = discipline?.categories?.find(cat => cat.id === category.id);
      if (!fullCategory || !fullCategory.contents) return false;
      return fullCategory.contents.some(content => 
        content.title?.toLowerCase().includes(searchLower) ||
        content.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [categories, discipline, searchText]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <div className="page-50" style={{ padding: '20px', paddingBottom: '100px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => onNavigate('Learn')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, flex: 1, textAlign: 'center', marginRight: 40 }}>{discipline?.title || 'Carregando...'}</h1>
      </header>
      <div style={{ marginBottom: 16 }}>
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          value={searchText} 
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(0,0,0,.15)', fontSize: 16 }}
        />
      </div>
      <div>
        {filteredCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.5 }}>Sem conteúdos</div>
        ) : (
          filteredCategories.map(item => (
            <CategoryCard 
              key={item.id} 
              item={item} 
              onPress={() => onNavigate('Content', { categoryId: item.id, categoryTitle: item.title, categoryColor: item.color, categoryIconColor: item.iconColor })}
            />
          ))
        )}
      </div>
      </div>
    </div>
  );
}
