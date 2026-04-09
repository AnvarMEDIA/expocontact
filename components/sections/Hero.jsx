'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

/* Parallax — only on pointer devices, not touch */
function usePointerParallax(strength = 20) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const x  = useTransform(sx, [-0.5, 0.5], [-strength, strength]);
  const y  = useTransform(sy, [-0.5, 0.5], [-strength, strength]);

  const onMove = (e) => {
    if (e.pointerType === 'touch') return;
    mx.set((e.clientX / window.innerWidth)  - 0.5);
    my.set((e.clientY / window.innerHeight) - 0.5);
  };
  return { x, y, onMove };
}

const wordIn = (i) => ({
  hidden:  { opacity: 0, y: 40, rotateX: -30 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
});

export default function Hero({ onRequestQuote }) {
  const t      = useTranslations('hero');
  const words  = t('headline').split(' ');
  const { x, y, onMove } = usePointerParallax(14);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4"
      onPointerMove={onMove}
    >
      {/* Grid + glow */}
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(212,168,67,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Parallax SVG rings — smaller on mobile */}
      <motion.div style={{ x, y }} aria-hidden className="absolute pointer-events-none">
        <svg
          viewBox="0 0 700 700"
          className="opacity-10 w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px]"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        >
          <circle cx="350" cy="350" r="280" stroke="#D4A843" strokeWidth="0.5" fill="none" />
          <circle cx="350" cy="350" r="200" stroke="#D4A843" strokeWidth="0.5" fill="none" />
          <circle cx="350" cy="350" r="120" stroke="#D4A843" strokeWidth="1"   fill="none" />
          <line x1="350" y1="70"  x2="350" y2="630" stroke="#D4A843" strokeWidth="0.5" strokeDasharray="4 12" />
          <line x1="70"  y1="350" x2="630" y2="350" stroke="#D4A843" strokeWidth="0.5" strokeDasharray="4 12" />
        </svg>
      </motion.div>

      {/* Corner brackets */}
      {[
        { cls: 'top-3 left-3 sm:top-8 sm:left-8',       border: 'border-t border-l' },
        { cls: 'top-3 right-3 sm:top-8 sm:right-8',      border: 'border-t border-r' },
        { cls: 'bottom-14 left-3 sm:bottom-8 sm:left-8',  border: 'border-b border-l' },
        { cls: 'bottom-14 right-3 sm:bottom-8 sm:right-8', border: 'border-b border-r' },
      ].map(({ cls, border }, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`absolute w-7 h-7 sm:w-10 sm:h-10 border-gold/25 ${border} ${cls}`}
          initial={{ opacity: 0, scale: 1.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
        />
      ))}

      {/* Main content */}
      <div
        className="relative z-10 w-full max-w-5xl mx-auto text-center"
        style={{ perspective: 1200 }}
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-5 sm:mb-8 md:mb-10"
        >
          <span className="pill text-[11px] sm:text-sm gap-2 sm:gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden />
            {t('badge')}
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          className="font-heading font-black leading-none mb-5 sm:mb-7 md:mb-8"
          style={{ fontSize: 'clamp(1.9rem, 7.5vw, 6rem)' }}
        >
          <span className="flex flex-wrap justify-center gap-x-2 sm:gap-x-4 md:gap-x-5 gap-y-1">
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordIn(i)}
                initial="hidden"
                animate="visible"
                style={{ display: 'inline-block', transformOrigin: 'center bottom' }}
                className={i >= words.length - 2 ? 'text-gradient-gold' : 'text-white'}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp(0.85)}
          initial="hidden"
          animate="visible"
          className="text-white/55 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-7 sm:mb-10 md:mb-12 leading-relaxed"
        >
          {t('subheadline')}
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp(1.05)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
        >
          <motion.a
            href="#portfolio"
            className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm border border-white/12 text-white/80 hover:border-gold/50 hover:text-gold transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('cta1')}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          <motion.button
            onClick={onRequestQuote}
            className="btn-gold inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('cta2')}
          </motion.button>
        </motion.div>

        {/* Floating mini-stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-7 sm:mt-10 md:mt-14"
          variants={fadeUp(1.3)}
          initial="hidden"
          animate="visible"
        >
          {[
            { n: '20+',   l: 'лет опыта' },
            { n: '5000+', l: 'проектов'  },
            { n: '3',     l: 'страны'    },
          ].map(({ n, l }) => (
            <div key={n} className="glass-gold px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-center">
              <p className="font-heading font-black text-gold text-lg sm:text-xl leading-none">{n}</p>
              <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden
      >
        <span className="text-white/25 text-[9px] sm:text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-5 h-7 sm:h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-gold"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
