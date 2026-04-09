'use client';

/**
 * AbstractBg — плавающие градиентные орбы + тонкая сетка.
 * Фиксированный слой под всем контентом сайта.
 */
export default function AbstractBg() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* ── Орб 1: золотой, верхний правый ─────────────────────────────── */}
      <div
        className="orb-1 absolute rounded-full"
        style={{
          width:  '70vw',
          height: '70vw',
          maxWidth:  900,
          maxHeight: 900,
          top:  '-20%',
          right: '-20%',
          background: 'radial-gradient(circle at 40% 40%, rgba(212,168,67,0.13) 0%, rgba(212,168,67,0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Орб 2: синий/индиго, левый нижний ──────────────────────────── */}
      <div
        className="orb-2 absolute rounded-full"
        style={{
          width:  '60vw',
          height: '60vw',
          maxWidth:  750,
          maxHeight: 750,
          bottom: '-15%',
          left:   '-15%',
          background: 'radial-gradient(circle at 60% 60%, rgba(30,50,120,0.25) 0%, rgba(15,25,80,0.12) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* ── Орб 3: малый золотой, центр ─────────────────────────────────── */}
      <div
        className="orb-3 absolute rounded-full"
        style={{
          width:  240,
          height: 240,
          top:  '45%',
          left: '55%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.09) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Тонкая сетка ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 grid-bg-fine opacity-60" />

      {/* ── Вертикальный градиентный fade снизу ─────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(10,15,30,0.6) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
