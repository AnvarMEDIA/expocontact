import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Analytics } from '@vercel/analytics/next';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import '@/app/globals.css';

// SEO settings are imported statically, like the rest of content/data. The
// previous fs.readFile at request time silently returned {} on Vercel, where
// these files are not part of the serverless bundle, so nothing edited in the
// admin SEO panel ever reached production.
import seoRu from '@/content/data/seo.ru.json';
import seoEn from '@/content/data/seo.en.json';
import seoUz from '@/content/data/seo.uz.json';

const SEO = { ru: seoRu, en: seoEn, uz: seoUz };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz';
const LOGO_URL =
  'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

// Fallback social preview: a compressed 1200x630 JPEG on Blob (~100 KB). Link
// scrapers fetch this directly, without the image optimizer, and several of them
// skip images over a few megabytes — so keep whatever replaces it small too.
const OG_IMAGE =
  'https://kha2ts7q3gkfbsis.public.blob.vercel-storage.com/img/og-image.jpg';

// ── Defaults (used when content/data/seo.{locale}.json is missing fields) ───
const META = {
  ru: {
    title:       'ExpoContact — Выставочные стенды в Узбекистане и Центральной Азии',
    description: 'Проектирование и строительство выставочных стендов под ключ. 20 лет опыта, 5000+ проектов. Монтаж, брендинг, логистика.',
    locale:      'ru_RU',
    ldDescription: 'Проектирование и строительство выставочных стендов',
    ldStreet:    'ул. Амира Темура, 107Б',
    ldCity:      'Ташкент',
  },
  en: {
    title:       'ExpoContact — Exhibition Stands in Uzbekistan & Central Asia',
    description: 'Design and construction of exhibition stands turnkey. 20 years of experience, 5000+ projects. Installation, branding, logistics.',
    locale:      'en_US',
    ldDescription: 'Design and construction of exhibition stands',
    ldStreet:    '107B Amir Temur Street',
    ldCity:      'Tashkent',
  },
  uz: {
    title:       'ExpoContact — O\'zbekistonda Ko\'rgazma Stendlari',
    description: 'Ko\'rgazma stendlarini loyihalash va qurish. 20 yillik tajriba, 5000+ loyiha. Montaj, brending, logistika.',
    locale:      'uz_UZ',
    ldDescription: 'Ko\'rgazma stendlarini loyihalash va qurish',
    ldStreet:    'Amir Temur ko\'chasi, 107B',
    ldCity:      'Toshkent',
  },
};

function readSeo(locale) {
  return SEO[locale] || SEO.ru || {};
}

// "a, b, c" → ["a", "b", "c"]; arrays pass through.
function toKeywordList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return undefined;
  const list = value.split(',').map((s) => s.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

// Structured data as one @graph so the Organization, its offer catalogue and
// the FAQ are linked entities. Search engines use this for rich results;
// AI assistants use it as a clean, unambiguous source of facts about who we
// are, what we do and where.
function buildJsonLd({ locale, meta, seo, messages }) {
  const orgId  = `${SITE_URL}/#organization`;
  const siteId = `${SITE_URL}/#website`;
  const pageUrl = `${SITE_URL}/${locale}`;

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

  const faq = (messages?.faq?.items || []).map((f) => ({
    '@type': 'Question',
    name:    f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
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
      email:   'hello@expocontact.uz',
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
        email:             'hello@expocontact.uz',
        contactType:       'sales',
        availableLanguage: ['ru', 'en', 'uz'],
      },
      sameAs: ['https://instagram.com/expocontact', 'https://t.me/expocontact'],
    },
    {
      '@type':     'WebSite',
      '@id':       siteId,
      url:         SITE_URL,
      name:        'ExpoContact',
      inLanguage:  ['ru', 'en', 'uz'],
      publisher:   { '@id': orgId },
    },
    {
      '@type':     'WebPage',
      '@id':       `${pageUrl}#webpage`,
      url:         pageUrl,
      name:        seo.title || meta.title,
      description: seo.description || meta.description,
      inLanguage:  locale,
      isPartOf:    { '@id': siteId },
      about:       { '@id': orgId },
    },
  ];

  if (faq.length) {
    graph.push({ '@type': 'FAQPage', '@id': `${pageUrl}#faq`, mainEntity: faq });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    // Keep a stray "</script>" inside content from closing the tag early.
    .replace(/</g, '\\u003c');
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = META[locale] || META.ru;
  const seo  = readSeo(locale);

  const title       = seo.title       || meta.title;
  const description = seo.description || meta.description;
  const ogImage     = seo.ogImage     || OG_IMAGE;
  const ogImageAlt  = seo.ogImageAlt  || 'ExpoContact';

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz',
    ),
    title: {
      default:  title,
      template: `%s | ExpoContact`,
    },
    description,
    keywords: toKeywordList(seo.keywords),
    openGraph: {
      title,
      description,
      url:         '/',
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
    verification: {
      yandex: '714b82733747b78a',
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
  const jsonLd = buildJsonLd({ locale, meta, seo: readSeo(locale), messages });

  return (
    <html lang={locale}>
      <head>
        {/* Google Fonts — loaded via <link> for env-agnostic builds */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Yandex.Metrika */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=108497871','ym');ym(108497871,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`,
          }}
        />

        {/* JSON-LD: Organization, service catalogue and FAQ as one linked graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </head>
      <body>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://mc.yandex.ru/watch/108497871" style={{ position: 'absolute', left: '-9999px' }} alt="" />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
