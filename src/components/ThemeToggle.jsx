import React from 'react';
import { useTheme } from '@/shared/theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="site-chrome__theme-toggle"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      <span className="site-chrome__theme-toggle-track" aria-hidden="true">
        <span className="site-chrome__theme-toggle-icon site-chrome__theme-toggle-icon--sun">
          ☀
        </span>
        <span className="site-chrome__theme-toggle-icon site-chrome__theme-toggle-icon--moon">
          ☾
        </span>
        <span className="site-chrome__theme-toggle-thumb" />
      </span>
    </button>
  );
}
