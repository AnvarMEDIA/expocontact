'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhoneField from './PhoneField';
import useMarketing from './useMarketing';
import { QUALIFIERS } from '@/lib/leadFields';
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
 *
 * The wording of the three pill questions is not here — it lives in
 * lib/leadFields.js next to the values they store.
 */
const DEFAULTS = {
  ru: {
    eyebrow: 'Заявка на выставочный стенд',
    headline: 'Стенд, который заметят',
    lead: 'Проектируем, производим и монтируем выставочные стенды под ключ в Ташкенте и по всей Центральной Азии. Один подрядчик на весь цикл — от эскиза до демонтажа.',
    formTitle: 'Бриф на расчёт стенда',
    formNote: 'Ответим в течение часа',
    formHint: 'Семь вопросов в один шаг — займёт около минуты. Расчёт и первая консультация бесплатны.',
    submit: 'Отправить бриф',
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
    expoLabel: 'Выставка и площадка', messageLabel: 'Задача',
    namePlaceholder: 'Как к вам обращаться',
    companyPlaceholder: 'Название компании',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'Например, UzBuild, Ташкент',
    messagePlaceholder: 'Что важно учесть: зонирование, оборудование, фирменный стиль',
  },
  en: {
    eyebrow: 'Exhibition stand enquiry',
    headline: 'A stand they will notice',
    lead: 'We design, build and install turnkey exhibition stands in Tashkent and across Central Asia. One contractor for the whole cycle — from the first sketch to dismantling.',
    formTitle: 'Stand project brief',
    formNote: 'We reply within an hour',
    formHint: 'Seven questions in a single step — about a minute. The quote and the first consultation are free.',
    submit: 'Send the brief',
    sentTitle: 'Request received',
    sentText: 'A manager will call you within an hour to go through the details.',
    benefitsTitle: 'What you get',
    benefits: [
      'Concept and 3D visualisation before the build — you see the stand in advance',
      'Our own production: deadlines and quality do not depend on subcontractors',
      'Installation and dismantling by our own crew within the venue schedule',
      'Logistics and customs for exhibitions abroad',
      'A technician on the stand every day of the show',
    ],
    contactTitle: 'Or call us right now',
    privacy: 'By submitting the form you agree to the processing of personal data.',
    nameLabel: 'Name', companyLabel: 'Company', phoneLabel: 'Phone',
    expoLabel: 'Exhibition and venue', messageLabel: 'Your brief',
    namePlaceholder: 'How should we address you',
    companyPlaceholder: 'Company name',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'For example, UzBuild, Tashkent',
    messagePlaceholder: 'What matters: zoning, equipment, brand identity',
  },
  uz: {
    eyebrow: 'Ko’rgazma stendi uchun ariza',
    headline: 'E’tiborni tortadigan stend',
    lead: 'Toshkentda va butun Markaziy Osiyoda ko’rgazma stendlarini loyihalaymiz, ishlab chiqaramiz va o’rnatamiz. Eskizdan demontajgacha — bitta pudratchi.',
    formTitle: 'Stend uchun brif',
    formNote: 'Bir soat ichida javob beramiz',
    formHint: 'Bir bosqichda yetti savol — taxminan bir daqiqa. Hisob-kitob va birinchi maslahat bepul.',
    submit: 'Brifni yuborish',
    sentTitle: 'Ariza qabul qilindi',
    sentText: 'Menejer bir soat ichida bog’lanib, loyiha tafsilotlarini aniqlaydi.',
    benefitsTitle: 'Siz nima olasiz',
    benefits: [
      'Ishlar boshlanishidan oldin konsepsiya va 3D vizualizatsiya — stendni oldindan ko’rasiz',
      'O’z ishlab chiqarishimiz: muddat va sifat pudratchilarga bog’liq emas',
      'Maydon jadvaliga mos ravishda o’z brigadamiz bilan montaj va demontaj',
      'Xorijiy ko’rgazmalarda logistika va bojxona',
      'Ko’rgazmaning barcha kunlarida stendda texnik mutaxassis',
    ],
    contactTitle: 'Yoki hoziroq qo’ng’iroq qiling',
    privacy: 'Tugmani bosish orqali siz shaxsiy ma’lumotlarni qayta ishlashga rozilik bildirasiz.',
    nameLabel: 'Ism', companyLabel: 'Kompaniya', phoneLabel: 'Telefon',
    expoLabel: 'Ko’rgazma va maydon', messageLabel: 'Vazifa',
    namePlaceholder: 'Sizga qanday murojaat qilaylik',
    companyPlaceholder: 'Kompaniya nomi',
    phonePlaceholder: '90 123-45-67',
    expoPlaceholder: 'Masalan, UzBuild, Toshkent',
    messagePlaceholder: 'Nima muhim: zonalash, jihozlar, firma uslubi',
  },
};

