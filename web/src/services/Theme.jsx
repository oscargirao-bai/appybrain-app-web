import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'appybrain.theme';

// Light theme colors (matching mobile src/constants/color.js)
const colorsLight = {
  background: '#FFFDF5',
  surface: '#F5F7FA',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1A202C',
  muted: '#5F6B7A',
  primary: '#FFE14D',
  secondary: '#339DFF',
  accent: '#B052F7',
  error: '#E53935',
  correct: '#2EAC6D',
  warning: '#FF9800',
  info: '#1E88E5',
  onPrimary: '#2B2400',
  onSecondary: '#FFFFFF',
  onAccent: '#FFFFFF',
  onError: '#FFFFFF',
  onCorrect: '#FFFFFF',
  shadow: '#000000',
  focus: '#339DFF',
  outline: '#FFE14D',
  backdrop: '#0E131A',
};

// Dark theme colors (matching mobile src/constants/color.js)
const colorsDark = {
  background: '#0E131A',
  surface: '#17202A',
  card: '#1E2A35',
  border: '#2D3A46',
  text: '#F5F7FA',
  muted: '#8C98A8',
  primary: '#F9E547',
  secondary: '#59B3FF',
  accent: '#C792EA',
  error: '#FF5F56',
  correct: '#33D087',
  warning: '#FFB347',
  info: '#4DB9FF',
  onPrimary: '#1F1A00',
  onSecondary: '#041018',
  onAccent: '#1B0F23',
  onError: '#FFFFFF',
  onCorrect: '#062015',
  shadow: '#000000',
  focus: '#F9E547',
  outline: '#59B3FF',
  backdrop: '#0E131A',
};

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  colors: colorsDark,
  resolvedTheme: 'dark',
});

export function ThemeProvider({ children, defaultTheme = 'system' }) {
  const [theme, setThemeState] = useState(defaultTheme);
  const [systemScheme, setSystemScheme] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Load stored preference
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      setThemeState(storedTheme);
    }
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemScheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {}
  }, []);

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') return systemScheme ?? 'light';
    return theme;
  }, [theme, systemScheme]);

  const colors = useMemo(() => {
    return resolvedTheme === 'light' ? colorsLight : colorsDark;
  }, [resolvedTheme]);

  // Apply theme class to body for background color
  useEffect(() => {
    document.body.className = `theme-${resolvedTheme}`;
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, colors, resolvedTheme }),
    [theme, setTheme, colors, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

export default ThemeProvider;
