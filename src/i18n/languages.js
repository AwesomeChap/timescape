/**
 * Supported UI languages. `country` is the ISO-3166 code used by the flag-icons
 * CSS package (`fi fi-<country>`); `dir` is 'rtl' only where needed.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', country: 'gb', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', country: 'de', dir: 'ltr' },
  { code: 'es', name: 'Español', country: 'es', dir: 'ltr' },
  { code: 'fr', name: 'Français', country: 'fr', dir: 'ltr' },
  { code: 'it', name: 'Italiano', country: 'it', dir: 'ltr' },
  { code: 'pt', name: 'Português', country: 'pt', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', country: 'nl', dir: 'ltr' },
  { code: 'pl', name: 'Polski', country: 'pl', dir: 'ltr' },
  { code: 'cs', name: 'Čeština', country: 'cz', dir: 'ltr' },
  { code: 'sv', name: 'Svenska', country: 'se', dir: 'ltr' },
  { code: 'hu', name: 'Magyar', country: 'hu', dir: 'ltr' },
  { code: 'el', name: 'Ελληνικά', country: 'gr', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', country: 'tr', dir: 'ltr' },
  { code: 'ru', name: 'Русский', country: 'ru', dir: 'ltr' },
  { code: 'uk', name: 'Українська', country: 'ua', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', country: 'in', dir: 'ltr' },
  { code: 'ar', name: 'العربية', country: 'sa', dir: 'rtl' },
  { code: 'zh', name: '中文', country: 'cn', dir: 'ltr' },
  { code: 'ja', name: '日本語', country: 'jp', dir: 'ltr' },
  { code: 'ko', name: '한국어', country: 'kr', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE = 'en';

export const LANGUAGE_BY_CODE = LANGUAGES.reduce((acc, lang) => {
  acc[lang.code] = lang;
  return acc;
}, {});
