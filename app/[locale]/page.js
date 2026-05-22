/**
 * Server Component — entry point for each locale (/ru, /en, /uz).
 * Reads locale-specific JSON data on the server and passes it to the HomePage client.
 */
import HomePageClient from '@/components/HomePageClient';

import portfolioRu    from '@/content/data/portfolio.ru.json';
import portfolioEn    from '@/content/data/portfolio.en.json';
import portfolioUz    from '@/content/data/portfolio.uz.json';
import testimonialsRu from '@/content/data/testimonials.ru.json';
import testimonialsEn from '@/content/data/testimonials.en.json';
import testimonialsUz from '@/content/data/testimonials.uz.json';
import settingsRu     from '@/content/data/settings.ru.json';
import settingsEn     from '@/content/data/settings.en.json';
import settingsUz     from '@/content/data/settings.uz.json';
import clientsData    from '@/content/data/clients.json';

const PORTFOLIO    = { ru: portfolioRu,    en: portfolioEn,    uz: portfolioUz };
const TESTIMONIALS = { ru: testimonialsRu, en: testimonialsEn, uz: testimonialsUz };
const SETTINGS     = { ru: settingsRu,     en: settingsEn,     uz: settingsUz };

export default async function Page({ params }) {
  const { locale } = await params;
  const lc = ['ru', 'en', 'uz'].includes(locale) ? locale : 'ru';

  return (
    <HomePageClient
      locale={lc}
      projects={PORTFOLIO[lc]}
      testimonials={TESTIMONIALS[lc]}
      clients={clientsData}
      settings={SETTINGS[lc]}
    />
  );
}
