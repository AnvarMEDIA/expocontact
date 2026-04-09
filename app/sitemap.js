/**
 * Dynamic sitemap — Next.js 14 App Router sitemap.js convention
 * Accessible at /sitemap.xml
 */
export default function sitemap() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  const locales = ['ru', 'en', 'uz'];
  const now = new Date();

  return locales.map((locale) => ({
    url:          `${BASE}/${locale}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: locale === 'ru' ? 1.0 : 0.8,
  }));
}
