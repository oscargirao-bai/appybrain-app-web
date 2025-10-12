import React, { useState } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import SvgIcon from '../../components/General/SvgIcon.jsx';

export default function Options({
  value,
  onChange,
  style,
  height = 44,
  minWidth = 72,
  iconSize = 22,
  radius = 18,
  gap = 12,
}) {
	const colors = useThemeColors();
	const options = [
    { key: 'avatar', icon: 'user', label: 'Avatar' },
    { key: 'background', icon: 'image', label: 'Background' },
    { key: 'frames', icon: 'square', label: 'Molduras' },
  ];
  const [internal, setInternal] = useState('avatar');
  const current = value ?? internal;

  function select(k) {
    if (value == null) setInternal(k);
    onChange && onChange(k);
  }

  const containerStyle = {
    ...styles.container,
    borderColor: colors.primary + '22',
    ...(style || {})
  };

  return (
    <div style={containerStyle}>
      <div style={styles.row}>
        {options.map(opt => {
          const selected = current === opt.key;
          const btnStyle = {
            ...styles.option,
            height,
            minWidth,
            borderRadius: radius,
            backgroundColor: selected ? colors.primary + '33' : 'transparent',
            borderColor: selected ? colors.primary : colors.text + '20',
          };
          const txtStyle = {
            ...styles.labelText,
            color: selected ? colors.primary : colors.text + '88',
          };
          return (
            <button
              key={opt.key}
              style={btnStyle}
              onClick={() => select(opt.key)}
              aria-label={opt.label}
            >
              <SvgIcon name={opt.icon} size={iconSize} color={selected ? colors.primary : colors.text + '88'} />
              <span style={txtStyle}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 20,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    display: 'flex',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    transition: 'all 0.26s ease-out',
    background: 'transparent',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
  },
};
