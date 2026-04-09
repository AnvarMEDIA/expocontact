'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';

// Animates a number from 0 to target when visible
function AnimatedCounter({ value, suffix, label }) {
  const [count, setCount]   = useState(0);
  const ref                 = useRef(null);
  const isInView            = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;

    const duration  = 1800;
    const start     = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isInView, value]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <span className="font-heading font-black text-5xl md:text-6xl text-gradient-gold">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-white/50 text-sm md:text-base text-center">{label}</span>
    </div>
  );
}

export default function Stats() {
  const t     = useTranslations('stats');
  const items = t.raw('items');

  return (
    <section
      id="about"
      className="bg-charcoal py-20 md:py-28 border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Optional section title */}
        <motion.p
          className="text-center text-white/30 text-xs tracking-widest uppercase mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <AnimatedCounter
                value={item.value}
                suffix={item.suffix}
                label={item.label}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
