/**
 * Dynamic sitemap — Next.js 14 App Router sitemap.js convention
 * Accessible at /sitemap.xml
 *
 * Every indexable page, once per locale, each carrying hreflang alternates so
 * search engines treat /ru, /en and /uz as translations of one page rather
 * than duplicates. The draft landing at /[locale]/new is noindex and is
 * deliberately absent. The /offer landing is listed with its own five languages.
 */
const LOCALES = ['ru', 'en', 'uz'];

const PAGES = [
  { path: '',     changeFrequency: 'weekly',  priority: 1.0 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.8 },
];

// The /offer landing for foreign organisers has five languages of its own and
// English as the default, so it is listed separately from the pages above.
const OFFER_LANGS = { ru: 'ru', en: 'en', tr: 'tr', zh: 'zh-Hans', uz: 'uz' };

function offerEntries(BASE, lastModified) {
  const languages = Object.fromEntries(
    Object.entries(OFFER_LANGS).map(([lang, hreflang]) => [hreflang, `${BASE}/offer/${lang}`]),
  );
  languages['x-default'] = `${BASE}/offer/en`;

  return Object.keys(OFFER_LANGS).map((lang) => ({
    url:             `${BASE}/offer/${lang}`,
    lastModified,
    changeFrequency: 'monthly',
    priority:        lang === 'en' ? 0.9 : 0.7,
    alternates:      { languages },
  }));
}

export default function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  const lastModified = new Date();

  const site = PAGES.flatMap(({ path, changeFrequency, priority }) => {
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

  return [...site, ...offerEntries(BASE, lastModified)];
}
