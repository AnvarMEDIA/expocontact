/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Brand colors ───────────────────────────────────────
      colors: {
        navy:    'var(--color-navy)',
        gold:    'var(--color-gold)',
        charcoal:'var(--color-charcoal)',
        'gold-light': 'var(--color-gold-light)',
        'gold-dark':  'var(--color-gold-dark)',
      },
      // ─── Typography ─────────────────────────────────────────
      fontFamily: {
        heading: ['var(--font-montserrat)', 'sans-serif'],
        body:    ['var(--font-inter)',       'sans-serif'],
      },
      // ─── Animation ──────────────────────────────────────────
      animation: {
        'marquee':       'marquee 35s linear infinite',
        'marquee-pause': 'marquee 35s linear infinite paused',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
