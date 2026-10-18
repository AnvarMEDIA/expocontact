/**
 * Server Component — entry point for each locale (/ru, /en, /uz).
 *
 * Content comes from the persistent store rather than a static import, so an
 * edit made in /admin shows up without a redeploy. The page stays cached and
 * is regenerated on a timer (see `revalidate` below) or immediately when the
 * admin API revalidates it after a save.
 */
import HomePageClient from '@/components/HomePageClient';
import { readList, readObject } from '@/lib/store';
import { SITE_URL } from '@/lib/site';

export const revalidate = 60;

export default async function Page({ params }) {
  const { locale } = await params;
  const lc = ['ru', 'en', 'uz'].includes(locale) ? locale : 'ru';

  const [projects, settings, clients, seo] = await Promise.all([
    readList(`portfolio.${lc}`),
    readObject(`settings.${lc}`),
    readList('clients'),
    readObject(`seo.${lc}`),
  ]);

  // This page as a WebPage of the site whose company the layout describes.
  // The FAQ is marked up once, on /[locale]/faq where every answer is open —
  // Google asks for a single instance of repeated FAQ content.
  const pageUrl = `${SITE_URL}/${lc}`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type':    'WebPage',
    '@id':      `${pageUrl}#webpage`,
    url:        pageUrl,
    name:       seo.title || 'ExpoContact',
    description: seo.description || undefined,
    inLanguage: lc,
    isPartOf:   { '@id': `${SITE_URL}/#website` },
    about:      { '@id': `${SITE_URL}/#organization` },
    primaryImageOfPage: seo.ogImage ? { '@type': 'ImageObject', url: seo.ogImage } : undefined,
  }).replace(/</g, '\\u003c');

  return (
    <>
      {/* The landing's dark palette and type live on body.landing-body. Set
          here, while the HTML is parsed, the first paint already has them;
          added from an effect, it restyled and relaid the whole page during
          hydration (~60 ms of main thread on a phone). HomePageClient still
          adds it on client-side navigation and removes it on the way out.
          A URL with a #hash turns off the deferred rendering of the lower
          blocks, so the browser scrolls to the anchor on real sizes (see
          the content-visibility note in landing.css). */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.body.classList.add('landing-body');if(location.hash.length>1)document.documentElement.classList.add('cv-off')",
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <HomePageClient
        locale={lc}
        projects={projects}
        clients={clients}
        settings={settings}
      />
    </>
  );
}
