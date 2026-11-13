/**
 * Light and dark themes of the main site.
 *
 * Dark is the original design and stays the default. A visitor opts into the
 * light theme with the switch in the header (ThemeToggle) and the choice is
 * kept in localStorage. It is applied by THEME_SCRIPT, inline at the top of
 * <head>, before the first paint: from an effect, every light-theme visitor
 * would first see the dark page flash.
 *
 * The theme is one attribute, html[data-theme="light"]; app/landing.css holds
 * the palettes. Nothing here re-renders React: the switch writes the
 * attribute, and CSS decides which icon and which label are visible, so the
 * server and the first client render are always the same.
 */

export const THEME_KEY = 'expo-theme';

/**
 * Before first paint: restore the saved choice, and follow a change made in
 * another tab of the site.
 */
export const THEME_SCRIPT = `(function(d,k){var r=d.documentElement;
function a(t){if(t==='light')r.setAttribute('data-theme','light');else r.removeAttribute('data-theme')}
try{a(localStorage.getItem(k))}catch(e){}
addEventListener('storage',function(e){if(e.key===k)a(e.newValue)})})(document,'${THEME_KEY}');`;

/** Flip the theme, remember it, and cross-fade where the browser can. */
export function toggleTheme() {
  const root = document.documentElement;
  const light = root.getAttribute('data-theme') !== 'light';
  const apply = () => {
    if (light) root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  };
  try { localStorage.setItem(THEME_KEY, light ? 'light' : 'dark'); } catch { /* private mode */ }
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !still) document.startViewTransition(apply);
  else apply();
}

/** The switch's wording: `toX` is the action, read out by screen readers. */
const LABELS = {
  ru: { light: 'Светлая тема', dark: 'Тёмная тема', toLight: 'Включить светлую тему', toDark: 'Включить тёмную тему' },
  en: { light: 'Light theme', dark: 'Dark theme', toLight: 'Switch to the light theme', toDark: 'Switch to the dark theme' },
  uz: { light: 'Yorugʻ mavzu', dark: 'Qorongʻi mavzu', toLight: 'Yorugʻ mavzuni yoqish', toDark: 'Qorongʻi mavzuni yoqish' },
};

export function themeLabels(locale) {
  return LABELS[locale] || LABELS.ru;
}
