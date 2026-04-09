'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';

function StepCard({ step, index, total, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex-shrink-0 w-64 md:w-72"
    >
      {/* Коннектор → */}
      {index < total - 1 && (
        <div className="absolute right-0 top-8 translate-x-1/2 z-10 hidden md:flex items-center">
          <svg className="w-8 h-4 text-gold/25" viewBox="0 0 32 16" fill="none">
            <path d="M0 8 H28 M22 2 L28 8 L22 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Карточка */}
      <div className="group h-full p-6 rounded-2xl bg-charcoal/70 border border-white/5 hover:border-gold/25 transition-all duration-500 hover:-translate-y-1"
           style={{ backdropFilter: 'blur(8px)' }}>
        {/* Декоративный номер */}
        <div className="relative mb-6">
          <span
            className="absolute -top-2 -left-2 font-heading font-black text-gold/8 select-none leading-none"
            style={{ fontSize: 72 }}
            aria-hidden
          >
            {step.number}
          </span>
          {/* Золотая иконка-круг */}
          <div className="relative w-12 h-12 rounded-xl glass-gold flex items-center justify-center">
            <span className="font-heading font-black text-gold text-sm">{step.number}</span>
          </div>
        </div>

        {/* Золотая черта */}
        <div className="w-8 h-0.5 bg-gradient-to-r from-gold to-gold-light mb-4 rounded-full group-hover:w-14 transition-all duration-500" />

        <h3 className="font-heading font-black text-base md:text-lg mb-2 text-white">{step.title}</h3>
        <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
      </div>
    </motion.div>
  );
}

export default function Process() {
  const t      = useTranslations('process');
  const steps  = t.raw('steps');
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <section id="process" ref={sectionRef} className="py-24 md:py-32 bg-navy overflow-hidden relative">
      {/* Горизонтальный градиент */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-navy to-transparent z-10 pointer-events-none hidden md:block" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-navy to-transparent z-10 pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-gold/60 text-xs tracking-[0.35em] uppercase font-semibold mb-4">
            — Как мы работаем
          </p>
          <h2 className="font-heading font-black text-3xl md:text-5xl leading-tight heading-accent">
            {t('title')}
          </h2>
          <p className="text-white/40 text-lg mt-5">{t('subtitle')}</p>
        </motion.div>
      </div>

      {/* ── Горизонтальная прокрутка (десктоп) ────────────────────────────── */}
      <div className="hidden md:block relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold border border-white/10 transition-colors"
          aria-label="Назад"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => scroll(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-gold hover:border-gold border border-white/10 transition-colors"
          aria-label="Вперёд"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div
          ref={trackRef}
          className="overflow-x-auto pb-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-5 px-[max(2rem,calc((100vw-80rem)/2))]">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} total={steps.length} isVisible={isInView} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Вертикальный стек (мобильные) ─────────────────────────────────── */}
      <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative">
          {/* Вертикальная соединяющая линия */}
          <div className="absolute left-6 top-12 bottom-12 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" />

          <div className="space-y-4">
            {steps.map((step, i) => (
              <StepCard
                key={step.number}
                step={step}
                index={i}
                total={steps.length}
                isVisible={isInView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
