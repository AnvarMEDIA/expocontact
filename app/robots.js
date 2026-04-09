/**
 * robots.txt — Next.js 14 App Router robots.js convention
 */
export default function robots() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  ['/admin', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
