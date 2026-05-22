'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

const SLIDES = [
  {
    headline:    'Выставочные стенды, которые работают на вас',
    subheadline: 'Проектируем, строим, монтируем — вы просто приходите на выставку',
    cta:         'Обсудить проект',
  },
  {
    headline:    'Вы занимаетесь бизнесом — мы занимаемся событием',
    subheadline: 'Полный цикл организации: выставочные стенды, ивенты, корпоративные встречи под ключ',
    cta:         'Получить консультацию',
  },
  {
    headline:    'Ваше мероприятие в надёжных руках',
    subheadline: 'Профессиональная организация выставок, бизнес-мероприятий и корпоративных событий в Узбекистане',
    cta:         'Рассчитать стоимость',
  },
  {
    headline:    'Создаём события, о которых говорят',
    subheadline: 'От выставочного стенда до корпоративного форума — делаем каждую деталь идеальной',
    cta:         'Начать планирование',
  },
  {
    headline:    'Готовы воплотить ваше мероприятие в жизнь',
    subheadline: 'Оставьте заявку — свяжемся в течение 30 минут и предложим решение под ваш бюджет',
    cta:         'Оставить заявку',
  },
];

const INTERVAL = 5000;

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

const slideVariants = {
  enter:  { opacity: 0, y: 36 },
  center: { opacity: 1, y: 0,  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -20, transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0] } },
};

export default function Hero({ onRequestQuote }) {
  const [current,  setCurrent]  = useState(0);
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);

  const startRef  = useRef(performance.now());
  const rafRef    = useRef(null);
  const { x, y, onMove } = usePointerParallax(14);

  const goTo = (idx) => {
    setCurrent(idx);
  };
  const next = () => goTo((current + 1) % SLIDES.length);
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);

  // Reset progress timestamp on every slide change
  useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, [current]);

  // Animate progress bar
  useEffect(() => {
    if (paused) return;
    const tick = () => {
      const p = Math.min((performance.now() - startRef.current) / INTERVAL, 1);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, paused]);

  // Auto-advance slide
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setCurrent(c => (c + 1) % SLIDES.length), INTERVAL);
    return () => clearTimeout(id);
  }, [current, paused]);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden px-4"
      onPointerMove={onMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Grid — 50% opacity */}
      <div className="absolute inset-0 grid-bg opacity-50" />

      {/* Gold radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(212,168,67,0.1) 0%, transparent 70%)',
        }}
      />

      {/* 3D parallax SVG rings */}
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
        { cls: 'top-3 left-3 sm:top-8 sm:left-8',         border: 'border-t border-l' },
        { cls: 'top-3 right-3 sm:top-8 sm:right-8',        border: 'border-t border-r' },
        { cls: 'bottom-14 left-3 sm:bottom-8 sm:left-8',   border: 'border-b border-l' },
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

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center mb-6 sm:mb-9 md:mb-11"
        >
          <span className="pill text-[11px] sm:text-sm gap-2 sm:gap-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden />
            Узбекистан · 20+ лет опыта
          </span>
        </motion.div>

        {/* Slide text */}
        <div className="relative min-h-[280px] sm:min-h-[260px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center w-full"
            >
              {/* Headline */}
              <h1
                className="font-heading font-black leading-none mb-5 sm:mb-7 text-white"
                style={{ fontSize: 'clamp(1.75rem, 6.5vw, 5.5rem)' }}
              >
                {SLIDES[current].headline}
              </h1>

              {/* Subheadline */}
              <p className="text-white/55 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                {SLIDES[current].subheadline}
              </p>

              {/* CTA */}
              <motion.button
                onClick={onRequestQuote}
                className="btn-gold inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {SLIDES[current].cta}
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8 sm:mt-10 w-full max-w-sm mx-auto h-px bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-light))',
            }}
          />
        </div>

        {/* Navigation: prev · dots · next */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6">

          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Предыдущий слайд"
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-gold/60 hover:text-gold transition-all duration-200 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Слайд ${i + 1}`}
                className="relative h-1.5 rounded-full transition-all duration-300 overflow-hidden"
                style={{
                  width: i === current ? 28 : 8,
                  background: i === current ? 'transparent' : 'rgba(255,255,255,0.18)',
                }}
              >
                {i === current && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-light))',
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Следующий слайд"
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-gold/60 hover:text-gold transition-all duration-200 flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Floating mini-stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-11 md:mt-14"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {[
            { n: '20+',   l: 'лет опыта'  },
            { n: '5000+', l: 'проектов'   },
            { n: '3',     l: 'страны'     },
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
        transition={{ delay: 1.5, duration: 0.8 }}
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
