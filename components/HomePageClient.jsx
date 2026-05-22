'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import BrandLogo from './BrandLogo';
import HeroLogo3D from './HeroLogo3D';
import '@/app/landing.css';

/* ════════════════════════════════════════════════════════════════════════════
 *   ExpoContact — landing (full port of "ExpoContact - Standalone.html")
 *   Dark void palette, brand orange + blue accents, custom cursor, magnetic
 *   buttons, scan-progress bar, sticky horizontal process, bento portfolio,
 *   marquees, accordions, modal quote form.
 * ════════════════════════════════════════════════════════════════════════════ */

const LOCALES = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
];

// Hard-coded mappings for legacy portfolio categories → new filter slugs.
function mapCategory(raw) {
  if (!raw) return '';
  const tokens = String(raw)
    .toLowerCase()
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((t) => {
      if (t === 'conference') return 'conf';
      if (t === 'international') return 'intl';
      return t;
    });
  return tokens.join(' ');
}

// Card size palette, applied by index for the bento grid.
const CARD_SIZES = ['card--xl', 'card--lg', 'card--md', 'card--sm', 'card--sm', 'card--wd', 'card--nr', 'card--md', 'card--sm'];

// Picsum fallback for portfolio image when content has no real photo.
function imgFor(p, i) {
  if (p?.mainImage && !p.mainImage.includes('placeholder')) return p.mainImage;
  return `https://picsum.photos/seed/folio${i + 1}/900/600`;
}

