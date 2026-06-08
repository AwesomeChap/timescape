import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, LANGUAGE_BY_CODE, DEFAULT_LANGUAGE } from '@/i18n/languages';

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const current = LANGUAGE_BY_CODE[i18n.language] || LANGUAGE_BY_CODE[DEFAULT_LANGUAGE];

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function selectLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className="language-selector" ref={rootRef}>
      <button
        type="button"
        className="language-selector__toggle"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('ui.language')}
        title={t('ui.language')}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={`fi fi-${current.country} language-selector__flag`} aria-hidden="true" />
        <span className="language-selector__code">{current.code.toUpperCase()}</span>
      </button>

      {open ? (
        <ul className="language-selector__menu" role="listbox" aria-label={t('ui.language')}>
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === current.code;
            return (
              <li key={lang.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={[
                    'language-selector__option',
                    isActive && 'language-selector__option--active',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectLanguage(lang.code)}
                >
                  <span className={`fi fi-${lang.country} language-selector__flag`} aria-hidden="true" />
                  <span className="language-selector__name">{lang.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
