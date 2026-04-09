'use client';

import Header       from '@/components/layout/Header';
import Footer       from '@/components/layout/Footer';
import Hero         from '@/components/sections/Hero';
import Stats        from '@/components/sections/Stats';
import Services     from '@/components/sections/Services';
import Portfolio    from '@/components/sections/Portfolio';
import Process      from '@/components/sections/Process';
import Clients      from '@/components/sections/Clients';
import Testimonials from '@/components/sections/Testimonials';
import FAQ          from '@/components/sections/FAQ';
import Contact      from '@/components/sections/Contact';
import FloatingCTA  from '@/components/ui/FloatingCTA';

/**
 * Клиентская оболочка главной страницы.
 * Данные (projects, testimonials, clients) приходят пропсами от серверного page.js.
 */
export default function HomePageClient({ locale, projects, testimonials, clients }) {
  const scrollToContact = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-navy">
      <Header locale={locale} onRequestQuote={scrollToContact} />

      <Hero        onRequestQuote={scrollToContact} />
      <Stats />
      <Services />
      <Portfolio   projects={projects} />
      <Process />
      <Clients     clients={clients} />
      <Testimonials testimonials={testimonials} />
      <FAQ />
      <Contact />

      <Footer locale={locale} />

      {/* Плавающая кнопка — только мобильные */}
      <FloatingCTA onClick={scrollToContact} />
    </main>
  );
}
