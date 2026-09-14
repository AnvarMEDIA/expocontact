/**
 * /[locale]/lp — the landing page for bought traffic.
 *
 * Separate from the main site on purpose: no navigation, one offer, one form,
 * so a click from an ad has exactly one thing to do. Campaign parameters on the
 * URL (utm_source, utm_medium, utm_campaign, utm_content, utm_term and the ad
 * platform click ids) are captured in the browser and travel with the lead into
 * Telegram and the admin panel.
 *
 * Example ad URL:
 *   https://expocontact.uz/ru/lp?utm_source=instagram&utm_medium=cpc
 *     &utm_campaign=autumn_stands&utm_content=video_a
 *
 * It is noindex: paid landing pages should not compete with the real site in
 * search results, and this one repeats content that already lives there.
 */
import { notFound } from 'next/navigation';
import AdLanding from '@/components/AdLanding';
import { readObject } from '@/lib/store';
import { routing } from '@/i18n/routing';

export const revalidate = 60;

const TITLES = {
  ru: 'Выставочные стенды под ключ — заявка на расчёт | ExpoContact',
  en: 'Turnkey exhibition stands — request a quote | ExpoContact',
  uz: 'Ko’rgazma stendlari — hisob-kitob uchun ariza | ExpoContact',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: TITLES[locale] || TITLES.ru,
    robots: { index: false, follow: false },
  };
}

export default async function AdLandingPage({ params }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale)) notFound();

  const [settings, content] = await Promise.all([
    readObject(`settings.${locale}`),
    readObject(`content.${locale}`),
  ]);

  return (
    <AdLanding
      locale={locale}
      settings={settings}
      overrides={content.adLanding || {}}
    />
  );
}
