import NewLanding from '@/components/new/NewLanding';
import portfolioData from '@/content/data/portfolio.json';
import clientsData from '@/content/data/clients.json';

export const metadata = {
  title: 'ExpoContact — Vision in Form and Function',
};

export default async function Page({ params }) {
  const { locale } = await params;
  return (
    <NewLanding
      locale={locale}
      projects={portfolioData}
      clients={clientsData}
    />
  );
}
