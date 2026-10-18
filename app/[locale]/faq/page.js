/**
 * /[locale]/faq — every question and its full answer as plain, server-rendered
 * text on its own URL.
 *
 * The landing page keeps the same questions inside an accordion, which is fine
 * for visitors but leaves the answers collapsed. Here they are open, one
 * heading per question, so search engines and AI assistants can quote a
 * complete answer instead of a fragment. Same content either way — nothing is
 * served to crawlers that a visitor cannot read.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { readObject } from '@/lib/store';
import { routing } from '@/i18n/routing';
import { SITE_URL as SITE } from '@/lib/site';
import '@/app/landing.css';

export const revalidate = 60;


const COPY = {
  ru: {
    title:    'Вопросы и ответы о выставочных стендах',
    intro:    'Стоимость, сроки, материалы, работа за рубежом и полный цикл — отвечаем по существу.',
    back:     'На главную',
    contact:  'Остались вопросы? Напишите нам',
    metaDesc: 'Сколько стоит выставочный стенд в Ташкенте, сколько его делают, из каких материалов и работаем ли за пределами Узбекистана — ответы ExpoContact.',
    home:     'Главная',
  },
  en: {
    title:    'Exhibition stand questions and answers',
    intro:    'Cost, lead times, materials, working abroad and full-cycle support — answered plainly.',
    back:     'Back to home',
    contact:  'Still have a question? Get in touch',
    metaDesc: 'What an exhibition stand costs in Tashkent, how long it takes, which materials are used and whether we work outside Uzbekistan — answers from ExpoContact.',
    home:     'Home',
  },
  uz: {
    title:    'Ko’rgazma stendlari haqida savol va javoblar',
    intro:    'Narx, muddat, materiallar, chet elda ishlash va to’liq sikl — aniq javoblar.',
    back:     'Bosh sahifaga',
    contact:  'Savolingiz qoldimi? Bizga yozing',
    metaDesc: 'Toshkentda ko’rgazma stendi qancha turadi, qancha vaqtda tayyorlanadi, qanday materiallardan va chet elda ishlaysizmi — ExpoContact javoblari.',
    home:     'Bosh sahifa',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) return {};
  const copy = COPY[locale] || COPY.ru;
  const seo  = await readObject(`seo.${locale}`);

  return {
    metadataBase: new URL(SITE),
    title:       copy.title,
    description: copy.metaDesc,
    alternates: {
      canonical: `/${locale}/faq`,
      languages: {
        ru: '/ru/faq', en: '/en/faq', uz: '/uz/faq', 'x-default': '/ru/faq',
      },
    },
    openGraph: {
      title:       copy.title,
      description: copy.metaDesc,
      url:         `/${locale}/faq`,
      siteName:    'ExpoContact',
      type:        'article',
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: copy.title }] : undefined,
    },
    // Without its own card the FAQ inherited the home page's Twitter/Telegram
    // preview, title and all.
    twitter: {
      card:        'summary_large_image',
      title:       copy.title,
      description: copy.metaDesc,
      images:      seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function FaqPage({ params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();

  const copy    = COPY[locale] || COPY.ru;
  const content = await readObject(`content.${locale}`);
  const items   = (content.faq?.items || []).filter((i) => i?.q && i?.a);

  if (!items.length) notFound();

  // The page, its place in the site, and its questions. The company and the
  // website come from the layout's graph; the @ids tie them together.
  const pageUrl = `${SITE}/${locale}/faq`;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type':     'WebPage',
        '@id':       `${pageUrl}#webpage`,
        url:         pageUrl,
        name:        copy.title,
        description: copy.metaDesc,
        inLanguage:  locale,
        isPartOf:    { '@id': `${SITE}/#website` },
        about:       { '@id': `${SITE}/#organization` },
        breadcrumb:  { '@id': `${pageUrl}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id':   `${pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: copy.home, item: `${SITE}/${locale}` },
          { '@type': 'ListItem', position: 2, name: copy.title, item: pageUrl },
        ],
      },
      {
        '@type':    'FAQPage',
        '@id':      `${pageUrl}#faq`,
        inLanguage: locale,
        isPartOf:   { '@id': `${pageUrl}#webpage` },
        mainEntity: items.map((i) => ({
          '@type': 'Question',
          name:    i.q,
          acceptedAnswer: { '@type': 'Answer', text: i.a },
        })),
      },
    ],
  }).replace(/</g, '\\u003c');

  return (
    <main className="section" style={{ paddingTop: 120 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="wrap">
        <span className="eyebrow">{content.faq?.eyebrow || 'FAQ'}</span>

        <h1 className="section-title" style={{ marginTop: 24 }}>{copy.title}</h1>
        <p className="hero__lead" style={{ marginTop: 16, maxWidth: '52ch' }}>{copy.intro}</p>

        <div style={{ marginTop: 56, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {items.map((item, i) => (
            <article key={i} style={{ maxWidth: '70ch' }}>
              <h2
                className="faq-item__q"
                style={{ fontSize: 'clamp(18px, 2.4vw, 24px)', lineHeight: 1.3, margin: 0 }}
              >
                {item.q}
              </h2>
              <p
                style={{
                  marginTop: 14,
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: 15,
                  lineHeight: 1.75,
                }}
              >
                {item.a}
              </p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 72, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <Link href={`/${locale}`} className="btn-ghost">{copy.back}</Link>
          <Link href={`/${locale}#contact`} className="btn-primary">{copy.contact}</Link>
        </div>
      </div>
    </main>
  );
}
