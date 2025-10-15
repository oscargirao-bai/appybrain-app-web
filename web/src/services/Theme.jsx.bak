import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
// Web localStorage wrapper
const AsyncStorage = {
	async getItem(key) { return localStorage.getItem(key); },
	async setItem(key, value) { localStorage.setItem(key, value); }
};
// Web Appearance wrapper
const Appearance = {
	getColorScheme: () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
	addChangeListener: (callback) => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handler = (e) => callback({ colorScheme: e.matches ? 'dark' : 'light' });
		mediaQuery.addEventListener('change', handler);
		return { remove: () => mediaQuery.removeEventListener('change', handler) };
	}
};
import { colorsDark, colorsLight, getColorsForTheme } from '../constants/color.jsx';

// Types: theme can be 'light' | 'dark' | 'system'
const THEME_STORAGE_KEY = 'laddermath.theme';
const GENDER_SWAP_KEY = 'laddermath.gender.swap';

const ThemeContext = createContext({
	theme: /** @type {'light'|'dark'|'system'} */ ('dark'),
	setTheme: /** @type {(t:'light'|'dark'|'system') => void} */ (() => {}),
	colors: colorsDark,
	swapGenderColors: false,
	setSwapGenderColors: /** @type {(b:boolean)=>void} */ (() => {}),
});

export function ThemeProvider({ children, defaultTheme = 'system' }) {
	const [theme, setThemeState] = useState(/** @type {'light'|'dark'|'system'} */ (defaultTheme));
	const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());
	const [swapGenderColors, setSwapGenderColors] = useState(false);

	// Load stored preference + gender swap flag
	useEffect(() => {
		(async () => {
			try {
				const [storedTheme, storedSwap] = await Promise.all([
					AsyncStorage.getItem(THEME_STORAGE_KEY),
					AsyncStorage.getItem(GENDER_SWAP_KEY),
				]);
				if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
					setThemeState(storedTheme);
				}
				if (storedSwap === '1') setSwapGenderColors(true);
			} catch {}
		})();
	}, []);

	// Listen to system theme changes when in 'system' mode
	useEffect(() => {
		const sub = Appearance.addChangeListener(({ colorScheme }) => {
			setSystemScheme(colorScheme);
		});
		return () => sub.remove();
	}, []);

	const setTheme = useCallback(async (t) => {
		setThemeState(t);
		try {
			await AsyncStorage.setItem(THEME_STORAGE_KEY, t);
		} catch {}
	}, []);

	const setSwapGenderColorsPersist = useCallback(async (b) => {
		setSwapGenderColors(b);
		try { await AsyncStorage.setItem(GENDER_SWAP_KEY, b ? '1' : '0'); } catch {}
	}, []);

	const resolvedTheme = useMemo(() => {
		if (theme === 'system') return (systemScheme ?? 'light');
		return theme;
	}, [theme, systemScheme]);

	const colors = useMemo(() => {
		const base = resolvedTheme === 'light' ? colorsLight : colorsDark;
		if (!swapGenderColors) return base;
		return { ...base, primary: base.secondary, secondary: base.primary };
	}, [resolvedTheme, swapGenderColors]);

	// Keep page background (outside the app container) in sync with theme
	useEffect(() => {
		try {
			const bg = resolvedTheme === 'dark' ? '#000000' : '#FFFFFF';
			if (typeof document !== 'undefined') {
				document.body.style.backgroundColor = bg;
				// Also set html element to avoid white gaps in some browsers
				document.documentElement.style.backgroundColor = bg;
			}
		} catch {}
	}, [resolvedTheme]);

	const value = useMemo(
		() => ({ theme, setTheme, colors, resolvedTheme, swapGenderColors, setSwapGenderColors: setSwapGenderColorsPersist }),
		[theme, setTheme, colors, resolvedTheme, swapGenderColors, setSwapGenderColorsPersist]
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

// Small helper for non-hook modules
export const getThemeColors = (t /* 'light'|'dark' */) => getColorsForTheme(t);

export default ThemeProvider;
