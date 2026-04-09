import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';

// ── SEO metadata per locale ──────────────────────────────────────────────────
const META = {
  ru: {
    title:       'ExpoContact — Выставочные стенды в Узбекистане и Центральной Азии',
    description: 'Проектирование и строительство выставочных стендов под ключ. 20 лет опыта, 5000+ проектов. Монтаж, брендинг, логистика.',
    locale:      'ru_RU',
  },
  en: {
    title:       'ExpoContact — Exhibition Stands in Uzbekistan & Central Asia',
    description: 'Design and construction of exhibition stands turnkey. 20 years of experience, 5000+ projects. Installation, branding, logistics.',
    locale:      'en_US',
  },
  uz: {
    title:       'ExpoContact — O\'zbekistonda Ko\'rgazma Stendlari',
    description: 'Ko\'rgazma stendlarini loyihalash va qurish. 20 yillik tajriba, 5000+ loyiha. Montaj, brending, logistika.',
    locale:      'uz_UZ',
  },
};

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = META[locale] || META.ru;

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || 'https://expocontact.uz',
    ),
    title: {
      default:  meta.title,
      template: `%s | ExpoContact`,
    },
    description: meta.description,
    openGraph: {
      title:       meta.title,
      description: meta.description,
      url:         '/',
      siteName:    'ExpoContact',
      locale:      meta.locale,
      type:        'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'ExpoContact' }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       meta.title,
      description: meta.description,
      images:      ['/og-image.jpg'],
    },
    robots: {
      index:  true,
      follow: true,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ru': '/ru',
        'en': '/en',
        'uz': '/uz',
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

  const messages = await getMessages();

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

        {/* JSON-LD: LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type':    'LocalBusiness',
              name:       'ExpoContact',
              description:'Проектирование и строительство выставочных стендов',
              url:        'https://expocontact.uz',
              telephone:  '+998712000000',
              address: {
                '@type':           'PostalAddress',
                streetAddress:     'ул. Амира Темура, 107Б',
                addressLocality:   'Ташкент',
                addressCountry:    'UZ',
              },
              geo: {
                '@type':    'GeoCoordinates',
                latitude:   41.2995,
                longitude:  69.2401,
              },
              openingHoursSpecification: {
                '@type':     'OpeningHoursSpecification',
                dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday'],
                opens:       '09:00',
                closes:      '18:00',
              },
              sameAs: [
                'https://instagram.com/expocontact',
                'https://t.me/expocontact',
              ],
            }),
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
