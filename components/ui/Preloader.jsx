'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const LOGO =
  'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

/**
 * Preloader — показывается один раз за сессию.
 * Анимация: логотип → прогресс-бар → шторка вверх.
 */
export default function Preloader({ onComplete }) {
  const [count,   setCount]   = useState(0);
  const [visible, setVisible] = useState(true);

  const finish = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    const DURATION = 2200;
    let start = null;
    let raf;

    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / DURATION, 1);
      // ease-out quart
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCount(100);
        // Небольшая пауза на 100% — потом прячем
        setTimeout(finish, 500);
      }
    };

    // Небольшая задержка перед стартом
    const id = setTimeout(() => { raf = requestAnimationFrame(tick); }, 200);
    return () => { clearTimeout(id); cancelAnimationFrame(raf); };
  }, [finish]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#06090F' }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* ── Сетка ──────────────────────────────────────────────────── */}
          <div className="absolute inset-0 grid-bg opacity-25" />

          {/* ── Орб ────────────────────────────────────────────────────── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 600, height: 600,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle at 50% 50%, rgba(212,168,67,0.14) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* ── Сканирующая линия ──────────────────────────────────────── */}
          <div
            aria-hidden
            className="absolute left-0 right-0 h-px scan-line pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(212,168,67,0.5) 30%, rgba(212,168,67,0.8) 50%, rgba(212,168,67,0.5) 70%, transparent)',
            }}
          />

          {/* ── Основной контент ───────────────────────────────────────── */}
          <div className="relative z-10 flex flex-col items-center gap-10">

            {/* Логотип */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={LOGO}
                alt="ExpoContact"
                width={220}
                height={55}
                className="h-11 w-auto"
                priority
                unoptimized
              />
            </motion.div>

            {/* Блок прогресса */}
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Прогресс-бар */}
              <div className="relative w-48 h-px bg-white/10 overflow-hidden rounded-full">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, var(--color-gold-dark), var(--color-gold-light))',
                    width: `${count}%`,
                  }}
                  transition={{ duration: 0.05 }}
                />
              </div>

              {/* Счётчик процентов */}
              <div className="flex items-baseline gap-1.5">
                <span
                  className="font-heading font-black tabular-nums text-gradient-gold"
                  style={{ fontSize: 48, lineHeight: 1 }}
                >
                  {count}
                </span>
                <span className="text-gold/50 font-bold text-lg">%</span>
              </div>

              {/* Подпись */}
              <p className="text-white/25 text-xs tracking-[0.25em] uppercase">
                Загрузка
              </p>
            </motion.div>
          </div>

          {/* ── Декоративные угловые линии ─────────────────────────────── */}
          {[
            'top-6 left-6 border-t border-l',
            'top-6 right-6 border-t border-r',
            'bottom-6 left-6 border-b border-l',
            'bottom-6 right-6 border-b border-r',
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`absolute w-8 h-8 border-gold/30 ${cls}`}
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
            />
          ))}

          {/* ── Маска снизу ────────────────────────────────────────────── */}
          <div
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(6,9,15,0.8) 0%, transparent 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
