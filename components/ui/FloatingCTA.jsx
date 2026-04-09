'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

/**
 * Floating "Оставить заявку" button — visible only on mobile (md:hidden).
 * Appears after a short delay. Clicking opens the contact modal.
 */
export default function FloatingCTA({ onClick }) {
  const t = useTranslations('nav');

  return (
    <motion.div
      className="fixed bottom-6 right-4 z-40 md:hidden"
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2, duration: 0.5, type: 'spring', stiffness: 200 }}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-5 py-3.5 bg-gold text-navy font-bold text-sm rounded-full shadow-xl shadow-gold/30 hover:bg-gold-light transition-colors active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {t('cta')}
      </button>
    </motion.div>
  );
}
