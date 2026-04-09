'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ value, suffix, duration = 2000 }) {
  const [count,  setCount]  = useState(0);
  const ref                 = useRef(null);
  const isInView            = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!isInView) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
      else setCount(value);
    };
    requestAnimationFrame(tick);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function Stats() {
  const t     = useTranslations('stats');
  const items = t.raw('items');

  return (
    <section id="about" className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Decorative lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-charcoal/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <motion.p
          className="text-center text-white/25 text-[10px] tracking-[0.4em] uppercase mb-8 md:mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative group bg-navy/80 hover:bg-charcoal transition-colors duration-500 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center gap-2 md:gap-3"
            >
              {/* Gold number */}
              <p
                className="font-heading font-black text-gradient-gold leading-none"
                style={{ fontSize: 'clamp(1.8rem, 6vw, 5rem)' }}
              >
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </p>

              {/* Label */}
              <p className="text-white/45 text-xs sm:text-sm text-center font-medium leading-snug max-w-[110px] sm:max-w-[140px]">
                {item.label}
              </p>

              {/* Hover gold line */}
              <div className="absolute bottom-0 left-4 right-4 sm:left-8 sm:right-8 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />

              {/* Decorative position number — hidden on small mobile */}
              <span
                className="absolute top-2 right-2 sm:top-4 sm:right-4 font-heading font-black text-white/5 select-none hidden sm:block"
                style={{ fontSize: 40 }}
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
