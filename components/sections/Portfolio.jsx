'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_KEYS = {
  all:           'filterAll',
  large:         'filterLarge',
  modular:       'filterModular',
  conference:    'filterConference',
  international: 'filterInternational',
};

const PLACEHOLDER_COLORS = [
  'from-[#1a2340] to-[#0d1624]',
  'from-[#1e1a2e] to-[#120e1e]',
  'from-[#1a2820] to-[#0e1a14]',
  'from-[#281a1a] to-[#1a0e0e]',
  'from-[#1a2040] to-[#0e1430]',
  'from-[#282018] to-[#1a1510]',
];

function Lightbox({ project, onClose, t }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy/95 backdrop-blur-sm" onClick={onClose} aria-hidden />

        {/* Panel — bottom sheet on mobile, centered modal on sm+ */}
        <motion.div
          className="relative bg-charcoal border border-white/10 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92svh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            aria-label={t('close')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image */}
          <div className="relative aspect-[16/9] sm:aspect-[16/8] bg-navy overflow-hidden sm:rounded-t-2xl">
            {project.mainImage && !project.mainImage.includes('placeholder') ? (
              <Image
                src={project.mainImage}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${PLACEHOLDER_COLORS[0]} flex items-center justify-center`}>
                <svg className="w-16 h-16 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 md:p-8">
            <h3 className="font-heading font-black text-xl sm:text-2xl mb-2">{project.title}</h3>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
              <span className="pill text-xs">{project.exhibition}</span>
              <span className="pill text-xs">{project.area} {t('areaLabel')}</span>
              <span className="pill text-xs">{project.year}</span>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-5 sm:mb-6">{project.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider">{t('clientLabel')}</p>
                <p className="text-white font-semibold text-sm sm:text-base">{project.client}</p>
              </div>
              <button
                onClick={onClose}
                className="px-4 sm:px-5 py-2.5 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PortfolioCard({ project, index, t, onClick }) {
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const hasImage = project.mainImage && !project.mainImage.includes('placeholder');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-xl overflow-hidden border border-white/5 hover:border-gold/40 transition-all duration-300 bg-charcoal active:scale-[0.98]"
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(212,168,67,0.12)' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {hasImage ? (
          <Image
            src={project.mainImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${color} flex items-center justify-center`}>
            <svg className="w-12 h-12 sm:w-14 sm:h-14 text-gold/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.75} points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Area badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
          <span className="pill text-[10px] sm:text-xs">{project.area} {t('areaLabel')}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gold text-navy text-xs font-bold px-4 py-2 rounded-full">
            {t('viewProject')}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3.5 sm:p-4">
        <h3 className="font-heading font-black text-sm leading-snug mb-0.5 text-white group-hover:text-gold-light transition-colors">
          {project.client}
        </h3>
        <p className="text-white/40 text-xs">{project.exhibition}</p>
      </div>
    </motion.article>
  );
}

export default function Portfolio({ projects }) {
  const t = useTranslations('portfolio');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selected,     setSelected]     = useState(null);

  const filters  = Object.keys(CATEGORY_KEYS);
  const filtered = activeFilter === 'all' ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="portfolio" className="py-16 sm:py-24 md:py-32 bg-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
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

        {/* Filter tabs — scrollable on mobile */}
        <motion.div
          className="flex gap-2 mb-7 sm:mb-10 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-2 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-gold text-navy'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t(CATEGORY_KEYS[f])}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <PortfolioCard
                key={project.id}
                project={project}
                index={i}
                t={t}
                onClick={() => setSelected(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-white/30 py-16 text-sm">{t('noProjects')}</p>
        )}
      </div>

      {selected && <Lightbox project={selected} onClose={() => setSelected(null)} t={t} />}
    </section>
  );
}
