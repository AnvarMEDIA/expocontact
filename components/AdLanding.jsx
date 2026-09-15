'use client';

import { useState } from 'react';
import Image from 'next/image';
import PhoneField from './PhoneField';
import useMarketing from './useMarketing';
import { trackLead } from '@/lib/metaPixel';
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
    headline: 'Стенд, который заметят',
    lead: 'Проектируем, производим и монтируем выставочные стенды под ключ в Ташкенте и по всей Центральной Азии. Один подрядчик — от эскиза до демонтажа.',
    formNote: 'Отвечаем в течение часа',
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
    headline: 'A stand they will notice',
    lead: 'We design, build and install turnkey exhibition stands in Tashkent and across Central Asia. One contractor — from the first sketch to dismantling.',
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
    headline: 'E’tiborni tortadigan stend',
    lead: 'Toshkentda va butun Markaziy Osiyoda ko’rgazma stendlarini loyihalaymiz, ishlab chiqaramiz va o’rnatamiz. Eskizdan demontajgacha — bitta pudratchi.',
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

/** A counter such as { target: 5000, suffix: '+', label: 'Стендов / ...' } as a short badge phrase. */
function counterPhrase(c) {
  if (!c) return '';
  const noun = String(c.label || '').split('/')[0].trim().toLowerCase();
  return `${c.target}${c.suffix || ''} ${noun}`.trim();
}

/**
 * One qualifying question answered by tapping a chip.
 *
 * A chip beats a dropdown here: every option is visible at once, it is one tap
 * on a phone, and the answer stays a stable key rather than the label shown.
 */
