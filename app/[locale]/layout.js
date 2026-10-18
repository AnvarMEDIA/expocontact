import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Analytics } from '@vercel/analytics/next';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MetaPixel from '@/components/MetaPixel';
import { META_PIXEL_ID, META_PIXEL_SNIPPET } from '@/lib/metaPixel';
import '@/app/globals.css';
import { readObject } from '@/lib/store';
import { SITE_URL } from '@/lib/site';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

// The landing's three families (app/landing.css: --f-body, --f-display,
// --f-mono), self-hosted by next/font. All three are variable fonts, so one
// file per subset carries every weight. They used to come from two
// render-blocking Google Fonts stylesheets — one here (Montserrat, which no
// public page uses, plus Inter) and one inside the home page (Inter again,
// Space Grotesk, JetBrains Mono): about a second of blocked first paint.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--nf-inter',
});
// No Cyrillic in Space Grotesk: Russian headings fall through to Inter, as
// they always did. Without adjustFontFallback: false next/font would put a
// metric-matched Arial right after it, and Cyrillic would land on Arial.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--nf-space-grotesk',
});
// Small mono labels only: not worth a preload.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false,
  variable: '--nf-jetbrains-mono',
});

// SEO comes from the persistent store, which falls back to the content files
// bundled with the deployment. It must never be read with fs at request time:
// on Vercel those files are not in the serverless bundle, the read fails and
// every SEO setting silently disappears.
export const revalidate = 60;

const LOGO_URL =
  'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

// Fallback social preview: a compressed 1200x630 JPEG on Blob (~100 KB). Link
// scrapers fetch this directly, without the image optimizer, and several of them
// skip images over a few megabytes — so keep whatever replaces it small too.
const OG_IMAGE =
  'https://kha2ts7q3gkfbsis.public.blob.vercel-storage.com/img/og-image.jpg';

// ── Defaults (used when content/data/seo.{locale}.json is missing fields) ───
// Titles stay within ~60 characters and descriptions within 160, keyword first:
// longer ones were cut off in search results, brand and all.
const META = {
  ru: {
    title:       'Выставочные стенды под ключ в Ташкенте | ExpoContact',
    description: 'Застройщик выставочных стендов в Ташкенте с 2004 года: дизайн и 3D, своё производство, монтаж, брендинг и логистика по Узбекистану и Центральной Азии.',
    locale:      'ru_RU',
    ldDescription: 'Проектирование и строительство выставочных стендов',
    ldStreet:    'ул. Амира Темура, 107Б',
    ldCity:      'Ташкент',
  },
  en: {
    title:       'Exhibition Stands in Tashkent, Uzbekistan | ExpoContact',
    description: 'Exhibition stand builder in Tashkent since 2004: 3D design, in-house production, installation, branding and logistics across Central Asia and abroad.',
    locale:      'en_US',
    ldDescription: 'Design and construction of exhibition stands',
    ldStreet:    '107B Amir Temur Street',
    ldCity:      'Tashkent',
  },
  uz: {
    title:       'Toshkentda ko\'rgazma stendlari qurish | ExpoContact',
    description: 'Toshkentda 2004 yildan beri ko\'rgazma stendlari: 3D dizayn, o\'z ishlab chiqarishimiz, montaj, brending va Markaziy Osiyo bo\'ylab logistika.',
    locale:      'uz_UZ',
    ldDescription: 'Ko\'rgazma stendlarini loyihalash va qurish',
    ldStreet:    'Amir Temur ko\'chasi, 107B',
    ldCity:      'Toshkent',
  },
};

function readSeo(locale) {
  return readObject(`seo.${locale}`);
}

// "a, b, c" → ["a", "b", "c"]; arrays pass through.
function toKeywordList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return undefined;
  const list = value.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

