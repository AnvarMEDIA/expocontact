/**
 * Server Component — точка входа для каждой локали (/ru, /en, /uz).
 * Читает данные из JSON-файлов на сервере и передаёт их в клиентский HomePage.
 */
import HomePageClient from '@/components/HomePageClient';

// Данные загружаются на сервере — не попадают в клиентский бандл
import portfolioData    from '@/content/data/portfolio.json';
import testimonialsData from '@/content/data/testimonials.json';
import clientsData      from '@/content/data/clients.json';

export default async function Page({ params }) {
  const { locale } = await params;

  return (
    <HomePageClient
      locale={locale}
      projects={portfolioData}
      testimonials={testimonialsData}
      clients={clientsData}
    />
  );
}
