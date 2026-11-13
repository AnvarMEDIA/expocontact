'use client';

/**
 * The light / dark switch (lib/theme.js).
 *
 * Holds no state: both faces are rendered and app/landing.css shows the one
 * that matches html[data-theme], so the markup never depends on what the
 * browser has stored and hydration cannot disagree with the server. The face
 * that is hidden is display:none, which also takes its label out of the
 * accessibility tree — the button is always named by the action it performs.
 *
 *   variant="icon"  round button for the header, label for screen readers only
 *   variant="text"  icon plus the name of the theme it switches to (footer)
 */
import { toggleTheme, themeLabels } from '@/lib/theme';

const Sun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M5.3 18.7l1.55-1.55M17.15 6.85l1.55-1.55" />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
    <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />
  </svg>
);

export default function ThemeToggle({ locale, variant = 'icon', className = '' }) {
  const t = themeLabels(locale);
  const text = variant === 'text';
  return (
    <button type="button" className={`theme-toggle theme-toggle--${variant} ${className}`} onClick={toggleTheme} data-hover>
      {/* In the dark theme the switch offers the light one, and back. */}
      <span className="theme-toggle__face theme-toggle__face--dark">
        <Sun />
        <span className={text ? undefined : 'theme-toggle__sr'}>{text ? t.light : t.toLight}</span>
      </span>
      <span className="theme-toggle__face theme-toggle__face--light">
        <Moon />
        <span className={text ? undefined : 'theme-toggle__sr'}>{text ? t.dark : t.toDark}</span>
      </span>
    </button>
  );
}