function ChipQuestion({ id, locale, value, onChange }) {
  const q = QUALIFIERS[id];
  const label = q.label[locale] || q.label.ru;

  return (
    <div className="brief__field brief__field--wide">
      <span className="brief__label" id={`q-${id}`}>{label}</span>
      <div className="chips" role="group" aria-labelledby={`q-${id}`}>
        {q.options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              className={`chip${active ? ' is-active' : ''}`}
              aria-pressed={active}
              // Tapping the chosen chip again clears it — the question is
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

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M21 4 3 11.5l5.5 2L17 7l-6.5 8v5l3-3.5 4.5 3.5z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  ),
};

/**
 * Page styles, injected as raw HTML on purpose.
 *
 * A style tag written as JSX text is escaped by the server (quotes, apostrophes
 * and angle brackets become entities) but the browser does not decode entities
 * inside a style element, so the client sees different text and hydration
 * fails for the whole page. dangerouslySetInnerHTML skips that escaping. The
 * string is a constant of this file, never user content.
 */
const LP_CSS = `

        .lp{
          position:relative; overflow:hidden; isolation:isolate;
          min-height:100vh; padding-bottom:clamp(72px, 10vw, 140px);
          background:var(--bg-void); color:var(--text-primary);
          font-family:var(--f-body);
        }
        /* landing.css hides the system cursor on every button for the custom
           cursor of the main page, which this page does not render. */
        .lp a, .lp button, .lp select { cursor:pointer; }

        /* ── Backdrop: glow, faint columns, stars and the horizon arc ──── */
        .lp-bg{ position:absolute; inset:0; z-index:-1; pointer-events:none; }
        .lp-bg::before{
          content:""; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 55% at 50% 0%, rgba(232,101,28,.16), transparent 70%),
            radial-gradient(ellipse 45% 40% at 88% 18%, rgba(42,107,196,.14), transparent 70%),
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.5), transparent 100%),
            radial-gradient(1px 1px at 26% 41%, rgba(255,255,255,.35), transparent 100%),
            radial-gradient(1.5px 1.5px at 71% 22%, rgba(255,255,255,.45), transparent 100%),
            radial-gradient(1px 1px at 84% 47%, rgba(255,255,255,.35), transparent 100%),
            radial-gradient(1px 1px at 58% 12%, rgba(255,255,255,.3), transparent 100%),
            radial-gradient(1.5px 1.5px at 38% 8%, rgba(255,255,255,.4), transparent 100%),
            repeating-linear-gradient(90deg, rgba(255,255,255,.035) 0 1px, transparent 1px 22vw);
          background-position:0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0, 11vw 0;
          -webkit-mask-image:linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
          mask-image:linear-gradient(180deg, #000 0%, #000 55%, transparent 100%);
        }
        .lp-bg::after{
          content:""; position:absolute; left:50%; top:clamp(640px, 78vh, 900px);
          width:max(230vw, 2200px); aspect-ratio:1; border-radius:50%;
          transform:translateX(-50%);
          background:#070708;
          border:1px solid rgba(232,101,28,.38);
          box-shadow:0 -40px 120px rgba(232,101,28,.12), 0 -1px 0 rgba(232,101,28,.2);
        }

        /* ── Header ─────────────────────────────────────────────────────── */
        .lp-header{
          display:flex; align-items:center; justify-content:space-between; gap:20px;
          padding:22px clamp(20px, 4vw, 64px);
        }
        .lp-glass-btn{
          display:inline-flex; align-items:center; justify-content:center;
          padding:0 18px; height:42px; border-radius:12px;
          font-size:15px; font-weight:500; color:#fff; letter-spacing:.01em;
          background:linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.05));
          border:1px solid rgba(255,255,255,.16);
          box-shadow:0 1px 0 rgba(255,255,255,.14) inset, 0 12px 32px -14px rgba(255,255,255,.28);
          transition:background .25s, border-color .25s, transform .25s;
        }
        .lp-glass-btn:hover{ background:linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.08)); border-color:rgba(255,255,255,.26); }

        /* ── Hero ───────────────────────────────────────────────────────── */
        .lp-hero{
          max-width:760px; margin:clamp(56px, 9vw, 120px) auto 0;
          padding:0 20px; text-align:center;
        }
        .lp-badge{
          display:inline-flex; align-items:center; flex-wrap:wrap; justify-content:center;
          padding:6px 6px; border-radius:999px;
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.10);
          box-shadow:0 1px 0 rgba(255,255,255,.06) inset;
          font-size:14px; color:rgba(245,245,242,.82);
        }
        .lp-badge__item{
          display:inline-flex; align-items:center; gap:8px; padding:4px 12px;
          white-space:nowrap;
        }
        .lp-badge__item + .lp-badge__item{ border-left:1px solid rgba(255,255,255,.12); }
        .lp-badge__dot{
          width:7px; height:7px; border-radius:50%; background:#3FCB5A;
          box-shadow:0 0 10px #3FCB5A99; animation:livePulse 1.6s ease-in-out infinite;
        }
        .lp-title{
          margin:26px 0 0;
          font-family:var(--f-display); font-weight:500;
          font-size:clamp(40px, 6.4vw, 78px); line-height:1.02; letter-spacing:-.035em;
          color:#fff;
        }
        .lp-lead{
          margin:20px auto 0; max-width:48ch;
          font-size:clamp(15px, 1.2vw, 18px); line-height:1.55;
          color:rgba(245,245,242,.55);
        }

        /* ── Brief ──────────────────────────────────────────────────────── */
        .brief{ max-width:720px; margin:clamp(40px, 6vw, 64px) auto 0; padding:0 20px; }
        .brief__hint{
          margin:0 0 22px; text-align:center;
          font-size:14px; line-height:1.55; color:rgba(245,245,242,.45);
        }
        .brief__grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px 24px; }
        .brief__field{ display:flex; flex-direction:column; min-width:0; }
        .brief__field--wide{ grid-column:1 / -1; }
        .brief__label{
          display:block; margin-bottom:8px;
          font-size:15px; font-weight:500; color:#f5f5f2; letter-spacing:-.005em;
        }
        .brief__label b{ font-weight:500; color:var(--accent-primary); }

        .brief__input, .brief__phone{
          width:100%; min-height:48px; padding:0 16px;
          border-radius:11px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.11);
          box-shadow:0 1px 0 rgba(255,255,255,.04) inset;
          color:#f5f5f2; font-family:var(--f-body); font-size:16px; line-height:1.4;
          outline:none;
          transition:border-color .2s, background .2s, box-shadow .2s;
        }
        .brief__input::placeholder{ color:rgba(245,245,242,.28); }
        .brief__input:hover, .brief__phone:hover{ border-color:rgba(255,255,255,.18); }
        .brief__input:focus, .brief__phone:focus-within{
          border-color:rgba(232,101,28,.65);
          background:rgba(255,255,255,.05);
          box-shadow:0 0 0 4px rgba(232,101,28,.14);
        }
        .brief__textarea{ min-height:124px; padding:13px 16px; resize:vertical; }

        /* The dial-code selector, restyled into the same box as the inputs. */
        .brief__phone{ display:flex; align-items:center; padding-right:12px; }
        .brief__phone .phone-input{ align-items:center; gap:8px; }
        .brief__phone .phone-input__code{
          font-family:var(--f-body); font-weight:500; font-size:16px; letter-spacing:0;
          padding:0 18px 0 0; color:#f5f5f2;
        }
        .brief__phone .phone-input__code:focus{ color:#fff; }
        .brief__phone .phone-input__num{
          background:transparent; border:0; outline:none; min-width:0;
          color:#f5f5f2; font-family:var(--f-body); font-size:16px; padding:0;
          border-left:1px solid rgba(255,255,255,.12); padding-left:12px;
        }
        .brief__phone .phone-input__num::placeholder{ color:rgba(245,245,242,.28); }

        .chips{ display:flex; flex-wrap:wrap; gap:8px; }
        .chip{
          padding:10px 16px; border-radius:999px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.11);
          color:rgba(245,245,242,.72);
          font-family:var(--f-body); font-size:14px; line-height:1;
          transition:all .2s;
        }
        .chip:hover{ color:#fff; border-color:rgba(232,101,28,.55); }
        .chip.is-active{
          background:var(--accent-primary); border-color:var(--accent-primary); color:#fff;
          box-shadow:0 8px 20px -10px var(--accent-glow);
        }

        .brief__error{ margin:16px 0 0; font-size:14px; color:#ff7b6b; text-align:center; }
        .brief__submit{
          display:block; width:100%; height:54px; margin-top:26px;
          border-radius:14px;
          font-family:var(--f-body); font-size:16px; font-weight:500; color:#fff;
          background:var(--accent-primary);
          border:1px solid rgba(255,255,255,.12);
          box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 22px 50px -22px rgba(232,101,28,.6);
          transition:transform .35s cubic-bezier(.7,0,.2,1), box-shadow .35s, opacity .2s;
        }
        .brief__submit:hover{ transform:translateY(-2px); box-shadow:0 1px 0 rgba(255,255,255,.18) inset, 0 28px 60px -22px rgba(232,101,28,.9); }
        .brief__submit:active{ transform:translateY(0); }
        .brief__submit:disabled{ opacity:.55; cursor:default; }
        .brief__privacy{
          margin:14px 0 0; text-align:center;
          font-size:12.5px; line-height:1.5; color:rgba(245,245,242,.38);
        }

        .brief__sent{
          text-align:center; padding:clamp(36px, 5vw, 56px) 24px;
          border-radius:18px;
          background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.11);
        }
        .brief__sent-title{ margin:0; font-family:var(--f-display); font-weight:500; font-size:28px; letter-spacing:-.02em; }
        .brief__sent-text{ margin:10px auto 0; max-width:40ch; font-size:15px; line-height:1.6; color:rgba(245,245,242,.55); }

        /* ── Divider with contacts, then the reassurance list ───────────── */
        .lp-divider{
          display:flex; align-items:center; justify-content:center; gap:22px;
          max-width:720px; margin:34px auto 0; padding:0 20px;
        }
        .lp-divider::before, .lp-divider::after{
          content:""; flex:1; height:1px;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,.16));
        }
        .lp-divider::after{ background:linear-gradient(90deg, rgba(255,255,255,.16), transparent); }
        .lp-social{ color:rgba(245,245,242,.5); display:inline-flex; transition:color .2s; }
        .lp-social:hover{ color:var(--accent-primary); }

        .lp-benefits{ max-width:880px; margin:clamp(48px, 7vw, 80px) auto 0; padding:0 20px; }
        .lp-benefits__title{
          margin:0 0 20px; text-align:center;
          font-family:var(--f-mono); font-size:11px; letter-spacing:.24em; text-transform:uppercase;
          color:rgba(245,245,242,.45);
        }
        .lp-benefits ul{
          list-style:none; margin:0; padding:0;
          display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:14px 32px;
        }
        .lp-benefits li{ display:flex; gap:12px; align-items:baseline; font-size:14px; line-height:1.55; color:rgba(245,245,242,.6); }
        .lp-benefits__n{ font-family:var(--f-mono); font-size:11px; color:var(--accent-primary); flex-shrink:0; }

        @media (max-width: 640px){
          .lp-header{ padding:16px 18px; }
          .lp-glass-btn{ height:38px; padding:0 14px; font-size:14px; }
          .lp-hero{ margin-top:44px; }
          .lp-badge{ font-size:13px; }
          .lp-badge__item{ padding:4px 10px; }
          /* Two facts do not fit next to the reply promise on a phone, and a
             wrapped item leaves its separator dangling. Keep one. */
          .lp-badge__item:nth-child(3){ display:none; }
          .brief__grid{ grid-template-columns:1fr; gap:16px; }
          .brief{ padding:0 18px; }
          .chip{ padding:11px 15px; }
          .lp-bg::after{ top:clamp(720px, 92vh, 980px); width:max(320vw, 1400px); }
        }
      `;

export default function AdLanding({ locale = 'ru', settings = {}, overrides = {} }) {
  const base = DEFAULTS[locale] || DEFAULTS.ru;
  const t = { ...base, ...Object.fromEntries(Object.entries(overrides || {}).filter(([, v]) => v)) };

  const contact  = settings.contact || {};
  const counters = Array.isArray(settings.counters) ? settings.counters : [];
  const badgeFacts = [counters[0], counters[1]].map(counterPhrase).filter(Boolean);

  const socials = [
    contact.instagram && contact.instagram !== '#' && { key: 'instagram', href: contact.instagram, label: 'Instagram' },
    contact.telegram  && contact.telegram  !== '#' && { key: 'telegram',  href: contact.telegram,  label: 'Telegram' },
    contact.phone && { key: 'phone', href: `tel:${contact.phoneRaw || contact.phone}`, label: contact.phone },
  ].filter(Boolean);

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

    // The chip answers are React state, not form controls, so they are added
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

      // Conversion goals, so the ad platforms can optimise on real leads.
      try { window.ym?.(METRIKA_ID, 'reachGoal', 'lead_ads'); } catch { /* blocked */ }
      trackLead(`LP expocontact.uz/${locale}/lp`);
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
    <main className="lp">
      <div className="lp-bg" aria-hidden />

      {/* Deliberately no navigation: this page is bought traffic and every
          extra link is a way out of the funnel. Logo and phone only. */}
      <header className="lp-header">
        <Image src={LOGO_URL} alt="ExpoContact" width={150} height={36}
          style={{ height: 39, width: 'auto' }} unoptimized priority />
        {contact.phone && (
          <a href={`tel:${contact.phoneRaw || contact.phone}`} className="lp-glass-btn">
            {contact.phone}
          </a>
        )}
      </header>

      <section className="lp-hero">
        <div className="lp-badge">
          <span className="lp-badge__item"><i className="lp-badge__dot" />{t.formNote}</span>
          {badgeFacts.map((f) => (
            <span className="lp-badge__item" key={f}>{f}</span>
          ))}
        </div>
        <h1 className="lp-title">{t.headline}</h1>
        <p className="lp-lead">{t.lead}</p>
      </section>

      {/* ── The form: centre stage, one step ───────────────────────────── */}
      {sent ? (
        <div className="brief brief__sent">
          <p className="brief__sent-title">{t.sentTitle}</p>
          <p className="brief__sent-text">{t.sentText}</p>
          {contact.phone && (
            <a href={`tel:${contact.phoneRaw || contact.phone}`} className="lp-glass-btn" style={{ marginTop: 24 }}>
              {contact.phone}
            </a>
          )}
        </div>
      ) : (
        <form className="brief" onSubmit={submit} noValidate>
          {t.formHint && <p className="brief__hint">{t.formHint}</p>}

          <div className="brief__grid">
            <div className="brief__field">
              <label className="brief__label" htmlFor="lp-name">{t.nameLabel} <b>*</b></label>
              <input className="brief__input" id="lp-name" type="text" name="name" required
                autoComplete="name" placeholder={t.namePlaceholder} />
            </div>
            <div className="brief__field">
              <span className="brief__label">{t.phoneLabel} <b>*</b></span>
              <div className="brief__phone">
                <PhoneField locale={locale} placeholder={t.phonePlaceholder} />
              </div>
            </div>
            <div className="brief__field">
              <label className="brief__label" htmlFor="lp-company">{t.companyLabel}</label>
              <input className="brief__input" id="lp-company" type="text" name="company"
                autoComplete="organization" placeholder={t.companyPlaceholder} />
            </div>
            <div className="brief__field">
              <label className="brief__label" htmlFor="lp-event">{t.expoLabel}</label>
              <input className="brief__input" id="lp-event" type="text" name="event"
                placeholder={t.expoPlaceholder} />
            </div>

            {PILL_QUESTIONS.map((id) => (
              <ChipQuestion key={id} id={id} locale={locale} value={details[id] || ''} onChange={pick(id)} />
            ))}

            <div className="brief__field brief__field--wide">
              <label className="brief__label" htmlFor="lp-message">{t.messageLabel}</label>
              <textarea className="brief__input brief__textarea" id="lp-message" name="message" rows={4}
                placeholder={t.messagePlaceholder} />
            </div>
          </div>

          {error && <p className="brief__error">{error}</p>}

          <button type="submit" className="brief__submit" disabled={busy}>
            {t.submit}
          </button>
          <p className="brief__privacy">{t.privacy}</p>
        </form>
      )}

      {socials.length > 0 && (
        <div className="lp-divider">
          {socials.map((s) => (
            <a key={s.key} href={s.href} className="lp-social" aria-label={s.label}
              target={s.key === 'phone' ? undefined : '_blank'}
              rel={s.key === 'phone' ? undefined : 'noopener noreferrer'}>
              {ICONS[s.key]}
            </a>
          ))}
        </div>
      )}

      <section className="lp-benefits">
        <p className="lp-benefits__title">{t.benefitsTitle}</p>
        <ul>
          {t.benefits.map((b, i) => (
            <li key={i}>
              <span className="lp-benefits__n">/{String(i + 1).padStart(2, '0')}</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <style dangerouslySetInnerHTML={{ __html: LP_CSS }} />
    </main>
  );
}
