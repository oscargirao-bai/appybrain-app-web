import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorsDark, colorsLight, getColorsForTheme } from '../constants/color';

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
