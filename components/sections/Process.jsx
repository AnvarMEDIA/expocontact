'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function Process() {
  const t     = useTranslations('process');
  const steps = t.raw('steps');
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section id="process" className="py-24 md:py-32 bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-black text-3xl md:text-5xl mb-4 heading-accent-center">
            {t('title')}
          </h2>
          <p className="text-white/50 text-lg">{t('subtitle')}</p>
        </motion.div>

        {/* ── Desktop: horizontal scroll track ─────────────────────────── */}
        <div className="hidden md:block relative">
          {/* Scroll buttons */}
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-colors"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full bg-charcoal border border-white/10 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-colors"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Track */}
          <div
            ref={trackRef}
            className="overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex gap-4 w-max px-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="w-[280px] flex-shrink-0"
                >
                  <StepCard step={step} index={i} total={steps.length} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile: vertical stack ────────────────────────────────────── */}
        <div className="md:hidden space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <StepCard step={step} index={i} total={steps.length} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index, total }) {
  return (
    <div className="relative p-6 rounded-2xl bg-charcoal border border-white/5 hover:border-gold/30 transition-colors duration-300 h-full">
      {/* Step number — large decorative */}
      <div className="absolute -top-4 left-6">
        <span className="font-heading font-black text-5xl text-gold/10 select-none leading-none">
          {step.number}
        </span>
      </div>

      {/* Connector arrow (desktop) */}
      {index < total - 1 && (
        <div className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 text-white/20 z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      <div className="mt-8">
        {/* Gold accent */}
        <div className="w-8 h-0.5 bg-gold mb-4" />

        <h3 className="font-heading font-black text-lg mb-2">{step.title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}
