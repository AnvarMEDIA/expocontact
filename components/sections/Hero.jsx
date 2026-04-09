'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Staggered word animation variant
const wordVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
});

export default function Hero({ onRequestQuote }) {
  const t = useTranslations('hero');

  // Split headline into words for staggered reveal
  const words = t('headline').split(' ');

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg"
    >
      {/* ── Background radial glow ─────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(212,168,67,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── Decorative gold corner lines ──────────────────────────────── */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full opacity-20"
        preserveAspectRatio="none"
      >
        {/* Top-left corner */}
        <line x1="0" y1="0" x2="120" y2="0"  stroke="#D4A843" strokeWidth="1" />
        <line x1="0" y1="0" x2="0"   y2="120" stroke="#D4A843" strokeWidth="1" />
        {/* Bottom-right corner */}
        <line x1="100%" y1="100%" x2="calc(100% - 120px)" y2="100%" stroke="#D4A843" strokeWidth="1" />
        <line x1="100%" y1="100%" x2="100%" y2="calc(100% - 120px)" stroke="#D4A843" strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* ── Badge ──────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-8"
        >
          <span className="pill text-xs sm:text-sm">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse"
              aria-hidden
            />
            {t('badge')}
          </span>
        </motion.div>

        {/* ── Animated headline ──────────────────────────────────────── */}
        <h1 className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {words.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate="visible"
              className={
                // Highlight "первое впечатление" (last 2 words)
                i >= words.length - 2 ? 'text-gradient-gold' : 'text-white'
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* ── Subheadline ────────────────────────────────────────────── */}
        <motion.p
          variants={fadeUp(0.7)}
          initial="hidden"
          animate="visible"
          className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t('subheadline')}
        </motion.p>

        {/* ── CTAs ───────────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp(0.9)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#portfolio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold/40 text-gold font-bold rounded-xl hover:bg-gold/10 transition-colors duration-200"
          >
            {t('cta1')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          <button
            onClick={onRequestQuote}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-bold rounded-xl hover:bg-gold-light transition-colors duration-200 shadow-lg shadow-gold/20"
          >
            {t('cta2')}
          </button>
        </motion.div>
      </div>

      {/* ── Scroll indicator ───────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden
      >
        <span className="text-white/30 text-xs tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent"
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}
