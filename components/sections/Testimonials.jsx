'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

function Stars({ rating }) {
  const t = useTranslations('testimonials');
  return (
    <div className="flex gap-0.5" aria-label={`${rating} ${t('starsLabel')}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-gold' : 'text-white/15'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, avatar }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={name} className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gold/30" />
    );
  }

  return (
    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold/15 border-2 border-gold/30 flex items-center justify-center flex-shrink-0">
      <span className="font-heading font-black text-sm text-gold">{initials}</span>
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <div className="h-full flex flex-col bg-[#111827] border border-white/8 rounded-2xl p-5 sm:p-6 md:p-8">
      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gold/30 mb-3 sm:mb-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      <Stars rating={item.rating} />

      <blockquote className="flex-1 text-white/70 text-sm leading-relaxed mt-3 sm:mt-4 mb-4 sm:mb-6 italic">
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-white/8">
        <Avatar name={item.name} avatar={item.avatar} />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-white truncate">{item.name}</p>
          <p className="text-white/40 text-xs truncate">{item.position} · {item.company}</p>
        </div>
      </div>
    </div>
  );
}

const SLIDE_INTERVAL = 5000;

export default function Testimonials({ testimonials }) {
  const t     = useTranslations('testimonials');
  const total = testimonials.length;
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = () => setActive((a) => (a - 1 + total) % total);

  useEffect(() => {
    const id = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  // Touch swipe support for mobile
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const visible = [-1, 0, 1].map((offset) => {
    const idx = (active + offset + total) % total;
    return { item: testimonials[idx], offset };
  });

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-5xl mb-3 sm:mb-4 heading-accent-center">
            {t('title')}
          </h2>
          <p className="text-white/50 text-sm sm:text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* Desktop: 3 cards */}
        <div className="hidden lg:grid grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="popLayout">
            {visible.map(({ item, offset }) => (
              <motion.div
                key={`${item.name}-${offset}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: offset === 0 ? 1 : 0.55, y: 0, scale: offset === 0 ? 1 : 0.97 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TestimonialCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile/tablet: single card with swipe */}
        <div
          className="lg:hidden mb-6 sm:mb-8"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <TestimonialCard item={testimonials[active]} />
            </motion.div>
          </AnimatePresence>
          {/* Swipe hint */}
          <p className="text-center text-white/20 text-xs mt-3 tracking-wider">{t('swipeHint')}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 sm:gap-5">
          <button
            onClick={prev}
            className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-colors"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === active ? 'w-6 h-2.5 bg-gold' : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Отзыв ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-11 h-11 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-colors"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
