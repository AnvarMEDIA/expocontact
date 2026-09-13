/**
 * Dynamic sitemap — Next.js 14 App Router sitemap.js convention
 * Accessible at /sitemap.xml
 *
 * Every indexable page, once per locale, each carrying hreflang alternates so
 * search engines treat /ru, /en and /uz as translations of one page rather
 * than duplicates. The draft landing at /[locale]/new is noindex and is
 * deliberately absent.
 */
const LOCALES = ['ru', 'en', 'uz'];

const PAGES = [
  { path: '',     changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.8 },
];

export default function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  const lastModified = new Date();

  return PAGES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE}/${l}${path}`]),
    );
    languages['x-default'] = `${BASE}/ru${path}`;

    return LOCALES.map((locale) => ({
      url:             `${BASE}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority:        locale === 'ru' ? priority : Math.max(0.5, priority - 0.2),
      alternates:      { languages },
    }));
  });
}
