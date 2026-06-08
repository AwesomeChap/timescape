import React from 'react';
import LanguageSelector from '@/components/LanguageSelector';

export default function SiteChrome() {
  return (
    <header className="site-chrome" aria-label="Site">
      <a
        className="site-chrome__logo"
        href="https://jatinkumar.tech"
        title="Jatin Kumar"
      >
        <img
          className="site-chrome__logo-img"
          src={`${import.meta.env.BASE_URL}logo_minimalist.svg`}
          alt="Jatin Kumar"
        />
      </a>
      <LanguageSelector />
    </header>
  );
}
