import React, { createContext, useContext, useState, useEffect } from 'react';
// Web localStorage wrapper
const AsyncStorage = {
	async getItem(key) { return localStorage.getItem(key); },
	async setItem(key, value) { localStorage.setItem(key, value); }
};
import en from '../language/en.json';
import pt from '../language/pt.json';

// Base resolver used by translate()
export function getTranslation(key, translationObj) {
	const keys = key.split('.');
	let translation = translationObj;
	for (const k of keys) {
		if (translation && Object.prototype.hasOwnProperty.call(translation, k)) {
			translation = translation[k];
		} else {
			return null;
		}
	}
	return typeof translation === 'string' ? translation : null;
}

// i18n context + hook consolidated here
export const TranslationContext = createContext();
const translations = { en, pt };

export function TranslationProvider({ children }) {
	// Fixed to Portuguese for now
	const currentLanguage = 'pt';

	// Placeholder function - language is always Portuguese
	async function changeLanguage(languageCode) {
		// No-op: language is fixed to Portuguese
	}

	function translate(key, variables = {}) {
		const vars = variables && typeof variables === 'object' ? variables : {};
		const resolved =
			getTranslation(key, translations['pt']) ||
			getTranslation(key, translations['en']) ||
			key;
		const str = typeof resolved === 'string' ? resolved : String(resolved);
		return str.replace(/\{\$(\w+)\}/g, (_, v) => (v in vars ? String(vars[v]) : `{${'$'}${v}}`));
	}

	return (
		<TranslationContext.Provider
			value={{ currentLanguage, changeLanguage, translate, availableLanguages: Object.keys(translations) }}
		>
			{children}
		</TranslationContext.Provider>
	);
}

export function useTranslate() {
	const context = useContext(TranslationContext);
	if (!context) {
		throw new Error('useTranslate must be used within a TranslationProvider');
	}
	return context;
}

export default getTranslation;