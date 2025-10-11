import pt from '../language/pt.json';
import en from '../language/en.json';

const dictionaries = { pt, en };

let current = 'pt';

export function setLanguage(lang) {
  if (dictionaries[lang]) current = lang;
}

export function t(key, vars) {
  const dict = dictionaries[current] || {};
  const parts = key.split('.');
  let value = parts.reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), dict);
  if (typeof value !== 'string') return key;
  if (vars) {
    Object.keys(vars).forEach(k => {
      value = value.replace(new RegExp(`{${k}}`, 'g'), String(vars[k]));
    });
  }
  return value;
}
