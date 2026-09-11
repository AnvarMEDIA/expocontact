import NewLanding from '@/components/new/NewLanding';
import portfolioRu from '@/content/data/portfolio.ru.json';
import portfolioEn from '@/content/data/portfolio.en.json';
import portfolioUz from '@/content/data/portfolio.uz.json';
import clientsData from '@/content/data/clients.json';

const PORTFOLIO = { ru: portfolioRu, en: portfolioEn, uz: portfolioUz };

export const metadata = {
  title: 'ExpoContact — Vision in Form and Function',
  // Draft alternative landing: keep it out of the index so it does not
  // compete with the main page as duplicate content. Remove once it replaces
  // the main landing.
  robots: { index: false, follow: true },
};

export default async function Page({ params }) {
  const { locale } = await params;
  const lc = ['ru', 'en', 'uz'].includes(locale) ? locale : 'ru';
  return (
    <NewLanding
      locale={lc}
      projects={PORTFOLIO[lc]}
      clients={clientsData}
    />
  );
}
