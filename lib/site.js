/**
 * The site's public address — the one host every canonical URL, hreflang,
 * sitemap entry and structured-data @id uses.
 *
 * It is www.expocontact.uz because that is where the site is served: Vercel
 * redirects the bare domain to it. Canonicals pointing at the bare domain sent
 * search engines to a URL that answers with a redirect, which they treat as a
 * conflicting signal. NEXT_PUBLIC_SITE_URL overrides it (no trailing slash).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.expocontact.uz').replace(/\/+$/, '');
