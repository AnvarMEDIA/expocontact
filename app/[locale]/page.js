/**
 * Server Component — entry point for each locale (/ru, /en, /uz).
 * Reads JSON data on the server and passes it to the HomePage client.
 */
import HomePageClient from '@/components/HomePageClient';

import portfolioData    from '@/content/data/portfolio.json';
import testimonialsData from '@/content/data/testimonials.json';
import clientsData      from '@/content/data/clients.json';
import settingsData     from '@/content/data/settings.json';

export default async function Page({ params }) {
  const { locale } = await params;

  return (
    <HomePageClient
      locale={locale}
      projects={portfolioData}
      testimonials={testimonialsData}
      clients={clientsData}
      settings={settingsData}
    />
  );
}
