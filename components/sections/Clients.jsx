'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

// Generates a simple SVG text logo as a placeholder when no image is provided
function LogoPlaceholder({ name }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="w-28 h-14 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
      <span className="font-heading font-black text-sm text-white/40 tracking-widest">
        {initials}
      </span>
    </div>
  );
}

function ClientLogo({ client }) {
  const hasLogo =
    client.logo &&
    !client.logo.includes('client-') &&
    !client.logo.includes('placeholder');

  if (!hasLogo) return <LogoPlaceholder name={client.name} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={client.logo}
      alt={client.name}
      className="h-10 w-auto object-contain grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
      loading="lazy"
    />
  );
}

export default function Clients({ clients }) {
  const t = useTranslations('clients');

  // Duplicate list for seamless infinite scroll
  const doubled = [...clients, ...clients];

  return (
    <section className="py-20 md:py-28 bg-charcoal border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-white/30 text-xs tracking-widest uppercase mb-3">{t('title')}</p>
          <p className="text-white/50 text-base">{t('subtitle')}</p>
        </motion.div>
      </div>

      {/* ── Infinite marquee track ─────────────────────────────────────── */}
      <div className="clients-marquee-wrapper relative">
        {/* Fade masks on edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-charcoal to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-charcoal to-transparent" />

        <div
          className="flex gap-12 items-center w-max animate-marquee"
          style={{ '--marquee-duration': '35s' }}
        >
          {doubled.map((client, i) => (
            <div
              key={`${client.id}-${i}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              {client.website ? (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={client.name}
                  title={client.name}
                >
                  <ClientLogo client={client} />
                </a>
              ) : (
                <div title={client.name}>
                  <ClientLogo client={client} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pause-on-hover — injected as a regular style tag (no styled-jsx needed) */}
      <style>{`
        .clients-marquee-wrapper:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
