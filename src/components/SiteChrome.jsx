import React from 'react';
import ThemeToggle from '@/components/ThemeToggle';

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
      <div className="site-chrome__controls">
        <ThemeToggle />
      </div>
    </header>
  );
}