// Site-wide structured data: the company with its service catalogue, and the
// website. It is the same on every page of this layout, so it holds only what
// is true of every page. What a single page is — the home page, the FAQ — is
// described by that page (app/[locale]/page.js, faq/page.js): a WebPage and an
// FAQPage here used to repeat on /faq, /lp and /new, and claimed the home URL
// for all of them.
function buildJsonLd({ meta, seo, messages }) {
  const orgId  = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;

  const services = (messages?.services?.items || []).map((s) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type':     'Service',
      name:        s.title,
      description: s.short || s.full || undefined,
      provider:    { '@id': orgId },
      areaServed:  ['Uzbekistan', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Central Asia'],
    },
  }));

  const graph = [
    {
      '@type': ['Organization', 'LocalBusiness'],
      '@id':   orgId,
      name:    'ExpoContact',
      alternateName: ['Экспоконтакт', 'ExpoContact Tashkent', 'ExpoContact Uzbekistan'],
      description: seo.description || meta.description,
      url:     SITE_URL,
      logo:    LOGO_URL,
      image:   seo.ogImage || OG_IMAGE,
      telephone: '+998977111711',
      email:   'info@expocontact.uz',
      foundingDate: '2004',
      address: {
        '@type':         'PostalAddress',
        streetAddress:   meta.ldStreet,
        addressLocality: meta.ldCity,
        addressCountry:  'UZ',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 41.2995, longitude: 69.2401 },
      openingHoursSpecification: {
        '@type':   'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens:     '09:00',
        closes:    '19:00',
      },
      areaServed: [
        { '@type': 'Country', name: 'Uzbekistan' },
        { '@type': 'Country', name: 'Kazakhstan' },
        { '@type': 'Country', name: 'Kyrgyzstan' },
        { '@type': 'Country', name: 'Tajikistan' },
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'Germany' },
        { '@type': 'Country', name: 'Russia' },
      ],
      knowsAbout: [
        'exhibition stand design', 'exhibition stand construction', 'trade show booths',
        'modular exhibition systems', 'Octanorm', 'Maxima', 'double-deck stands',
        'national pavilions', 'congress and conference branding', 'exhibition logistics',
        'UzExpoCentre', 'UzBuild', 'UzAutoShow', 'AgroExpo Central Asia', 'TashkentMed',
      ],
      hasOfferCatalog: services.length
        ? { '@type': 'OfferCatalog', name: messages?.services?.title || 'Services', itemListElement: services }
        : undefined,
      contactPoint: {
        '@type':           'ContactPoint',
        telephone:         '+998977111711',
        email:             'info@expocontact.uz',
        contactType:       'sales',
        availableLanguage: ['ru', 'en', 'uz'],
      },
      sameAs: ['https://instagram.com/expo.contact', 'https://t.me/expocontact'],
    },
    {
      '@type':     'WebSite',
      '@id':       siteId,
      url:         SITE_URL,
      name:        'ExpoContact',
      inLanguage:  ['ru', 'en', 'uz'],
      publisher:   { '@id': orgId },
    },
  ];

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    // Keep a stray "</script>" inside content from closing the tag early.
    .replace(/</g, '\\u003c');
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  // An unknown first segment ("/llms-full.txt" before it had a route) renders
  // the 404 page through this layout; it must not inherit a canonical, a
  // title or hreflang that claim it is the home page.
  if (!routing.locales.includes(locale)) return { robots: { index: false, follow: false } };
  const meta = META[locale] || META.ru;
  const seo  = await readSeo(locale);

  const title       = seo.title       || meta.title;
  const description = seo.description || meta.description;
  const ogImage     = seo.ogImage     || OG_IMAGE;
  const ogImageAlt  = seo.ogImageAlt  || 'ExpoContact';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default:  title,
      template: `%s | ExpoContact`,
    },
    description,
    keywords: toKeywordList(seo.keywords),
    openGraph: {
      title,
      description,
      url:         `/${locale}`,
      siteName:    'ExpoContact',
      locale:      meta.locale,
      alternateLocale: ['ru_RU', 'en_US', 'uz_UZ'].filter((l) => l !== meta.locale),
      type:        'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [ogImage],
    },
    robots: {
      index:  seo.robotsIndex  !== false,
      follow: seo.robotsFollow !== false,
    },
    // Search-console ownership tags. They must stay in place after the first
    // successful check: the consoles re-verify, and removing one drops the site.
    verification: {
      yandex: '714b82733747b78a',
      // Bing Webmaster Tools has no named field in Next.js, so it goes through
      // `other` and renders <meta name="msvalidate.01" content="…">.
      other: { 'msvalidate.01': '67159B4339466FBE68D55F6898C22872' },
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ru':        '/ru',
        'en':        '/en',
        'uz':        '/uz',
        'x-default': '/ru',
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const meta = META[locale] || META.ru;
  const messages = await getMessages();
  const jsonLd = buildJsonLd({ meta, seo: await readSeo(locale), messages });

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>

        {/* Meta Pixel — ExpoContact Pixel. Not on /admin: that has its own
            layout, and there is nothing to measure behind the password. */}
        <script dangerouslySetInnerHTML={{ __html: META_PIXEL_SNIPPET }} />

        {/* JSON-LD: the company, its service catalogue and the website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: 'none' }} alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <AnalyticsTracker locale={locale} />
        <MetaPixel />
      </body>
    </html>
  );
}
