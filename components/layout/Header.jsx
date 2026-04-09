'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const LOCALES = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
];

export default function Header({ locale, onRequestQuote }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled,    setScrolled]    = useState(false);
  const [visible,     setVisible]     = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // ── Scroll handler: transparent → blur, hide on down / show on up ──────
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 20);
    setVisible(y < lastScrollY || y < 80);
    setLastScrollY(y);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Switch locale: replace the locale segment in the URL
  const switchLocale = (code) => {
    const segments = pathname.split('/');
    segments[1] = code;
    router.push(segments.join('/') || '/');
  };

  const navLinks = [
    { href: '#about',     label: t('about')     },
    { href: '#services',  label: t('services')  },
    { href: '#portfolio', label: t('portfolio') },
    { href: '#process',   label: t('process')   },
    { href: '#contacts',  label: t('contacts')  },
  ];

  return (
    <>
      {/* ── Desktop / tablet header ─────────────────────────────────────── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-navy/90 backdrop-blur-md border-b border-white/5 shadow-lg'
            : 'bg-transparent'
        }`}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
              <span className="font-heading text-xl font-black tracking-tight">
                EXPO<span className="text-gold">CONTACT</span>
              </span>
            </Link>

            {/* Nav links — hidden on mobile */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm font-medium text-white/70 hover:text-gold transition-colors duration-200"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right side: lang switcher + CTA */}
            <div className="flex items-center gap-4">
              {/* Language switcher */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold">
                {LOCALES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className={`px-2 py-1 rounded transition-colors ${
                      locale === code
                        ? 'text-gold'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* CTA button — hidden on mobile */}
              <button
                onClick={onRequestQuote}
                className="hidden md:inline-flex items-center px-5 py-2.5 bg-gold text-navy text-sm font-bold rounded-lg hover:bg-gold-light transition-colors duration-200"
              >
                {t('cta')}
              </button>

              {/* Hamburger */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-2"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-5 h-0.5 bg-white" />
                <span className="block w-3 h-0.5 bg-white" />
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* ── Full-screen mobile menu overlay ─────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            className="fixed inset-0 z-[60] bg-navy flex flex-col"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {/* Header row inside overlay */}
            <div className="flex items-center justify-between px-6 h-16">
              <span className="font-heading text-xl font-black">
                EXPO<span className="text-gold">CONTACT</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-white/70 hover:text-white"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 flex flex-col justify-center px-8 gap-6">
              {navLinks.map(({ href, label }, i) => (
                <motion.a
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-3xl font-heading font-black text-white/80 hover:text-gold transition-colors"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            {/* Bottom: lang + CTA */}
            <div className="px-8 pb-12 flex flex-col gap-4">
              {/* Language switcher */}
              <div className="flex items-center gap-3 text-sm font-bold">
                {LOCALES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => { switchLocale(code); setMobileOpen(false); }}
                    className={`px-3 py-1.5 rounded border ${
                      locale === code
                        ? 'border-gold text-gold'
                        : 'border-white/20 text-white/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setMobileOpen(false); onRequestQuote?.(); }}
                className="w-full py-4 bg-gold text-navy font-bold text-lg rounded-xl"
              >
                {t('cta')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
