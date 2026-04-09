'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const INPUT_CLASS =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-gold/60 transition-colors duration-200';

const LABEL_CLASS = 'block text-xs text-white/40 font-semibold uppercase tracking-wider mb-1.5';

export default function Contact() {
  const t = useTranslations('contact');

  const [form, setForm] = useState({
    name: '', company: '', phone: '', expo: '', message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm({ name: '', company: '', phone: '', expo: '', message: '' });
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section id="contacts" className="py-24 md:py-32 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-black text-3xl md:text-5xl mb-4 heading-accent-center">
            {t('title')}
          </h2>
          <p className="text-white/50 text-lg">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Form ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-charcoal rounded-2xl p-6 md:p-8 border border-white/5">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  /* Success state */
                  <motion.div
                    key="success"
                    className="flex flex-col items-center justify-center py-16 gap-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-gold/15 flex items-center justify-center border-2 border-gold/40">
                      <motion.svg
                        className="w-10 h-10 text-gold"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                      >
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    </div>
                    <div className="text-center">
                      <p className="font-heading font-black text-2xl text-white mb-2">
                        {t('successTitle')}
                      </p>
                      <p className="text-white/50">{t('successText')}</p>
                    </div>
                  </motion.div>
                ) : (
                  /* Form */
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{t('formName')}</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={set('name')}
                          placeholder="Иван Иванов"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{t('formCompany')}</label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={set('company')}
                          placeholder="ООО «Компания»"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{t('formPhone')}</label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={set('phone')}
                          placeholder="+998 90 000-00-00"
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{t('formExpo')}</label>
                        <input
                          type="text"
                          value={form.expo}
                          onChange={set('expo')}
                          placeholder="UzBuild 2024"
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>{t('formMessage')}</label>
                      <textarea
                        rows={4}
                        value={form.message}
                        onChange={set('message')}
                        placeholder="Площадь стенда, сроки, пожелания..."
                        className={`${INPUT_CLASS} resize-none`}
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-red-400 text-sm">
                        Ошибка отправки. Пожалуйста, попробуйте ещё раз.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-4 bg-gold text-navy font-bold text-sm rounded-xl hover:bg-gold-light transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Отправка...
                        </>
                      ) : (
                        t('formSubmit')
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Right: Contact info + map ──────────────────────────────── */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <ContactInfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                }
                label="Телефоны"
              >
                <a href="tel:+998712000000" className="block hover:text-gold transition-colors">{t('phone1')}</a>
                <a href="tel:+998901234567" className="block hover:text-gold transition-colors">{t('phone2')}</a>
              </ContactInfoCard>

              {/* Address */}
              <ContactInfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                }
                label="Адрес"
              >
                <span>{t('address')}</span>
              </ContactInfoCard>

              {/* Hours */}
              <ContactInfoCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Режим работы"
              >
                <span>{t('hours')}</span>
              </ContactInfoCard>

              {/* WhatsApp */}
              <ContactInfoCard
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                }
                label="Мессенджер"
              >
                <a
                  href="https://wa.me/998901234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors font-semibold"
                >
                  {t('whatsapp')} →
                </a>
              </ContactInfoCard>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-charcoal aspect-[16/9] flex items-center justify-center">
              <div className="text-center">
                <svg className="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-white/30 text-sm">г. Ташкент, ул. Амира Темура, 107Б</p>
                <a
                  href="https://maps.google.com/?q=Tashkent+Amir+Temur+107B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold text-xs hover:underline mt-2 inline-block"
                >
                  Открыть в Google Maps →
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function ContactInfoCard({ icon, label, children }) {
  return (
    <div className="bg-charcoal rounded-xl p-5 border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold/60">{icon}</span>
        <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-white/70 text-sm space-y-1">{children}</div>
    </div>
  );
}