const METRIKA_ID = 108497871;

/** The three qualifying questions, in the order they are asked. */
const PILL_QUESTIONS = ['area', 'standType', 'timing'];

/**
 * One qualifying question answered by tapping a pill.
 *
 * A pill beats a dropdown here: every option is visible at once, it is one tap
 * on a phone, and the answer stays a stable key rather than the label shown.
 */
function PillQuestion({ id, locale, value, onChange }) {
  const q = QUALIFIERS[id];
  const label = q.label[locale] || q.label.ru;

  return (
    <div className="field field--tags">
      <label id={`q-${id}`}>{label}</label>
      <div className="tags" role="group" aria-labelledby={`q-${id}`}>
        {q.options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              className={`tag${active ? ' is-active' : ''}`}
              aria-pressed={active}
              // Tapping the chosen pill again clears it — the question is
              // optional and a visitor must be able to take an answer back.
              onClick={() => onChange(active ? '' : o.value)}
            >
              {o[locale] || o.ru}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdLanding({ locale = 'ru', settings = {}, overrides = {} }) {
  const base = DEFAULTS[locale] || DEFAULTS.ru;
  const t = { ...base, ...Object.fromEntries(Object.entries(overrides || {}).filter(([, v]) => v)) };

  const contact  = settings.contact || {};
  const counters = Array.isArray(settings.counters) ? settings.counters.slice(0, 4) : [];

  const getMarketing = useMarketing();
  const [sent, setSent]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState({});

  const pick = (id) => (value) => setDetails((d) => ({ ...d, [id]: value }));

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    setBusy(true);
    setError('');

    // The pill answers are React state, not form controls, so they are added
    // here rather than picked up by FormData.
    const answered = Object.fromEntries(Object.entries(details).filter(([, v]) => v));
    const payload = {
      ...Object.fromEntries(new FormData(form).entries()),
      details: Object.keys(answered).length ? answered : undefined,
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

  const phoneLink = contact.phone && (
    <a href={`tel:${contact.phoneRaw || contact.phone}`} className="btn-ghost">{contact.phone}</a>
  );

  return (
    <main className="lp" style={{ minHeight: '100vh' }}>
      {/* Deliberately no navigation: this page is bought traffic and every
          extra link is a way out of the funnel. Logo and phone only. */}
      <header className="lp-header">
        <Image src={LOGO_URL} alt="ExpoContact" width={150} height={36}
          style={{ height: 28, width: 'auto' }} unoptimized priority />
        {contact.phone && (
          <a href={`tel:${contact.phoneRaw || contact.phone}`} className="mono mono--bright">
            {contact.phone}
          </a>
        )}
      </header>

      <section className="section lp-section">
        <div className="wrap">
          {/* ── Pitch, kept short: the form below is the point of the page ── */}
          <div className="lp-intro">
            <span className="eyebrow">{t.eyebrow}</span>
            <h1 className="section-title lp-title">{t.headline}</h1>
            <p className="hero__lead lp-lead">{t.lead}</p>

            {counters.length > 0 && (
              <div className="counters lp-counters">
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
          </div>

          {/* ── The form: centre stage, one step ─────────────────────────── */}
          <div className="lp-form" id="brief">
            {sent ? (
              <div className="form" style={{ textAlign: 'center', padding: 'clamp(40px, 6vw, 72px)' }}>
                <p className="form__head-title" style={{ marginBottom: 12 }}>{t.sentTitle}</p>
                <p style={{ color: 'rgba(245,245,242,.6)', fontSize: 15, lineHeight: 1.6 }}>{t.sentText}</p>
                {contact.phone && <div style={{ marginTop: 28 }}>{phoneLink}</div>}
              </div>
            ) : (
              <form className="form" onSubmit={submit} noValidate>
                <div className="form__head">
                  <p className="form__head-title">{t.formTitle}</p>
                  <p className="form__head-meta">{t.formNote}</p>
                </div>

                {t.formHint && <p className="lp-form-hint">{t.formHint}</p>}

                <div className="form__row">
                  <div className="field">
                    <label>{t.nameLabel} <span className="req">*</span></label>
                    <input type="text" name="name" required placeholder={t.namePlaceholder} />
                  </div>
                  <div className="field">
                    <label>{t.phoneLabel} <span className="req">*</span></label>
                    <PhoneField locale={locale} placeholder={t.phonePlaceholder} />
                  </div>
                </div>

                <div className="form__row">
                  <div className="field">
                    <label>{t.companyLabel}</label>
                    <input type="text" name="company" placeholder={t.companyPlaceholder} />
                  </div>
                  <div className="field">
                    <label>{t.expoLabel}</label>
                    <input type="text" name="event" placeholder={t.expoPlaceholder} />
                  </div>
                </div>

                {PILL_QUESTIONS.map((id) => (
                  <div className="form__row" key={id}>
                    <PillQuestion id={id} locale={locale} value={details[id] || ''} onChange={pick(id)} />
                  </div>
                ))}

                <div className="form__row">
                  <div className="field field--span">
                    <label>{t.messageLabel}</label>
                    <textarea name="message" rows={3} placeholder={t.messagePlaceholder} />
                  </div>
                </div>

                {error && <p className="lp-error">{error}</p>}

                <button type="submit" className="btn-submit" disabled={busy} style={{ marginTop: 28 }}>
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

                <p className="mono lp-privacy">{t.privacy}</p>
              </form>
            )}
          </div>

          {/* ── Reassurance, after the ask ───────────────────────────────── */}
          <div className="lp-after">
            <h2 className="mono mono--bright lp-benefits-title">{t.benefitsTitle}</h2>
            <ul className="lp-benefits">
              {t.benefits.map((b, i) => (
                <li key={i}>
                  <span className="mono mono--accent">/{String(i + 1).padStart(2, '0')}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {contact.phone && (
              <div className="lp-call">
                <p className="mono" style={{ marginBottom: 12 }}>{t.contactTitle}</p>
                {phoneLink}
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        /* landing.css hides the system cursor in favour of the custom one on
           the main page, which this page does not render: bring it back.
           Keep this block free of apostrophes and angle brackets: the server
           escapes them as entities, the browser does not decode entities in
           a style element, and the mismatch breaks hydration. */
        .lp a, .lp button, .lp .tag { cursor: pointer; }

        .lp-header{
          display:flex; align-items:center; justify-content:space-between;
          gap:24px; flex-wrap:wrap;
          padding:24px clamp(20px, 4vw, 80px);
          border-bottom:1px solid var(--line);
        }
        .lp-section{ padding-top:clamp(40px, 6vw, 84px); padding-bottom:clamp(64px, 9vw, 140px); }

        .lp-intro{ max-width:940px; margin:0 auto; text-align:center; }
        .lp-title{ margin:18px 0 0; }
        .lp-lead{ margin:22px auto 0; max-width:60ch; }
        .lp-counters{ margin-top:40px; justify-content:center; }

        /* The form is the page: wide, centred, and the first thing reachable. */
        .lp-form{ max-width:900px; margin:clamp(40px, 6vw, 72px) auto 0; }
        .lp-form .form{ padding:clamp(24px, 3.2vw, 52px); }
        .lp-form-hint{
          color:rgba(245,245,242,.5); font-size:14px; line-height:1.55;
          margin:-14px 0 22px;
        }
        .lp-error{ color:#ff6b6b; font-size:14px; margin-top:18px; }
        .lp-privacy{
          margin-top:18px; text-transform:none; letter-spacing:0; line-height:1.5;
        }

        .lp-after{ max-width:1000px; margin:clamp(56px, 8vw, 104px) auto 0; }
        .lp-benefits-title{ text-align:center; margin:0 0 26px; }
        .lp-benefits{
          list-style:none; margin:0; padding:0;
          display:grid; gap:18px 32px;
          grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
        }
        .lp-benefits li{ display:flex; gap:14px; align-items:baseline; }
        .lp-benefits li span:last-child{
          color:rgba(245,245,242,.66); font-size:15px; line-height:1.6;
        }
        .lp-call{ margin-top:clamp(40px, 6vw, 64px); text-align:center; }

        @media (max-width: 600px){
          .lp-header{ padding:18px 20px; }
          .lp-form .form{ padding:22px 18px; }
          .lp-form-hint{ margin:-10px 0 18px; font-size:13px; }
          /* Full-width tap targets beat a cramped two-up row on a phone. */
          .lp .tags{ gap:8px; }
          .lp .tag{ padding:11px 15px; }
        }
      `}</style>
    </main>
  );
}
