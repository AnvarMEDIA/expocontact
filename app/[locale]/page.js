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

export const revalidate = 60;

export default async function Page({ params }) {
  const { locale } = await params;
  const lc = ['ru', 'en', 'uz'].includes(locale) ? locale : 'ru';

  const [projects, testimonials, settings, clients] = await Promise.all([
    readList(`portfolio.${lc}`),
    readList(`testimonials.${lc}`),
    readObject(`settings.${lc}`),
    readList('clients'),
  ]);

  return (
    <HomePageClient
      locale={lc}
      projects={projects}
      testimonials={testimonials}
      clients={clients}
      settings={settings}
    />
  );
}
