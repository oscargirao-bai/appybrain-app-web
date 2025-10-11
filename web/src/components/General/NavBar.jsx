import React from 'react';
import Icon from '../common/Icon.jsx';

export default function NavBar({ onNavigate, selected = 'Home' }) {
  const items = [
    { key: 'Home', icon: <Icon name="home" size={22} />, label: 'Início' },
    { key: 'Profile', icon: <Icon name="user" size={22} />, label: 'Perfil' },
    { key: 'Notifications', icon: <Icon name="bell" size={22} />, label: 'Notificações' },
    { key: 'Shop', icon: <Icon name="shopping-bag" size={22} />, label: 'Loja' },
  ];
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
      {items.map(it => (
        <button key={it.key} onClick={() => onNavigate(it.key)} style={{ background: 'transparent', color: selected === it.key ? '#FFD93D' : '#eee', border: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
          {it.icon}
          <span style={{ fontSize: 13 }}>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
