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
    <section id="about" className="relative py-24 md:py-32 overflow-hidden">
      {/* Декоративная горизонтальная линия */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Фон секции */}
      <div className="absolute inset-0 bg-charcoal/60" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Метка секции */}
        <motion.p
          className="text-center text-white/25 text-[10px] tracking-[0.4em] uppercase mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t('title')}
        </motion.p>

        {/* Сетка статистики */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative group bg-navy/80 hover:bg-charcoal transition-colors duration-500 p-8 md:p-10 flex flex-col items-center gap-3"
            >
              {/* Золотое число */}
              <p className="font-heading font-black text-gradient-gold leading-none"
                 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}>
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </p>

              {/* Подпись */}
              <p className="text-white/45 text-sm text-center font-medium leading-snug max-w-[120px]">
                {item.label}
              </p>

              {/* Золотая полоска снизу при hover */}
              <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />

              {/* Номер позиции */}
              <span
                className="absolute top-4 right-4 font-heading font-black text-white/5 select-none"
                style={{ fontSize: 48 }}
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
