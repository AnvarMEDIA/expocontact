'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_URL =
  'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

const LOCALES = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
];

export default function Header({ locale, onRequestQuote }) {
  const t        = useTranslations('nav');
  const pathname = usePathname();
  const router   = useRouter();

  const [scrolled,    setScrolled]    = useState(false);
  const [visible,     setVisible]     = useState(true);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 30);
    setVisible(y < lastScrollY || y < 80);
    setLastScrollY(y);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-navy/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-navy/50'
            : 'bg-transparent'
        }`}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Логотип ──────────────────────────────────────────────── */}
            <Link href={`/${locale}`} className="flex items-center flex-shrink-0 group">
              <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
                <Image
                  src={LOGO_URL}
                  alt="ExpoContact"
                  width={160}
                  height={40}
                  className="h-8 w-auto"
                  priority
                  unoptimized
                />
              </motion.div>
            </Link>

            {/* ── Навигация (десктоп) ───────────────────────────────────── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="relative px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 group"
                >
                  {label}
                  <span className="absolute bottom-0 left-4 right-4 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
                </a>
              ))}
            </nav>

            {/* ── Правая часть ──────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              {/* Переключатель языков */}
              <div className="hidden sm:flex items-center gap-0.5 p-1 rounded-lg bg-white/5">
                {LOCALES.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                      locale === code
                        ? 'bg-gold text-navy shadow-sm'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                onClick={onRequestQuote}
                className="hidden md:flex btn-gold items-center gap-2 px-5 py-2.5 text-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {t('cta')}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>

              {/* Гамбургер */}
              <button
                className="md:hidden relative w-9 h-9 flex flex-col gap-1.5 items-center justify-center"
                onClick={() => setMobileOpen(true)}
                aria-label="Открыть меню"
              >
                <span className="block w-5 h-0.5 bg-white rounded-full" />
                <span className="block w-5 h-0.5 bg-white rounded-full" />
                <span className="block w-3 h-0.5 bg-gold  rounded-full self-start" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Мобильное меню ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[55] bg-navy/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              className="fixed top-0 right-0 bottom-0 z-[60] w-[80vw] max-w-xs bg-charcoal border-l border-white/8 flex flex-col shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Заголовок панели */}
              <div className="flex items-center justify-between px-6 pt-6 pb-8">
                <Image src={LOGO_URL} alt="ExpoContact" width={130} height={32} className="h-7 w-auto" unoptimized />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Ссылки */}
              <nav className="flex-1 px-4 space-y-1">
                {navLinks.map(({ href, label }, i) => (
                  <motion.a
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-semibold transition-all group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                    {label}
                  </motion.a>
                ))}
              </nav>

              {/* Нижняя часть */}
              <div className="px-4 pb-8 space-y-4">
                {/* Языки */}
                <div className="flex gap-2">
                  {LOCALES.map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => { switchLocale(code); setMobileOpen(false); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        locale === code
                          ? 'bg-gold text-navy'
                          : 'bg-white/5 text-white/50 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => { setMobileOpen(false); onRequestQuote?.(); }}
                  className="btn-gold w-full py-4 text-base"
                >
                  {t('cta')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
