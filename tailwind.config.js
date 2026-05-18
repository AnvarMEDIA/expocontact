/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // legacy (admin / /new)
        navy:    'var(--color-navy)',
        gold:    'var(--color-gold)',
        charcoal:'var(--color-charcoal)',
        'gold-light': 'var(--color-gold-light)',
        'gold-dark':  'var(--color-gold-dark)',
        // new landing — brand palette from the standalone
        void:        'var(--bg-void)',
        elevated:    'var(--bg-elevated)',
        surface:     'var(--bg-surface)',
        paper:       'var(--bg-paper)',
        'text-pri':  'var(--text-primary)',
        'text-mut':  'var(--text-muted)',
        line:        'var(--line)',
        'brand-orange': 'var(--accent-primary)',
        'brand-blue':   'var(--accent-secondary)',
      },
      fontFamily: {
        heading: ['var(--font-montserrat)', 'sans-serif'],
        body:    ['var(--font-inter)',       'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
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
