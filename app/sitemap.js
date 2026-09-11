/**
 * Dynamic sitemap — Next.js 14 App Router sitemap.js convention
 * Accessible at /sitemap.xml
 *
 * One entry per locale, each carrying hreflang alternates so search engines
 * treat /ru, /en and /uz as translations of one page rather than duplicates.
 */
const LOCALES = ['ru', 'en', 'uz'];

export default function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  const lastModified = new Date();

  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${BASE}/${l}`]));
  languages['x-default'] = `${BASE}/ru`;

  return LOCALES.map((locale) => ({
    url:             `${BASE}/${locale}`,
    lastModified,
    changeFrequency: 'weekly',
    priority:        locale === 'ru' ? 1.0 : 0.8,
    alternates:      { languages },
  }));
}
