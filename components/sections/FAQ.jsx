'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

function AccordionItem({ item, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className={`border rounded-xl overflow-hidden transition-colors duration-300 ${
        isOpen
          ? 'border-gold/40 bg-gold/5'
          : 'border-white/8 bg-charcoal hover:border-white/20'
      }`}
    >
      {/* Question button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span
          className={`font-semibold text-sm md:text-base pr-4 transition-colors duration-200 ${
            isOpen ? 'text-gold-light' : 'text-white'
          }`}
        >
          {item.q}
        </span>

        {/* Animated chevron */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className={`flex-shrink-0 ${isOpen ? 'text-gold' : 'text-white/30'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </motion.span>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 pb-6">
              <p className="text-white/60 text-sm leading-relaxed">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const t     = useTranslations('faq');
  const items = t.raw('items');
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="py-24 md:py-32 bg-charcoal">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-12"
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

        {/* Accordion */}
        <div className="space-y-3">
          {items.map((item, i) => (
            <AccordionItem
              key={item.q.slice(0, 30)}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