// Simple `\n` and `<strong>...` interpreter — content is admin-trusted markdown-ish.
function richText(s) {
  if (!s) return '';
  return s
    .replaceAll('\n', '<br>')
    .replace(/<strong>([\s\S]*?)<\/strong>/g, '<strong style="color:var(--text-primary); font-weight:500;">$1</strong>')
    .replace(/<span class=['"]accent['"]>([\s\S]*?)<\/span>/g, '<span class="accent">$1</span>');
}

const PROC_STEPS = [
  { n: '01', l: 'Бриф',         t: 'Встреча и бриф',        d: 'Слушаем задачу, выставку, бюджет и KPI. Не продаём — задаём правильные вопросы. На выходе — техзадание на двух страницах.', dur: '1–2 дня',
    svg: 'M30 30h120v160H30zM50 70h80M50 90h80M50 110h60M50 130h70', accentBox: { x: 30, y: 30, w: 120, h: 160 }, dot: { cx: 150, cy: 40, r: 14 } },
  { n: '02', l: '3D-концепция', t: '3D-концепция',          d: 'Эскизы → 3D-модель → фотореалистичный рендер. Вы видите стенд под разными ракурсами до того, как будет куплен первый лист МДФ.', dur: '3–5 дней' },
  { n: '03', l: 'Согласование', t: 'Согласование',          d: 'С вашей маркетинг-командой и организатором выставки. Чертежи КМ/КМД, паспорта безопасности, нагрузки на пол.', dur: '2–4 дня' },
  { n: '04', l: 'Производство', t: 'Производство',          d: 'Собственный цех 1200 м² в Ташкенте. ЧПУ, покраска, печать, металл. Каждый этап — фото в чат.', dur: '7–14 дней' },
  { n: '05', l: 'Доставка',     t: 'Логистика',             d: 'Транспортная команда возит по Узбекистану, Казахстану и в международные хабы. Страховка, температурный режим, такелаж.', dur: '1–3 дня' },
  { n: '06', l: 'Монтаж',       t: 'Монтаж под ключ',       d: 'Бригады с допусками к UzExpoCentre, Atakent, CAEx, DWTC. Сборка 24–72 часа, AV-настройка, тестовый прогон.', dur: '1–3 дня' },
  { n: '07', l: 'Демонтаж',     t: 'Демонтаж и хранение',   d: 'Разбираем за ночь, упаковываем, отвозим на хранение. Многоразовые элементы вернутся на следующую выставку.', dur: '1 ночь' },
];

const PROC_SVGS = [
  // 01
  (<svg viewBox="0 0 200 200" key="01"><rect className="accent" x="30" y="30" width="120" height="160"/><path d="M50 70 H130 M50 90 H130 M50 110 H110 M50 130 H120"/><circle cx="150" cy="40" r="14" className="accent"/></svg>),
  // 02
  (<svg viewBox="0 0 200 200" key="02"><path d="M30 130 L100 90 L170 130 L100 170 Z"/><path d="M100 90 V40"/><path d="M70 110 L130 110 L130 150 L70 150 Z" className="accent"/><circle cx="100" cy="40" r="6"/></svg>),
  // 03
  (<svg viewBox="0 0 200 200" key="03"><circle cx="100" cy="100" r="60"/><path d="M75 100 L93 118 L130 80" className="accent"/></svg>),
  // 04
  (<svg viewBox="0 0 200 200" key="04"><rect x="20" y="100" width="160" height="70" className="accent"/><rect x="40" y="60" width="40" height="40"/><rect x="100" y="40" width="60" height="60"/><path d="M30 170 L30 185 M170 170 L170 185 M100 170 L100 185"/></svg>),
  // 05
  (<svg viewBox="0 0 200 200" key="05"><rect x="20" y="70" width="100" height="60"/><path d="M120 90 H160 L180 110 V130 H120 Z" className="accent"/><circle cx="55" cy="140" r="14"/><circle cx="155" cy="140" r="14"/></svg>),
  // 06
  (<svg viewBox="0 0 200 200" key="06"><path d="M40 170 L40 80 L100 50 L160 80 L160 170"/><path d="M70 170 V120 H130 V170" className="accent"/><path d="M40 80 L160 80"/></svg>),
  // 07
  (<svg viewBox="0 0 200 200" key="07"><path d="M30 100 H170" className="accent"/><path d="M50 100 L50 60 L150 60 L150 100" strokeDasharray="4 4"/><rect x="40" y="120" width="120" height="40"/></svg>),
];

// Service includes — supplemental data not present in admin's `services` shape.
const SERVICE_EXTRAS = {
  design:       { inc: ['Концепт-эскизы', '3D-модель + рендеры', 'Чертежи КМ/КМД', 'Согласование с площадкой'],   img: 'https://picsum.photos/seed/svc1/520/340' },
  production:   { inc: ['МДФ, металл, акрил', 'Широкоформатная печать', 'Подсветка, AV-техника', 'Контроль на всех этапах'], img: 'https://picsum.photos/seed/svc2/520/340' },
  mounting:     { inc: ['UzExpoCentre · CAEx', 'Аtakent · Almaty Expo', 'Логистика и страховка', 'Хранение между выставками'], img: 'https://picsum.photos/seed/svc3/520/340' },
  branding:     { inc: ['Вывески, баннеры', 'Брендирование транспорта', 'POSM, мерч', 'Roll-up, press-wall'], img: 'https://picsum.photos/seed/svc4/520/340' },
  logistics:    { inc: ['Транспортировка', 'Страховка груза', 'Хранение в Ташкенте', 'Международные хабы'], img: 'https://picsum.photos/seed/svc5/520/340' },
  support:      { inc: ['24/7 на площадке', 'Запас расходников', 'AV-инженер', 'Ежедневный reporting'], img: 'https://picsum.photos/seed/svc6/520/340' },
};

const CLIENT_LIST_FALLBACK_A = [
  { n: 'Silk Road Motors', m: 'diamond' }, { n: 'Alif Bank', m: 'circle' }, { n: 'UzAuto', m: '' }, { n: 'Perfectum', m: 'dot' },
  { n: 'UZB · Tourism', m: 'diamond' }, { n: 'Humans IT', m: 'circle' }, { n: 'Beeline B2B', m: '' }, { n: 'Uzpharm', m: 'dot' },
  { n: 'Korzinka', m: 'diamond' }, { n: 'Asia Alliance', m: '' },
];
const CLIENT_LIST_FALLBACK_B = [
  { n: 'Uztelecom', m: '' }, { n: 'Hyundai UZ', m: 'circle' }, { n: 'BYD', m: 'diamond' }, { n: 'NBU', m: 'dot' },
  { n: 'Akfa', m: '' }, { n: 'TBC Bank', m: 'circle' }, { n: 'Ipoteka Bank', m: '' }, { n: 'Asaka Bank', m: 'diamond' },
  { n: 'Air Samarkand', m: 'dot' }, { n: 'Kapital Bank', m: '' },
];

const HERO_SLIDES = [
  {
    headline: 'Выставочные стенды, которые работают на вас',
    sub:      'Проектируем, строим, монтируем — вы просто приходите на выставку',
    cta:      'Обсудить проект',
  },
  {
    headline: 'Вы занимаетесь бизнесом — мы занимаемся событием',
    sub:      'Полный цикл организации: выставочные стенды, ивенты, корпоративные встречи под ключ',
    cta:      'Получить консультацию',
  },
  {
    headline: 'Ваше мероприятие в надёжных руках',
    sub:      'Профессиональная организация выставок, бизнес-мероприятий и корпоративных событий в Узбекистане',
    cta:      'Рассчитать стоимость',
  },
  {
    headline: 'Создаём события, о которых говорят',
    sub:      'От выставочного стенда до корпоративного форума — делаем каждую деталь идеальной',
    cta:      'Начать планирование',
  },
  {
    headline: 'Готовы воплотить ваше мероприятие в жизнь',
    sub:      'Оставьте заявку — свяжемся в течение 30 минут и предложим решение под ваш бюджет',
    cta:      'Оставить заявку',
  },
];
const HERO_INTERVAL = 5000;

const heroSlideVariants = {
  enter:  { opacity: 0, y: 28 },
  center: { opacity: 1, y: 0,   transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit:   { opacity: 0, y: -16, transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] } },
};

// ════════════════════════════════════════════════════════════════════════════
//   MAIN
// ════════════════════════════════════════════════════════════════════════════
export default function HomePageClient({ locale, projects = [], clients = [], settings }) {
  const tServices = useTranslations('services');
  const tFAQ = useTranslations('faq');
  const tContact = useTranslations('contact');

  const services = tServices.raw('items') || [];
  const faqItems = tFAQ.raw('items') || [];

  // Fall back to bundled defaults if /api/admin hasn't populated settings yet.
  const s = settings || {};
  const sHero = s.hero || {};
  const sAbout = s.about || {};
  const sCounters = s.counters || [];
  const sMarquee = s.marquee || [];
  const sProcess = s.process || {};
  const sClients = s.clients || {};
  const sContact = s.contact || {};
  const sFooter = s.footer || {};

  // Body class — switches into dark void palette for the landing only.
  useEffect(() => {
    document.body.classList.add('landing-body');
    return () => document.body.classList.remove('landing-body');
  }, []);

  // ── 1. Custom cursor ──────────────────────────────────────────────────────
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    if (window.innerWidth < 900) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let raf;
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      }
    };
    const loop = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);

    const onEnter = () => ringRef.current?.classList.add('is-hover');
    const onLeave = () => ringRef.current?.classList.remove('is-hover');
    const targets = document.querySelectorAll('a, button, [data-hover]');
    targets.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      targets.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
    };
  }, []);

  // ── 2. Scroll progress + nav state ────────────────────────────────────────
  const barRef = useRef(null);
  const navRef = useRef(null);
  useEffect(() => {
    const tick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (h.scrollTop / max) : 0;
      if (barRef.current) barRef.current.style.width = (pct * 100).toFixed(2) + '%';
      if (navRef.current) navRef.current.classList.toggle('is-scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, []);

  // ── 3. Counters animate on intersect ──────────────────────────────────────
  useEffect(() => {
    const items = document.querySelectorAll('.counter');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        const target = +e.target.dataset.target;
        const valEl = e.target.querySelector('.counter__val');
        if (!valEl) return;
        const dur = 1600;
        const t0 = performance.now();
        const fmt = (n) => target >= 1000 ? Math.round(n).toLocaleString('ru-RU') : Math.round(n);
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          valEl.textContent = fmt(target * eased);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sCounters.length]);

  // ── 4. Portfolio reveal ───────────────────────────────────────────────────
  useEffect(() => {
    const cards = document.querySelectorAll('#bento .card');
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [projects]);

  // ── 5. Magnetic buttons ───────────────────────────────────────────────────
  useEffect(() => {
    if (window.innerWidth < 900) return;
    const handlers = [];
    document.querySelectorAll('.magnetic').forEach((el) => {
      let rect;
      const enter = () => { rect = el.getBoundingClientRect(); };
      const move = (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transition = 'transform .15s ease-out';
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      };
      const leave = () => {
        el.style.transition = 'transform .55s cubic-bezier(.2,.7,.2,1)';
        el.style.transform = '';
        rect = null;
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push([el, enter, move, leave]);
    });
    return () => {
      handlers.forEach(([el, e, m, l]) => {
        el.removeEventListener('mouseenter', e);
        el.removeEventListener('mousemove', m);
        el.removeEventListener('mouseleave', l);
      });
    };
  });

  // ── 6. Process sticky horizontal scroll ───────────────────────────────────
  const procPinRef = useRef(null);
  const procTrackRef = useRef(null);
  const [procIdx, setProcIdx] = useState(0);
  const [procPct, setProcPct] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 900) return;
    const pin = procPinRef.current;
    const track = procTrackRef.current;
    if (!pin || !track) return;
    const onScroll = () => {
      const r = pin.getBoundingClientRect();
      const total = pin.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-r.top, 0), total);
      const k = total > 0 ? scrolled / total : 0;
      const distance = (PROC_STEPS.length - 1) * window.innerWidth;
      track.style.transform = `translateX(${-k * distance}px)`;
      const idx = Math.min(PROC_STEPS.length - 1, Math.floor(k * PROC_STEPS.length));
      setProcIdx(idx);
      setProcPct(Math.round(k * 100));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // ── 7. Back-to-top + modal ────────────────────────────────────────────────
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const tick = () => setShowTop(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
    return () => window.removeEventListener('scroll', tick);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSent, setModalSent] = useState(false);
  const openModal = (e) => { e?.preventDefault?.(); setModalOpen(true); };
  const closeModal = useCallback(() => setModalOpen(false), []);
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, closeModal]);

  // ── 8. Hero slider ───────────────────────────────────────────────────────
  const [heroSlide,    setHeroSlide]    = useState(0);
  const [heroPaused,   setHeroPaused]   = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const heroStartRef = useRef(performance.now());
  const heroRafRef   = useRef(null);

  const goToSlide  = useCallback((i) => setHeroSlide(i), []);
  const nextSlide  = useCallback(() => setHeroSlide(c => (c + 1) % HERO_SLIDES.length), []);
  const prevSlide  = useCallback(() => setHeroSlide(c => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length), []);

  useEffect(() => {
    heroStartRef.current = performance.now();
    setHeroProgress(0);
  }, [heroSlide]);

  useEffect(() => {
    if (heroPaused) return;
    const tick = () => {
      const p = Math.min((performance.now() - heroStartRef.current) / HERO_INTERVAL, 1);
      setHeroProgress(p);
      if (p < 1) heroRafRef.current = requestAnimationFrame(tick);
    };
    heroRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(heroRafRef.current);
  }, [heroSlide, heroPaused]);

  useEffect(() => {
    if (heroPaused) return;
    const id = setTimeout(() => setHeroSlide(c => (c + 1) % HERO_SLIDES.length), HERO_INTERVAL);
    return () => clearTimeout(id);
  }, [heroSlide, heroPaused]);

  // ── 9. Filters ────────────────────────────────────────────────────────────
  const [filter, setFilter] = useState('all');
  const filterLabels = [
    { k: 'all', label: 'Все' },
    { k: 'large', label: 'Крупные' },
    { k: 'modular', label: 'Модульные' },
    { k: 'conf', label: 'Конференции' },
    { k: 'intl', label: 'Международные' },
  ];

  // ── 9. Lead form submit ───────────────────────────────────────────────────
  const [leadSent, setLeadSent] = useState(false);
  const formRef = useRef(null);
  const submitLead = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
    } catch {/* fall through */}
    setLeadSent(true);
  };
  const submitModal = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
    } catch {/* fall through */}
    setModalSent(true);
    setTimeout(() => {
      closeModal();
      setTimeout(() => { setModalSent(false); form.reset(); }, 500);
    }, 1800);
  };

  // ── 10. Locale switcher ──────────────────────────────────────────────────
  const pathname = usePathname();
  const router = useRouter();
  const switchLocale = (code) => {
    const segs = pathname.split('/');
    segs[1] = code;
    router.push(segs.join('/') || '/');
  };

  // ── 11. Active section in nav ────────────────────────────────────────────
  const [activeSec, setActiveSec] = useState('top');
  useEffect(() => {
    const ids = ['top', 'about', 'services', 'folio', 'process', 'contact'];
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) setActiveSec(e.target.id);
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // ── Marquee items HTML — duplicated for seamless loop ────────────────────
  const marqueeRow = (sMarquee.length ? sMarquee : [
    '20+ лет на рынке', '5000+ проектов', '3 страны', '500+ клиентов',
  ]);

  // Bento — apply size palette by index
  const bento = projects.slice(0, 9).map((p, i) => ({
    ...p,
    _size: CARD_SIZES[i] || 'card--md',
    _cls: mapCategory(p.category),
    _img: imgFor(p, i),
  }));

  return (
    <>
      {/* ── Fonts for the landing palette (Space Grotesk + JetBrains Mono) ── */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap"
      />

      {/* ── GLOBAL OVERLAYS ────────────────────────────────────────────── */}
      <div className="noise" aria-hidden />
      <div className="scan-progress" aria-hidden>
        <div className="scan-progress__bar" ref={barRef} />
      </div>
      <div className="cursor-ring" ref={ringRef} aria-hidden />
      <div className="cursor-dot" ref={dotRef} aria-hidden />

      {/* ── 00 / NAV ──────────────────────────────────────────────────── */}
      <nav className="nav" ref={navRef} aria-label="primary">
        <a className="nav__logo" href="#top" aria-label="ExpoContact">
          <BrandLogo />
        </a>
        <div className="nav__menu">
          {[
            { href: '#about', id: 'about', label: 'О нас' },
            { href: '#services', id: 'services', label: 'Услуги' },
            { href: '#folio', id: 'folio', label: 'Работы' },
            { href: '#process', id: 'process', label: 'Процесс' },
            { href: '#contact', id: 'contact', label: 'Контакты' },
          ].map((l) => (
            <a key={l.id} href={l.href} className={activeSec === l.id ? 'is-active' : ''}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav__right">
          <a className="nav__phone magnetic" href={`tel:${sContact.phoneRaw || '+998977111711'}`} data-hover>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{sContact.phone || '+998 97 711-17-11'}</span>
          </a>
          <div className="lang" role="tablist">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                className={locale === l.code ? 'is-active' : ''}
                onClick={() => switchLocale(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <a href="#" className="btn-cta magnetic" data-hover onClick={openModal}>
            <span className="btn-cta__dot" />
            <span>Обсудить проект</span>
          </a>
        </div>
      </nav>

      {/* ── 01 / HERO ─────────────────────────────────────────────────── */}
      <header
        className="hero"
        id="top"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        <div className="hero__vignette" aria-hidden />
        <div className="hero__glow" aria-hidden />
        <div className="hero__grid" aria-hidden />

        {/* 3D rotating logo — stays untouched */}
        <div className="hero__logo3d" id="logo3d">
          <HeroLogo3D />
          <span className="hero__logo3d-hint">Drag · 360°</span>
        </div>

        <div className="hero__content">

          {/* Animated slide: headline + subheadline */}
          <div style={{ overflow: 'hidden', minHeight: 'clamp(120px, 18svh, 200px)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                variants={heroSlideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h1 className="hero__title">
                  {HERO_SLIDES[heroSlide].headline}
                </h1>
                <p className="hero__lead" style={{ marginTop: 14 }}>
                  {HERO_SLIDES[heroSlide].sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CTA row */}
          <div className="hero__cta">
            <a href="#" className="cta cta--primary magnetic" data-hover onClick={openModal}>
              <span className="cta__label">{HERO_SLIDES[heroSlide].cta}</span>
              <span className="cta__circle" aria-hidden>
                <svg className="a1" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
                <svg className="a2" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
              </span>
            </a>
            <a href="#folio" className="cta cta--ghost magnetic" data-hover>
              <span className="cta__label">Работы</span>
              <span className="cta__circle" aria-hidden>
                <svg className="a1" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
                <svg className="a2" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
              </span>
            </a>
          </div>

          {/* Progress bar */}
          <div className="hero__progress">
            <div
              className="hero__progress-fill"
              style={{ width: `${heroProgress * 100}%`, transition: 'none' }}
            />
          </div>

          {/* Prev · dots · next */}
          <div className="hero__nav">
            <button className="hero__arrow" onClick={prevSlide} aria-label="Предыдущий слайд">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="hero__dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hero__dot${i === heroSlide ? ' is-active' : ''}`}
                  style={{ width: i === heroSlide ? 24 : 8 }}
                  onClick={() => goToSlide(i)}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
            <button className="hero__arrow" onClick={nextSlide} aria-label="Следующий слайд">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* ── 02 / MARQUEE ─────────────────────────────────────────────── */}
      <section className="marquee" aria-hidden>
        <div className="marquee__track">
          {[...marqueeRow, ...marqueeRow].map((t, i) => (
            <span className="marquee__item" key={i}>
              <span>{t}</span>
              <svg className="marquee__star" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0 L14 9 L23 11 L14 13 L12 22 L10 13 L1 11 L10 9 Z" />
              </svg>
            </span>
          ))}
        </div>
      </section>

      {/* ── 03 / ABOUT + COUNTERS ────────────────────────────────────── */}
      <section className="section" id="about">
        <div className="section__index">02 / About</div>
        <div className="wrap">
          <div className="about__grid">
            <div>
              <span className="eyebrow">{sAbout.eyebrow || '/02 — Кто мы'}</span>
              <h2
                className="section-title"
                style={{ marginTop: 24 }}
                dangerouslySetInnerHTML={{ __html: richText(sAbout.title || 'Мы строим то,\nчто нельзя забыть.') }}
              />
            </div>
            <p
              style={{ color: 'var(--text-muted)', maxWidth: '46ch', fontSize: 18, lineHeight: 1.55 }}
              dangerouslySetInnerHTML={{ __html: richText(sAbout.lead || '') }}
            />
          </div>

          <div className="counters">
            {sCounters.map((c, i) => (
              <div key={i} className="counter" data-target={c.target}>
                <div className="counter__num">
                  <span className="counter__val">0</span>
                  {c.suffix && <sup>{c.suffix}</sup>}
                </div>
                <div className="counter__label">{c.label}</div>
                <div className="counter__rule" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 / SERVICES ────────────────────────────────────────────── */}
      <section className="section" id="services" style={{ paddingTop: 60 }}>
        <div className="section__index">03 / Services</div>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">/03 — Что мы делаем</span>
              <h2 className="section-title" style={{ marginTop: 24 }}>
                Полный цикл.<br />Один подрядчик.
              </h2>
            </div>
            <p className="mono" style={{ maxWidth: '32ch' }}>
              От первой линии в эскизе до полной разборки — отвечает одна команда.
            </p>
          </div>

          <div className="svc-list">
            {services.map((sv, i) => (
              <ServiceItem
                key={sv.id || i}
                idx={i}
                title={sv.title}
                desc={sv.full || sv.short}
                includes={SERVICE_EXTRAS[sv.id]?.inc || []}
                img={SERVICE_EXTRAS[sv.id]?.img || `https://picsum.photos/seed/svc${i + 1}/520/340`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 / PORTFOLIO ───────────────────────────────────────────── */}
      <section className="section" id="folio">
        <div className="section__index">04 / Works</div>
        <div className="wrap">
          <div className="folio__head">
            <div>
              <span className="eyebrow">/04 — Портфолио</span>
              <h2 className="section-title" style={{ marginTop: 24 }}>
                Работы,<br />которые работают.
              </h2>
            </div>
            <span className="mono">/ Выборка {bento.length} из 5000+</span>
          </div>

          <div className="filters">
            {filterLabels.map((f) => (
              <button
                key={f.k}
                className={`filter ${filter === f.k ? 'is-active' : ''}`}
                onClick={() => setFilter(f.k)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bento" id="bento">
            {bento.map((p, i) => {
              const visible = filter === 'all' || (p._cls || '').split(' ').includes(filter);
              return (
                <article
                  key={p.id || i}
                  className={`card ${p._size}`}
                  data-cls={p._cls}
                  style={{ display: visible ? '' : 'none' }}
                >
                  <div className="card__img" style={{ backgroundImage: `url('${p._img}')` }} />
                  <div className="card__shade" />
                  <span className="card__sub">/{String(i + 1).padStart(2, '0')} · {p.exhibition || p.client}</span>
                  <div className="card__rule" />
                  <div className="card__meta">
                    <h3 className="card__title">{p.title}</h3>
                  </div>
                  <div className="card__reveal" />
                </article>
              );
            })}
          </div>

          <div className="folio__more">
            <a href="#contact" className="btn-ghost magnetic" data-hover>Все проекты (5000+) →</a>
          </div>
        </div>
      </section>

      {/* ── 06 / PROCESS — sticky horizontal ─────────────────────────── */}
      <section className="process" id="process">
        <div className="section__index">05 / Process</div>
        <div className="process__pin" ref={procPinRef}>
          <div className="process__sticky">
            <div className="process__head">
              <div>
                <span className="eyebrow">{sProcess.eyebrow || '/05 — Процесс'}</span>
                <h2 style={{ marginTop: 14 }}>{sProcess.title || 'Семь шагов от брифа до демонтажа.'}</h2>
              </div>
              <span className="mono">
                {(sProcess.stepLabel || 'Шаг')} {String(procIdx + 1).padStart(2, '0')} / {String(PROC_STEPS.length).padStart(2, '0')}
              </span>
            </div>
            <div className="process__viewport">
              <div className="process__track" ref={procTrackRef}>
                {PROC_STEPS.map((s, i) => (
                  <article className="proc-step" key={s.n}>
                    <div className="proc-step__num" aria-hidden>{s.n}</div>
                    <div className="proc-step__body">
                      <div className="proc-step__label">/{s.n} — {s.l}</div>
                      <h3 className="proc-step__title">{s.t}</h3>
                      <p className="proc-step__desc">{s.d}</p>
                      <div className="proc-step__dur">{s.dur}</div>
                    </div>
                    <div className="proc-step__icon">{PROC_SVGS[i]}</div>
                  </article>
                ))}
              </div>
            </div>
            <div className="process__bar">
              <span>Прогресс</span>
              <div className="process__bar-track"><div className="process__bar-fill" style={{ width: (10 + (procPct / 100) * 86) + '%' }} /></div>
              <span className="mono--bright">{procPct}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 07 / CLIENTS ─────────────────────────────────────────────── */}
      <section className="clients" id="clients">
        <div className="clients__head">
          <div>
            <span className="eyebrow">{sClients.eyebrow || '/06 — Клиенты'}</span>
            <h3 style={{ marginTop: 18 }}>{sClients.title || 'Нам доверяют первое впечатление о бренде.'}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 80, lineHeight: 1, letterSpacing: '-.04em', color: 'var(--accent-primary)' }}>
              {sClients.bigNumber || '500'}<sup style={{ fontSize: '.4em' }}>{sClients.bigSuffix || '+'}</sup>
            </div>
            <div className="mono">{sClients.caption || 'компаний с 2004'}</div>
          </div>
        </div>
        <ClientRow items={clients.length >= 6 ? clientsToRow(clients) : CLIENT_LIST_FALLBACK_A} />
        <ClientRow items={clients.length >= 12 ? clientsToRow(clients, 1) : CLIENT_LIST_FALLBACK_B} reverse />
      </section>

      {/* ── 08 / FAQ ─────────────────────────────────────────────────── */}
      <section className="section" id="faq">
        <div className="section__index">08 / FAQ</div>
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span className="eyebrow">/08 — Часто спрашивают</span>
              <h2 className="section-title" style={{ marginTop: 24 }}>
                Без воды.<br />По существу.
              </h2>
            </div>
            <span className="mono">
              Не нашли свой вопрос? <a href="#contact" style={{ color: 'var(--accent-primary)' }}>— Напишите.</a>
            </span>
          </div>
          <FAQList items={faqItems} />
        </div>
      </section>

      {/* ── 09 / CTA + FORM ──────────────────────────────────────────── */}
      <section className="section cta" id="contact">
        <div className="section__index">08 / Contact</div>
        <div className="wrap">
          <div className="cta__grid">
            <div>
              <span className="eyebrow">/08 — Свяжитесь</span>
              <h2 className="section-title" style={{ marginTop: 24 }}>
                Готовы<br />начать?
              </h2>
              <div className="cta__contacts">
                <div className="contact-block">
                  <span className="contact-block__label">Телефон / WhatsApp</span>
                  <a className="contact-block__val magnetic" data-hover href={`tel:${sContact.phoneRaw || '+998977111711'}`}>
                    {sContact.phone || '+998 97 711-17-11'}
                  </a>
                </div>
                <div className="contact-block">
                  <span className="contact-block__label">Адрес</span>
                  <span className="contact-block__val">{sContact.address || 'Ташкент, ул. Амира Темура, 107Б'}</span>
                </div>
                <div className="contact-block">
                  <span className="contact-block__label">Часы работы</span>
                  <span className="contact-block__val">{sContact.hours || 'Пн–Сб · 09:00 — 19:00'}</span>
                </div>
                <div className="contact-block">
                  <span className="contact-block__label">Email</span>
                  <a className="contact-block__val magnetic" data-hover href={`mailto:${sContact.email || 'hello@expocontact.uz'}`}>
                    {sContact.email || 'hello@expocontact.uz'}
                  </a>
                </div>
              </div>
            </div>

            <form className={`form ${leadSent ? 'is-sent' : ''}`} ref={formRef} onSubmit={submitLead} noValidate>
              <div className="form__head">
                <div className="form__head-title">Заявка на проект</div>
                <div className="form__head-meta">Ответим за 30 минут</div>
              </div>

              <div className="form__row">
                <div className="field">
                  <label>Имя <span className="req">*</span></label>
                  <input type="text" name="name" required placeholder="Напишите имя" />
                </div>
                <div className="field">
                  <label>Компания</label>
                  <input type="text" name="company" placeholder="Напишите название" />
                </div>
              </div>

              <div className="form__row">
                <div className="field">
                  <label>Телефон <span className="req">*</span></label>
                  <input type="tel" name="phone" required placeholder="Напишите номер" />
                </div>
                <div className="field">
                  <label>Выставка / Дата</label>
                  <input type="text" name="event" placeholder="Напишите название и дату" />
                </div>
              </div>

              <div className="form__row">
                <div className="field field--span">
                  <label>Сообщение</label>
                  <textarea name="message" placeholder="Напишите о проекте" />
                </div>
              </div>

              <div className="form__footer">
                <p className="form__legal">
                  Отправляя форму вы соглашаетесь с <a href="#">политикой обработки данных</a>
                </p>
                <button type="submit" className={`btn-submit magnetic ${leadSent ? 'is-sent' : ''}`} data-hover>
                  <span className="btn-submit__label">{leadSent ? 'Заявка отправлена' : 'Отправить заявку'}</span>
                  <span className="btn-submit__circle" aria-hidden>
                    <svg className="a1" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
                    <svg className="a2" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── 10 / FOOTER ──────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer__callout">
            <h2
              className="footer__callout-title"
              dangerouslySetInnerHTML={{ __html: richText(sFooter.callout || 'Готовы построить\nстенд, <span class=\'accent\'>который запомнят?</span>') }}
            />
            <a href="#" className="footer__callout-cta magnetic" data-hover onClick={openModal}>
              <span>{sFooter.calloutCta || 'Оставить заявку'}</span>
              <span className="footer__callout-cta__circle" aria-hidden>
                <svg viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
              </span>
            </a>
          </div>

          <div className="footer__cols">
            <div className="footer__col footer__col--brand">
              <div className="footer__brand-logo" aria-label="ExpoContact">
                <BrandLogo />
              </div>
              <p>{sFooter.brandLead || 'Студия выставочной архитектуры в Центральной Азии. Полный цикл, один подрядчик, никаких посредников.'}</p>
            </div>

            <div className="footer__col">
              <h4>Навигация</h4>
              <ul>
                <li><a href="#about">О нас</a></li>
                <li><a href="#services">Услуги</a></li>
                <li><a href="#folio">Работы</a></li>
                <li><a href="#process">Процесс</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="footer__col">
              <h4>Контакты</h4>
              <ul>
                <li>
                  <div className="footer__contact-item">
                    <span className="lbl">Телефон</span>
                    <a className="val" href={`tel:${sContact.phoneRaw || '+998977111711'}`}>{sContact.phone || '+998 97 711-17-11'}</a>
                  </div>
                </li>
                <li>
                  <div className="footer__contact-item">
                    <span className="lbl">Email</span>
                    <a className="val" href={`mailto:${sContact.email || 'hello@expocontact.uz'}`}>{sContact.email || 'hello@expocontact.uz'}</a>
                  </div>
                </li>
                <li>
                  <div className="footer__contact-item">
                    <span className="lbl">Адрес</span>
                    <span className="val">{sContact.address || 'Ташкент, ул. Амира Темура, 107Б'}</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="footer__col footer__col--social">
              <h4>Соцсети</h4>
              <div className="footer__social">
                <a href={sContact.instagram || '#'} data-hover target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
                  Instagram
                </a>
                <a href={sContact.telegram || '#'} data-hover target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.55l-.39 5.41c.56 0 .81-.24 1.11-.53l2.66-2.55 5.52 4.04c1.01.56 1.73.27 2-.94L23 3.66c.35-1.51-.55-2.1-1.55-1.73L1.41 9.74c-1.47.57-1.45 1.39-.25 1.76l5.13 1.6L17.2 6.32c.55-.36 1.05-.16.64.2L9.4 16.55z" /></svg>
                  Telegram
                </a>
                <a href={sContact.behance || '#'} data-hover>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 9 L21 9 M3 15 L21 15 M12 3 C8 8 8 16 12 21 M12 3 C16 8 16 16 12 21" /></svg>
                  Behance
                </a>
              </div>
            </div>
          </div>

          <div className="footer__bottom">
            <span>{sFooter.rights || '© 2026 ExpoContact. Все права защищены.'}</span>
            <span>
              Made with <span style={{ color: 'var(--accent-primary)' }}>♥</span> by{' '}
              <a className="footer__maze" href="https://www.maze.uz" target="_blank" rel="noopener noreferrer" data-hover>
                {sFooter.credits || 'MAZE'}
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* ── BACK-TO-TOP ──────────────────────────────────────────────── */}
      <button
        className={`to-top ${showTop ? 'is-visible' : ''}`}
        type="button"
        aria-label="Наверх"
        data-hover
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <span className="to-top__ring" aria-hidden />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19 V5 M5 12 L12 5 L19 12" />
        </svg>
      </button>

      {/* ── MODAL ───────────────────────────────────────────────────── */}
      <div className={`modal ${modalOpen ? 'is-open' : ''} ${modalSent ? 'is-sent' : ''}`} role="dialog" aria-modal="true" aria-hidden={!modalOpen}>
        <div className="modal__backdrop" onClick={closeModal} />
        <div className="modal__card">
          <button className="modal__close" type="button" aria-label="Закрыть" onClick={closeModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
          </button>
          <span className="modal__eyebrow">Заявка · 30 секунд</span>
          <h3 className="modal__title">Обсудим проект</h3>
          <p className="modal__sub">Перезвоним в течение 30 минут в рабочее время.</p>

          <form className="modal__form" onSubmit={submitModal} noValidate>
            <div className="field">
              <label>Имя <span className="req">*</span></label>
              <input type="text" name="name" required placeholder="Напишите имя" />
            </div>
            <div className="field">
              <label>Компания</label>
              <input type="text" name="company" placeholder="Напишите название" />
            </div>
            <div className="field">
              <label>Телефон <span className="req">*</span></label>
              <input type="tel" name="phone" required placeholder="Напишите номер" />
            </div>
            <button type="submit" className={`btn-submit magnetic ${modalSent ? 'is-sent' : ''}`} data-hover>
              <span className="btn-submit__label">{modalSent ? 'Заявка отправлена' : 'Отправить заявку'}</span>
              <span className="btn-submit__circle" aria-hidden>
                <svg className="a1" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
                <svg className="a2" viewBox="0 0 22 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 6 H20 M15 1 L20 6 L15 11" /></svg>
              </span>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//   SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function ServiceItem({ idx, title, desc, includes, img }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`svc-item ${open ? 'is-open' : ''}`} onClick={(e) => {
      if (e.target.closest('.svc-item__body')) return;
      setOpen((v) => !v);
    }}>
      <div className="svc-item__num">/{String(idx + 1).padStart(2, '0')}</div>
      <div className="svc-item__title">{title}</div>
      <div className="svc-item__preview" style={{ backgroundImage: `url('${img}')` }} />
      <div className="svc-item__toggle" data-hover />
      <div className="svc-item__body">
        <div className="svc-item__body-inner">
          <div />
          <p>{desc}</p>
          <ul className="svc-item__includes">
            {includes.map((x, j) => <li key={j}>{x}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function FAQList({ items }) {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <div className="faq-list">
      {items.map((f, i) => (
        <div key={i} className={`faq-item ${openIdx === i ? 'is-open' : ''}`}>
          <button
            className="faq-item__head"
            data-hover
            onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
          >
            <span className="faq-item__num">/{String(i + 1).padStart(2, '0')}</span>
            <span className="faq-item__q">{f.q}</span>
            <span className="faq-item__plus" />
          </button>
          <div className="faq-item__body">
            <div className="faq-item__body-inner">{f.a}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientRow({ items, reverse = false }) {
  // Duplicate for seamless marquee
  const list = [...items, ...items];
  return (
    <div className={`client-row ${reverse ? 'client-row--rev' : ''}`}>
      <div className="client-row__track">
        {list.map((c, i) => (
          <span key={i} className="client-logo" data-hover>
            <span className={`client-logo__mark ${c.m || ''}`} />
            {c.n}
          </span>
        ))}
      </div>
    </div>
  );
}

function clientsToRow(clients, half = 0) {
  // Split clients array in half for the two rows
  const sorted = clients.slice();
  const mid = Math.ceil(sorted.length / 2);
  const slice = half === 0 ? sorted.slice(0, mid) : sorted.slice(mid);
  const marks = ['diamond', 'circle', '', 'dot'];
  return slice.map((c, i) => ({ n: c.name || c.title || `Client ${i + 1}`, m: marks[i % marks.length] }));
}
