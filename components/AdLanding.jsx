'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhoneField from './PhoneField';
import useMarketing from './useMarketing';
import '@/app/landing.css';

const LOGO_URL =
  'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

/**
 * Copy shipped with the page.
 *
 * These are defaults, not the only source: whatever `adLanding` holds in the
 * locale content overrides them field by field. That matters because the
 * Russian content document already lives in Blob, so a key added to the
 * repository file would never reach the live Russian page on its own.
 */
const DEFAULTS = {
  ru: {
    eyebrow: 'Заявка на выставочный стенд',
    headline: 'Стенд, который заметят',
    lead: 'Проектируем, производим и монтируем выставочные стенды под ключ в Ташкенте и по всей Центральной Азии. Один подрядчик на весь цикл — от эскиза до демонтажа.',
    formTitle: 'Получить расчёт',
    formNote: 'Ответим в течение часа в рабочее время. Первая консультация и предварительный расчёт — бесплатно.',
    submit: 'Получить расчёт',
    sentTitle: 'Заявка принята',
    sentText: 'Менеджер свяжется с вами в течение часа и уточнит детали проекта.',
    benefitsTitle: 'Что вы получаете',
    benefits: [
      'Концепция и 3D-визуализация до начала работ — вы видите стенд заранее',
      'Собственное производство: сроки и качество не зависят от подрядчиков',
      'Монтаж и демонтаж своей бригадой в сроки застройки площадки',
      'Логистика и таможня при участии в зарубежных выставках',
      'Технический специалист на стенде все дни выставки',
    ],
    contactTitle: 'Или позвоните прямо сейчас',
    privacy: 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных.',
    nameLabel: 'Имя', companyLabel: 'Компания', phoneLabel: 'Телефон',
    expoLabel: 'Выставка', messageLabel: 'Задача',
    namePlaceholder: 'Как к вам обращаться',
    companyPlaceholder: 'Название компании',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'Например, UzBuild',
    messagePlaceholder: 'Площадь стенда, сроки, пожелания',
  },
  en: {
    eyebrow: 'Exhibition stand enquiry',
    headline: 'A stand they will notice',
    lead: 'We design, build and install turnkey exhibition stands in Tashkent and across Central Asia. One contractor for the whole cycle — from sketch to dismantling.',
    formTitle: 'Request a quote',
    formNote: 'We reply within an hour during business hours. First consultation and draft estimate are free.',
    submit: 'Request a quote',
    sentTitle: 'Request received',
    sentText: 'A manager will contact you within an hour to go through the details.',
    benefitsTitle: 'What you get',
    benefits: [
      'Concept and 3D visualisation before any work starts — you see the stand in advance',
      'Our own production facility: timing and quality do not depend on subcontractors',
      'Installation and dismantling by our own crew, on the venue build schedule',
      'Logistics and customs handled for exhibitions abroad',
      'A technician on the stand every day of the show',
    ],
    contactTitle: 'Or call us right now',
    privacy: 'By submitting the form you agree to the processing of your personal data.',
    nameLabel: 'Name', companyLabel: 'Company', phoneLabel: 'Phone',
    expoLabel: 'Exhibition', messageLabel: 'Brief',
    namePlaceholder: 'Your name',
    companyPlaceholder: 'Company name',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'For example, UzBuild',
    messagePlaceholder: 'Stand area, dates, requirements',
  },
  uz: {
    eyebrow: 'Ko’rgazma stendi uchun ariza',
    headline: 'E’tiborni tortadigan stend',
    lead: 'Toshkentda va butun Markaziy Osiyoda ko’rgazma stendlarini loyihalaymiz, ishlab chiqaramiz va o’rnatamiz. Eskizdan demontajgacha — bitta pudratchi.',
    formTitle: 'Hisob-kitob olish',
    formNote: 'Ish vaqtida bir soat ichida javob beramiz. Birinchi maslahat va dastlabki hisob-kitob bepul.',
    submit: 'Hisob-kitob olish',
    sentTitle: 'Ariza qabul qilindi',
    sentText: 'Menejer bir soat ichida bog’lanadi va loyiha tafsilotlarini aniqlaydi.',
    benefitsTitle: 'Siz nima olasiz',
    benefits: [
      'Ish boshlanishidan oldin konsepsiya va 3D vizualizatsiya',
      'O’z ishlab chiqarishimiz: muddat va sifat pudratchilarga bog’liq emas',
      'Montaj va demontaj o’z brigadamiz tomonidan',
      'Chet el ko’rgazmalarida logistika va bojxona',
      'Ko’rgazmaning barcha kunlarida stendda texnik mutaxassis',
    ],
    contactTitle: 'Yoki hoziroq qo’ng’iroq qiling',
    privacy: 'Tugmani bosish orqali shaxsiy ma’lumotlaringizni qayta ishlashga rozilik bildirasiz.',
    nameLabel: 'Ism', companyLabel: 'Kompaniya', phoneLabel: 'Telefon',
    expoLabel: 'Ko’rgazma', messageLabel: 'Vazifa',
    namePlaceholder: 'Ismingiz',
    companyPlaceholder: 'Kompaniya nomi',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'Masalan, UzBuild',
    messagePlaceholder: 'Stend maydoni, muddatlar, talablar',
  },
};

const METRIKA_ID = 108497871;

