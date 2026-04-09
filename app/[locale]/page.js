'use client';

import { useState } from 'react';
import Header        from '@/components/layout/Header';
import Footer        from '@/components/layout/Footer';
import Hero          from '@/components/sections/Hero';
import Stats         from '@/components/sections/Stats';
import Services      from '@/components/sections/Services';
import Portfolio     from '@/components/sections/Portfolio';
import Process       from '@/components/sections/Process';
import Clients       from '@/components/sections/Clients';
import Testimonials  from '@/components/sections/Testimonials';
import FAQ           from '@/components/sections/FAQ';
import Contact       from '@/components/sections/Contact';
import FloatingCTA   from '@/components/ui/FloatingCTA';

// Static data imported at the module level (no dynamic import needed for client)
import portfolioData   from '@/content/data/portfolio.json';
import testimonialsData from '@/content/data/testimonials.json';
import clientsData     from '@/content/data/clients.json';

export default function HomePage({ params }) {
  const locale = params?.locale || 'ru';
  const [contactOpen, setContactOpen] = useState(false);

  const scrollToContact = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-navy">
      <Header locale={locale} onRequestQuote={scrollToContact} />

      <Hero        onRequestQuote={scrollToContact} />
      <Stats />
      <Services />
      <Portfolio   projects={portfolioData} />
      <Process />
      <Clients     clients={clientsData} />
      <Testimonials testimonials={testimonialsData} />
      <FAQ />
      <Contact />

      <Footer locale={locale} />

      {/* Mobile floating CTA */}
      <FloatingCTA onClick={scrollToContact} />
    </main>
  );
}
