import NewLanding from '@/components/new/NewLanding';
import { readList } from '@/lib/store';

export const revalidate = 60;

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
  const [projects, clients] = await Promise.all([
    readList(`portfolio.${lc}`),
    readList('clients'),
  ]);

  return (
    <NewLanding
      locale={lc}
      projects={projects}
      clients={clients}
    />
  );
}