export default function AdLanding({ locale = 'ru', settings = {}, overrides = {} }) {
  const base = DEFAULTS[locale] || DEFAULTS.ru;
  const t = { ...base, ...Object.fromEntries(Object.entries(overrides || {}).filter(([, v]) => v)) };

  const contact  = settings.contact || {};
  const counters = Array.isArray(settings.counters) ? settings.counters.slice(0, 4) : [];

  const getMarketing = useMarketing();
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    setBusy(true);
    setError('');
    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      source: 'ads',
      locale,
      marketing: getMarketing(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad response');

      // Conversion goal, so the ad platforms can optimise on real leads.
      try { window.ym?.(METRIKA_ID, 'reachGoal', 'lead_ads'); } catch { /* blocked */ }
      setSent(true);
    } catch {
      setError(
        locale === 'en' ? 'Could not send. Please call us instead.'
        : locale === 'uz' ? 'Yuborib bo’lmadi. Iltimos, qo’ng’iroq qiling.'
        : 'Не удалось отправить. Позвоните нам, пожалуйста.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Deliberately no navigation: this page is bought traffic and every
          extra link is a way out of the funnel. Logo and phone only. */}
      <header
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap',
          padding: '24px clamp(20px, 4vw, 80px)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <Image src={LOGO_URL} alt="ExpoContact" width={150} height={36}
          style={{ height: 28, width: 'auto' }} unoptimized priority />
        {contact.phone && (
          <a href={`tel:${contact.phoneRaw || contact.phone}`} className="mono mono--bright">
            {contact.phone}
          </a>
        )}
      </header>

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <span className="eyebrow">{t.eyebrow}</span>

          <div
            style={{
              display: 'grid', gap: 'clamp(32px, 5vw, 72px)',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 560px)',
              alignItems: 'start', marginTop: 28,
            }}
            className="lp-grid"
          >
            <div>
              <h1 className="section-title" style={{ margin: 0 }}>{t.headline}</h1>
              <p className="hero__lead" style={{ marginTop: 20, maxWidth: '46ch' }}>{t.lead}</p>

              {counters.length > 0 && (
                <div className="counters" style={{ marginTop: 44 }}>
                  {counters.map((c, i) => (
                    <div className="counter" key={i}>
                      <div className="counter__num">
                        {c.target}{c.suffix ? <sup>{c.suffix}</sup> : null}
                      </div>
                      <div className="counter__label">{c.label}</div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="mono mono--bright" style={{ marginTop: 56, marginBottom: 18 }}>
                {t.benefitsTitle}
              </h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14, maxWidth: '54ch' }}>
                {t.benefits.map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                    <span className="mono mono--accent" style={{ flexShrink: 0 }}>
                      /{String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ color: 'rgba(245,245,242,.66)', fontSize: 15, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>

              {contact.phone && (
                <div style={{ marginTop: 48 }}>
                  <p className="mono" style={{ marginBottom: 10 }}>{t.contactTitle}</p>
                  <a href={`tel:${contact.phoneRaw || contact.phone}`} className="btn-ghost">
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>

            {/* ── Form ─────────────────────────────────────────────────── */}
            <div>
              {sent ? (
                <div className="form" style={{ textAlign: 'center', padding: 'clamp(32px, 5vw, 56px)' }}>
                  <p className="form__head-title" style={{ marginBottom: 12 }}>{t.sentTitle}</p>
                  <p style={{ color: 'rgba(245,245,242,.6)', fontSize: 15, lineHeight: 1.6 }}>{t.sentText}</p>
                  {contact.phone && (
                    <a href={`tel:${contact.phoneRaw || contact.phone}`} className="btn-ghost" style={{ marginTop: 28 }}>
                      {contact.phone}
                    </a>
                  )}
                </div>
              ) : (
                <form className="form" onSubmit={submit} noValidate>
                  <div className="form__head">
                    <p className="form__head-title">{t.formTitle}</p>
                    <p className="form__head-meta">{t.formNote}</p>
                  </div>

                  <div className="form__row">
                    <div className="field">
                      <label>{t.nameLabel} <span className="req">*</span></label>
                      <input type="text" name="name" required placeholder={t.namePlaceholder} />
                    </div>
                    <div className="field">
                      <label>{t.companyLabel}</label>
                      <input type="text" name="company" placeholder={t.companyPlaceholder} />
                    </div>
                  </div>

                  <div className="form__row">
                    <div className="field">
                      <label>{t.phoneLabel} <span className="req">*</span></label>
                      <PhoneField locale={locale} placeholder={t.phonePlaceholder} />
                    </div>
                    <div className="field">
                      <label>{t.expoLabel}</label>
                      <input type="text" name="event" placeholder={t.expoPlaceholder} />
                    </div>
                  </div>

                  <div className="form__row">
                    <div className="field field--span">
                      <label>{t.messageLabel}</label>
                      <textarea name="message" rows={3} placeholder={t.messagePlaceholder} />
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</p>
                  )}

                  <button type="submit" className="btn-submit" disabled={busy} style={{ marginTop: 24 }}>
                    <span className="btn-submit__label">{t.submit}</span>
                    <span className="btn-submit__circle" aria-hidden>
                      <svg className="a1" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 6 H20 M15 1 L20 6 L15 11" />
                      </svg>
                      <svg className="a2" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 6 H20 M15 1 L20 6 L15 11" />
                      </svg>
                    </span>
                  </button>

                  <p className="mono" style={{ marginTop: 18, textTransform: 'none', letterSpacing: 0, lineHeight: 1.5 }}>
                    {t.privacy}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 980px) {
          .lp-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </main>
  );
}
