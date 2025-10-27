import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThemeColors } from '../../services/Theme.jsx';
import LucideIcon from '../../components/General/LucideIcon.jsx';
import { useTheme } from '../../services/Theme.jsx';

export default function Options({
  value,
  onChange,
  style,
  height = 44,
  minWidth = 72,
  iconSize = 22,
  radius = 18,
  gap = 12,
  showLabel = true,
}) {
	const colors = useThemeColors();
  const options = [
    { key: 'avatar', icon: 'user', label: 'Avatar' },
    { key: 'background', icon: 'image', label: 'Background' },
    { key: 'frames', icon: 'square', label: 'Molduras' },
  ];
  const { resolvedTheme } = useTheme();
  const [internal, setInternal] = useState('avatar');
  const current = value ?? internal;
  const rowRef = useRef(null);
  const buttonRefs = useRef({});
  const [highlight, setHighlight] = useState({ width: 0, left: 0 });

  const updateHighlight = useCallback(() => {
    const container = rowRef.current;
    const target = buttonRefs.current[current];
    if (!container || !target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setHighlight({
      width: targetRect.width,
      left: targetRect.left - containerRect.left,
    });
  }, [current]);

  useEffect(() => {
    updateHighlight();
  }, [current, updateHighlight]);

  useEffect(() => {
    const handleResize = () => updateHighlight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateHighlight]);

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
      <div ref={rowRef} style={styles.row}>
        <div
          style={{
            ...styles.highlight,
            height,
            borderRadius: radius,
            backgroundColor: colors.primary,
            width: highlight.width,
            transform: `translateX(${highlight.left}px)`
          }}
        />
        {options.map(opt => {
          const selected = current === opt.key;
          const btnStyle = {
            ...styles.option,
            height,
            minWidth,
            borderRadius: radius,
            color: selected ? colors.background : colors.primary,
          };
          const txtStyle = {
            ...styles.labelText,
            color: selected ? colors.background : colors.text + '88',
          };
          return (
            <button
              key={opt.key}
              ref={(el) => { buttonRefs.current[opt.key] = el; }}
              style={btnStyle}
              onClick={() => select(opt.key)}
              aria-label={opt.label}
            >
                  <LucideIcon
                    name={opt.icon}
                    size={iconSize}
                    // When selected the icon sits on the yellow primary highlight.
                    // Per spec: icon must be white in light mode and black in dark mode.
                    color={selected ? (resolvedTheme === 'light' ? '#FFFFFF' : '#000000') : colors.primary}
                    style={{ display: 'inline-flex' }}
                  />
                    {showLabel && <span style={txtStyle}>{opt.label}</span>}
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
    position: 'relative',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
  },
  option: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 12,
    cursor: 'pointer',
    transition: 'all 0.26s ease-out',
    background: 'transparent',
    borderWidth: 0,
    position: 'relative',
    zIndex: 1,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    zIndex: 1,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    transition: 'transform 0.26s ease-out, width 0.26s ease-out',
    zIndex: 0,
  },
};
