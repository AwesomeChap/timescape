import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, DEFAULT_LANGUAGE, LANGUAGE_BY_CODE } from './languages';

import en from './locales/en.json';
import de from './locales/de.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import cs from './locales/cs.json';
import sv from './locales/sv.json';
import hu from './locales/hu.json';
import el from './locales/el.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

const resources = {
  en: { translation: en },
  de: { translation: de },
  es: { translation: es },
  fr: { translation: fr },
  it: { translation: it },
  pt: { translation: pt },
  nl: { translation: nl },
  pl: { translation: pl },
  cs: { translation: cs },
  sv: { translation: sv },
  hu: { translation: hu },
  el: { translation: el },
  tr: { translation: tr },
  ru: { translation: ru },
  uk: { translation: uk },
  hi: { translation: hi },
  ar: { translation: ar },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
};

const STORAGE_KEY = 'timescape-lang';
const SUPPORTED = LANGUAGES.map((l) => l.code);

function resolveInitialLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (err) {
    /* localStorage unavailable */
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language ? navigator.language : '')
    .slice(0, 2)
    .toLowerCase();
  return SUPPORTED.includes(nav) ? nav : DEFAULT_LANGUAGE;
}

function applyDocumentLanguage(code) {
  if (typeof document === 'undefined') return;
  const lang = LANGUAGE_BY_CODE[code] || LANGUAGE_BY_CODE[DEFAULT_LANGUAGE];
  document.documentElement.setAttribute('lang', code);
  document.documentElement.setAttribute('dir', lang?.dir || 'ltr');
}

const initialLanguage = resolveInitialLanguage();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

applyDocumentLanguage(initialLanguage);

i18n.on('languageChanged', (code) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
  } catch (err) {
    /* ignore */
  }
  applyDocumentLanguage(code);
});

export default i18n;
