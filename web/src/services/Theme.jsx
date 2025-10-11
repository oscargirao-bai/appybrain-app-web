import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'appybrain.theme';

// Light theme colors
const colorsLight = {
  background: '#f5f5f7',
  card: '#ffffff',
  surface: '#f0f0f2',
  text: '#1d1d1f',
  muted: '#86868b',
  primary: '#ff6b7f',
  secondary: '#ffc700',
  onPrimary: '#ffffff',
  onSecondary: '#1d1d1f',
  error: '#ff4d50',
  backdrop: '#000000',
};

// Dark theme colors
const colorsDark = {
  background: '#000000',
  card: '#1c1c1e',
  surface: '#2c2c2e',
  text: '#f5f5f7',
  muted: '#86868b',
  primary: '#ff6b7f',
  secondary: '#ffc700',
  onPrimary: '#ffffff',
  onSecondary: '#1d1d1f',
  error: '#ff4d50',
  backdrop: '#000000',
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
