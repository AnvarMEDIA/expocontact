'use client';

import { useTranslations } from 'next-intl';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect } from 'react';

/* Параллакс-эффект на движение мыши */
function useMouseParallax(strength = 20) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const x  = useTransform(sx, [-0.5, 0.5], [-strength, strength]);
  const y  = useTransform(sy, [-0.5, 0.5], [-strength, strength]);

  const onMove = (e) => {
    mx.set((e.clientX / window.innerWidth)  - 0.5);
    my.set((e.clientY / window.innerHeight) - 0.5);
  };
  return { x, y, onMove };
}

/* Анимация появления слова */
const wordIn = (i) => ({
  hidden:  { opacity: 0, y: 60, rotateX: -40 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
});

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
});

export default function Hero({ onRequestQuote }) {
  const t      = useTranslations('hero');
  const words  = t('headline').split(' ');
  const { x, y, onMove } = useMouseParallax(14);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={onMove}
    >
      {/* ── Сетка + glow ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(212,168,67,0.1) 0%, transparent 70%)',
        }}
      />

      {/* ── Параллакс-декор: большие кольца ─────────────────────────────── */}
      <motion.div
        style={{ x, y }}
        aria-hidden
        className="absolute pointer-events-none"
      >
        <svg
          width="700" height="700"
          viewBox="0 0 700 700"
          className="opacity-10"
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        >
          <circle cx="350" cy="350" r="280" stroke="#D4A843" strokeWidth="0.5" fill="none" />
          <circle cx="350" cy="350" r="200" stroke="#D4A843" strokeWidth="0.5" fill="none" />
          <circle cx="350" cy="350" r="120" stroke="#D4A843" strokeWidth="1"   fill="none" />
          {/* Кросс-линии */}
          <line x1="350" y1="70"  x2="350" y2="630" stroke="#D4A843" strokeWidth="0.5" strokeDasharray="4 12" />
          <line x1="70"  y1="350" x2="630" y2="350" stroke="#D4A843" strokeWidth="0.5" strokeDasharray="4 12" />
        </svg>
      </motion.div>

      {/* ── Декоративные угловые кронштейны ─────────────────────────────── */}
      {[
        { cls: 'top-8 left-8',   border: 'border-t border-l' },
        { cls: 'top-8 right-8',  border: 'border-t border-r' },
        { cls: 'bottom-8 left-8',  border: 'border-b border-l' },
        { cls: 'bottom-8 right-8', border: 'border-b border-r' },
      ].map(({ cls, border }, i) => (
        <motion.div
          key={i}
          aria-hidden
          className={`absolute w-10 h-10 border-gold/25 ${border} ${cls}`}
          initial={{ opacity: 0, scale: 1.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
        />
      ))}

      {/* ── Основной контент ─────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
           style={{ perspective: 1200 }}>

        {/* Бейдж */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="hidden"
          animate="visible"
          className="flex justify-center mb-10"
        >
          <span className="pill text-xs sm:text-sm gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden />
            {t('badge')}
          </span>
        </motion.div>

        {/* Заголовок — пословное появление с 3D-flip */}
        <h1
          className="font-heading font-black leading-none mb-8"
          style={{ fontSize: 'clamp(2.4rem, 7vw, 6rem)' }}
        >
          <span className="flex flex-wrap justify-center gap-x-5 gap-y-1">
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

        {/* Подзаголовок */}
        <motion.p
          variants={fadeUp(0.85)}
          initial="hidden"
          animate="visible"
          className="text-white/55 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {t('subheadline')}
        </motion.p>

        {/* CTA-кнопки */}
        <motion.div
          variants={fadeUp(1.05)}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="#portfolio"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm border border-white/12 text-white/80 hover:border-gold/50 hover:text-gold transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('cta1')}
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          <motion.button
            onClick={onRequestQuote}
            className="btn-gold w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {t('cta2')}
          </motion.button>
        </motion.div>

        {/* Плавающие мини-статы */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-14"
          variants={fadeUp(1.3)}
          initial="hidden"
          animate="visible"
        >
          {[
            { n: '20+',   l: 'лет опыта' },
            { n: '5000+', l: 'проектов'  },
            { n: '3',     l: 'страны'    },
          ].map(({ n, l }) => (
            <div key={n} className="glass-gold px-5 py-3 rounded-xl text-center">
              <p className="font-heading font-black text-gold text-xl leading-none">{n}</p>
              <p className="text-white/40 text-xs mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Индикатор прокрутки ──────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden
      >
        <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/15 flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-gold"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
