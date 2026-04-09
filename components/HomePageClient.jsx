'use client';

import { useState, useEffect } from 'react';
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
import Preloader    from '@/components/ui/Preloader';
import AbstractBg   from '@/components/ui/AbstractBg';

export default function HomePageClient({ locale, projects, testimonials, clients }) {
  // Прелоадер: показываем один раз за сессию
  const [showPreloader, setShowPreloader] = useState(false);
  const [ready,         setReady]         = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem('preloader_shown');
    if (!shown) {
      setShowPreloader(true);
    } else {
      setReady(true);
    }
  }, []);

  const handlePreloaderDone = () => {
    sessionStorage.setItem('preloader_shown', '1');
    setShowPreloader(false);
    setReady(true);
  };

  const scrollToContact = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Прелоадер ────────────────────────────────────────────────────── */}
      {showPreloader && <Preloader onComplete={handlePreloaderDone} />}

      {/* ── Абстрактный фон (фиксированный слой) ────────────────────────── */}
      <AbstractBg />

      {/* ── Основной контент ─────────────────────────────────────────────── */}
      <main
        className="relative z-10 min-h-screen bg-navy/0"
        style={{
          // Плавное появление после прелоадера
          opacity:    ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        <Header locale={locale} onRequestQuote={scrollToContact} />

        <Hero         onRequestQuote={scrollToContact} />
        <Stats />
        <Services />
        <Portfolio    projects={projects} />
        <Process />
        <Clients      clients={clients} />
        <Testimonials testimonials={testimonials} />
        <FAQ />
        <Contact />

        <Footer locale={locale} />

        <FloatingCTA onClick={scrollToContact} />
      </main>
    </>
  );
}
