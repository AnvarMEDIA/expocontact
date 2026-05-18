'use client';

import { useEffect, useState, useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

/* ──────────────────────────────────────────────────────────────────────────────
 *  ExpoContact /new — editorial redesign inspired by Tonellidesign
 *  Cream palette, serif headlines, asymmetric grid, heavy scroll-triggered motion.
 * ────────────────────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1];

// ── Word-by-word reveal for editorial headlines ──────────────────────────────
function SplitHeadline({ text, className = '', delay = 0, stagger = 0.06 }) {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom mr-[0.22em] last:mr-0">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '115%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.95, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ── Generic scroll-reveal wrapper ────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 36, className = '', once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated number counter, fires on view ───────────────────────────────────
function CountUp({ to, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Gradient image-placeholder with grain ────────────────────────────────────
function ImageBlock({
  tone = 'beige',
  ratio = 'aspect-[4/5]',
  className = '',
  label,
  caption,
  motif,
}) {
  const tones = {
    beige:    'from-[#E8E1D2] via-[#D6CDB8] to-[#A89A78]',
    sand:     'from-[#E5DBC0] via-[#C6B58E] to-[#9C8868]',
    charcoal: 'from-[#3B3A36] via-[#26251F] to-[#13120F]',
    stone:    'from-[#D6D1C5] via-[#B0A998] to-[#7A7464]',
    bronze:   'from-[#C9A26A] via-[#9C7333] to-[#5F4319]',
    warm:     'from-[#EDDFC2] via-[#CBA76E] to-[#7E5A2A]',
  };
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${ratio} ${className}`}>
      {/* grain */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      {/* motif: abstract geometric stand silhouette */}
      {motif && (
        <svg
          viewBox="0 0 200 250"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full opacity-25 mix-blend-overlay"
          aria-hidden
        >
          {motif === 'stand' && (
            <g stroke="currentColor" fill="none" strokeWidth="1.2">
              <rect x="30" y="60" width="140" height="140" />
              <rect x="40" y="110" width="60" height="90" />
              <rect x="110" y="80" width="55" height="30" />
              <line x1="30" y1="200" x2="170" y2="200" />
              <line x1="100" y1="60" x2="100" y2="200" />
            </g>
          )}
          {motif === 'arch' && (
            <g stroke="currentColor" fill="none" strokeWidth="1.2">
              <path d="M40 220 L40 100 Q100 30 160 100 L160 220" />
              <line x1="40" y1="220" x2="160" y2="220" />
              <line x1="70" y1="220" x2="70" y2="120" />
              <line x1="130" y1="220" x2="130" y2="120" />
            </g>
          )}
          {motif === 'grid' && (
            <g stroke="currentColor" fill="none" strokeWidth="0.8">
              {[...Array(6)].map((_, i) => (
                <line key={`h${i}`} x1="20" y1={50 + i * 30} x2="180" y2={50 + i * 30} />
              ))}
              {[...Array(6)].map((_, i) => (
                <line key={`v${i}`} x1={20 + i * 32} y1="50" x2={20 + i * 32} y2="230" />
              ))}
            </g>
          )}
        </svg>
      )}
      {label && (
        <div className="absolute top-5 left-5 text-[10px] tracking-[0.2em] uppercase text-white/70 font-medium">
          {label}
        </div>
      )}
      {caption && (
        <div className="absolute bottom-5 left-5 right-5 text-white/90 text-sm font-light leading-snug">
          {caption}
        </div>
      )}
    </div>
  );
}

// ── Marquee row ──────────────────────────────────────────────────────────────
function Marquee({ items }) {
  return (
    <div className="overflow-hidden border-y border-[#D8D3C8] bg-[#EFEAE0]">
      <motion.div
        className="flex gap-16 whitespace-nowrap py-6"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 text-[#1B1B1B]/70 text-sm tracking-[0.3em] uppercase font-light"
          >
            {t}
            <span className="text-[#B8882E]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ q, a, open, onClick }) {
  return (
    <div className="border-b border-[#D8D3C8]">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between gap-6 text-left group"
      >
        <span className="text-[15px] sm:text-base font-medium text-[#1B1B1B] tracking-tight">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[#1B1B1B] group-hover:text-[#B8882E] transition-colors"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-6 pr-12 text-[14px] leading-relaxed text-[#6B6A65] font-light">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Magnetic CTA button ──────────────────────────────────────────────────────
function MagneticButton({ children, href, onClick, dark = false, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setPos({ x: x * 0.25, y: y * 0.25 });
  };
  const reset = () => setPos({ x: 0, y: 0 });
  const cls = `inline-flex items-center gap-3 px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-colors duration-300 rounded-full ${
    dark
      ? 'bg-[#1B1B1B] text-[#F4F1EA] hover:bg-[#B8882E]'
      : 'bg-[#1B1B1B] text-[#F4F1EA] hover:bg-[#B8882E]'
  } ${className}`;
  const Inner = (
    <motion.span
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="inline-flex items-center gap-3"
    >
      {children}
    </motion.span>
  );
  if (href) {
    return (
      <Link
        href={href}
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={cls}
      >
        {Inner}
      </Link>
    );
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cls}
    >
      {Inner}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//   MAIN LANDING
// ════════════════════════════════════════════════════════════════════════════
export default function NewLanding({ locale, projects, clients }) {
  const tNav = useTranslations('nav');
  const tHero = useTranslations('hero');
  const tStats = useTranslations('stats');
  const tServices = useTranslations('services');
  const tFAQ = useTranslations('faq');
  const tContact = useTranslations('contact');

  // ── Body theme override (cream) ────────────────────────────────────────────
  useEffect(() => {
    const body = document.body;
    const prev = {
      bg: body.style.backgroundColor,
      color: body.style.color,
    };
    body.style.backgroundColor = '#F4F1EA';
    body.style.color = '#1B1B1B';
    return () => {
      body.style.backgroundColor = prev.bg;
      body.style.color = prev.color;
    };
  }, []);

  // ── Stats data ─────────────────────────────────────────────────────────────
  const statsItems = tStats.raw('items');

  // ── Services data ──────────────────────────────────────────────────────────
  const services = tServices.raw('items');

  // ── FAQ data ───────────────────────────────────────────────────────────────
  const faqItems = tFAQ.raw('items');
  const [openFaq, setOpenFaq] = useState(0);

  // ── Approach accordion ─────────────────────────────────────────────────────
  const [openApproach, setOpenApproach] = useState(0);

  // ── Hero parallax ──────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(heroProg, [0, 1], ['0%', '40%']);
  const heroSmallY = useTransform(heroProg, [0, 1], ['0%', '-25%']);

  // ── Wordmark reveal in footer ──────────────────────────────────────────────
  const wordmarkRef = useRef(null);
  const { scrollYProgress: wmProg } = useScroll({
    target: wordmarkRef,
    offset: ['start end', 'end end'],
  });

  // ── Approach items (custom) ────────────────────────────────────────────────
  const approachItems = [
    {
      title:
        locale === 'ru' ? 'Разработано через исследование'
        : locale === 'uz' ? 'Tadqiqot orqali ishlab chiqilgan'
        : 'Developed through deep research',
      body:
        locale === 'ru'
          ? 'Каждый проект начинается с погружения в бренд клиента, изучения целевой аудитории и анализа конкурентного поля выставки.'
          : locale === 'uz'
          ? 'Har bir loyiha mijoz brendiga chuqurlashishdan, maqsadli auditoriyani o\'rganishdan va ko\'rgazma raqobat maydonini tahlil qilishdan boshlanadi.'
          : 'Every project begins with brand immersion, audience study and a careful read of the exhibition\'s competitive landscape.',
    },
    {
      title:
        locale === 'ru' ? 'Утончённые пропорции'
        : locale === 'uz' ? 'Nozik proporsiyalar'
        : 'Refined proportions',
      body:
        locale === 'ru'
          ? 'Мы выверяем геометрию, ритм фасадов и зональные пропорции — стенд должен читаться с дистанции и работать вблизи.'
          : locale === 'uz'
          ? 'Geometriya, fasad ritmi va hududiy proporsiyalarni sinchkovlik bilan ishlab chiqamiz — stend uzoqdan o\'qilishi va yaqindan ishlashi kerak.'
          : 'We calibrate geometry, façade rhythm and zoning so the stand reads from a distance and works close-up.',
    },
    {
      title:
        locale === 'ru' ? 'Одержимость светом и материалом'
        : locale === 'uz' ? 'Yorug\'lik va materialga ehtiros'
        : 'Obsession with light and material',
      body:
        locale === 'ru'
          ? 'Освещение проектируется как самостоятельный слой архитектуры. Материалы подбираются по тактильному ощущению, а не по каталогу.'
          : locale === 'uz'
          ? 'Yoritish me\'morchilikning mustaqil qatlami sifatida loyihalanadi. Materiallar katalog bo\'yicha emas, his-tuyg\'ular bo\'yicha tanlanadi.'
          : 'Lighting is engineered as a layer of architecture in its own right. Materials are chosen by touch, not by catalogue.',
    },
  ];

  // ── Editorial copy (hero / sections) ───────────────────────────────────────
  const copy = {
    ru: {
      heroH1Top: 'Видение в форме и',
      heroH1Bot: 'функции ExpoContact',
      heroFound:
        'Основано в 2004 году. ExpoContact вырос из увлечения архитектурой ясности к ведущему голосу в строительстве выставочных стендов Центральной Азии.',
      heroQuote:
        'То, что начиналось как одна выставка в Ташкенте, превратилось в студию, где форма, свет и функция взаимодействуют ежедневно.',
      aboutLabel: '/ О нас',
      awardsLabel: 'Награды',
      aboutH:
        'Мы видим выставочный стенд как нечто большее, чем конструкцию. Это способ перевести стратегию в восприятие и построить осмысленный контакт.',
      aboutPara:
        'Мы верим в очистку дизайна до самого существенного — ясность, баланс, истина — так, чтобы остающееся было безошибочно мощным. Наш процесс начинается с понимания: вашего пространства, вашего намерения. Из этого мы лепим визуальный язык, одновременно поэтический и функциональный.',
      showMore: 'Подробнее',
      storyTitle:
        'ExpoContact — творческая студия, построенная на убеждении, что выставочный стенд — это не декорация, это повествование.',
      storyBody:
        'Мы помогаем брендам, основателям и маркетинговым командам воплощать видения через продуманные дизайн-системы, выраженный визуальный язык и целеустремлённую эстетику.',
      projectsTitle: 'Избранные проекты',
      approachTitle:
        'Наш подход сочетает выверенные европейские техники с современными производственными инновациями, создавая объекты, которые ощущаются лёгкими, но укоренёнными в точности.',
      approachIntro:
        'Наше наследие построено на эволюции. За два десятилетия мы переопределили, чем может быть выставочный стенд — от холодного модуля к скульптурному теплу.',
      sustainTitle:
        'Мы остаёмся приверженными ответственно сертифицированным материалам, этичной поставке и точному производству, которое делает работу долговечной во времени и значении.',
      sustainAside:
        'Мы формируем каждую идею с намерением — от первого эскиза до финального пикселя. Каждый компонент выполнен с заботой и точностью.',
      ctaH: 'Готовы поднять',
      ctaH2: 'вашу выставку?',
      ctaSub: 'Поделитесь брифом — мы вернёмся с концепцией в течение суток.',
      ctaBtn: 'Связаться',
      stayInformed: 'Будьте в курсе.',
      stayInspired: 'Будьте вдохновлены.',
      email: 'Ваш email',
      subscribe: 'Подписаться',
      colInfo: 'Информация',
      colNav: 'Навигация',
      colSocial: 'Социальные сети',
      infoReturn: 'Гарантия',
      infoSupport: 'Поддержка',
      infoLegal: 'Юридическое',
      navAbout: 'О нас',
      navServices: 'Услуги',
      navFaq: 'FAQ',
      navContact: 'Контакты',
      copyrights: '© 2026 ExpoContact. Все права защищены.',
      legalTerms: 'Условия использования',
      legalPrivacy: 'Конфиденциальность',
    },
    en: {
      heroH1Top: 'Vision in Form and',
      heroH1Bot: 'Function of ExpoContact',
      heroFound:
        'Founded in 2004, ExpoContact grew from a fascination with architectural clarity into a leading voice in exhibition stand construction across Central Asia.',
      heroQuote:
        'What began as a single show in Tashkent has grown into a studio where form, light and function interact daily.',
      aboutLabel: '/ About Us',
      awardsLabel: 'Awards',
      aboutH:
        'At ExpoContact, we see an exhibition stand as more than structure. It is a way to translate strategy into perception and build meaningful contact.',
      aboutPara:
        'We believe in stripping design down to its most essential elements — clarity, balance, truth — so that what remains is unmistakably powerful. Our process starts with understanding: your space, your intent. From there, we sculpt a visual language that is both poetic and functional.',
      showMore: 'Show More',
      storyTitle:
        'ExpoContact is a creative studio built on the belief that an exhibition stand is not decoration — it is storytelling.',
      storyBody:
        'We help brands, founders and marketing teams bring their visions to life through sophisticated design systems, distinctive visual identities and purposeful aesthetics.',
      projectsTitle: 'Selected Projects',
      approachTitle:
        'Our approach fuses time-honoured European techniques with modern manufacturing innovation, creating objects that feel weightless, yet grounded in precision.',
      approachIntro:
        'Our legacy is built on evolution. Over two decades we have redefined what an exhibition stand can be — from cold modular grids to sculptural warmth.',
      sustainTitle:
        'We remain committed to responsibly sourced materials, ethical supply and refined production processes that ensure our work endures in both time and relevance.',
      sustainAside:
        'We shape every idea with intent, from the first sketch to the final pixel. Each component is handled with precision and care.',
      ctaH: 'Ready to Elevate',
      ctaH2: 'Your Exhibition?',
      ctaSub: 'Share a brief — we will respond with a concept within 24 hours.',
      ctaBtn: 'Contact Us',
      stayInformed: 'Stay Informed.',
      stayInspired: 'Stay Inspired.',
      email: 'Your email',
      subscribe: 'Subscribe',
      colInfo: 'Information',
      colNav: 'Navigation',
      colSocial: 'Social Media',
      infoReturn: 'Warranty',
      infoSupport: 'Support',
      infoLegal: 'Legal',
      navAbout: 'About',
      navServices: 'Services',
      navFaq: 'FAQ',
      navContact: 'Contact',
      copyrights: '© 2026 ExpoContact. All rights reserved.',
      legalTerms: 'Terms of Use',
      legalPrivacy: 'Privacy Policy',
    },
    uz: {
      heroH1Top: 'Shakl va funksiyada',
      heroH1Bot: 'ExpoContact ko\'rinishi',
      heroFound:
        '2004 yilda asos solingan. ExpoContact me\'moriy aniqlikka qiziqishdan Markaziy Osiyodagi ko\'rgazma stendlari yetakchi ovoziga aylangan.',
      heroQuote:
        'Toshkentdagi bitta ko\'rgazma sifatida boshlangan narsa shakl, yorug\'lik va funksiya kunlik o\'zaro ta\'sirlashadigan studiyaga aylandi.',
      aboutLabel: '/ Biz haqimizda',
      awardsLabel: 'Mukofotlar',
      aboutH:
        'ExpoContactda biz ko\'rgazma stendini konstruksiyadan ko\'ra ko\'proq narsa deb bilamiz. Bu strategiyani idrokga aylantirish va mazmunli aloqa qurish usulidir.',
      aboutPara:
        'Biz dizaynni eng muhim elementlarga — aniqlik, muvozanat, haqiqat — qisqartirishga ishonamiz, shunda qoladigan narsa shubhasiz kuchli bo\'ladi. Jarayonimiz tushunishdan boshlanadi: maydoningiz, niyatingiz. Bundan keyin biz ham she\'riy, ham funksional vizual tilni shakllantiramiz.',
      showMore: 'Batafsil',
      storyTitle:
        'ExpoContact — ko\'rgazma stendi bezak emas, balki hikoya degan ishonchga asoslangan ijodiy studio.',
      storyBody:
        'Brendlar, ta\'sischilar va marketing jamoalariga murakkab dizayn tizimlari, o\'ziga xos vizual o\'ziga xosliklar va maqsadli estetika orqali tasavvurlarni hayotga olib chiqishga yordam beramiz.',
      projectsTitle: 'Tanlangan loyihalar',
      approachTitle:
        'Bizning yondashuvimiz an\'anaviy Yevropa texnikalarini zamonaviy ishlab chiqarish innovatsiyasi bilan birlashtiradi, vaznsiz, lekin aniqlikka asoslangan obyektlarni yaratadi.',
      approachIntro:
        'Bizning merosimiz evolyutsiyaga asoslangan. Yigirma yil ichida biz ko\'rgazma stendi nima bo\'lishi mumkinligini qayta belgilab oldik.',
      sustainTitle:
        'Biz mas\'uliyatli olingan materiallarga, axloqiy yetkazib berishga va mehnatimizning vaqt va dolzarbligida davom etishini ta\'minlaydigan nozik ishlab chiqarish jarayonlariga sodiq qolamiz.',
      sustainAside:
        'Birinchi eskizdan oxirgi piksellargacha har bir g\'oyani niyat bilan shakllantiramiz. Har bir komponent aniqlik va g\'amxo\'rlik bilan ishlanadi.',
      ctaH: 'Ko\'rgazmangizni',
      ctaH2: 'yuksaltirishga tayyormisiz?',
      ctaSub: 'Brifni yuboring — 24 soat ichida konsepsiya bilan javob beramiz.',
      ctaBtn: 'Bog\'lanish',
      stayInformed: 'Xabardor bo\'ling.',
      stayInspired: 'Ilhomlangan bo\'ling.',
      email: 'Email manzilingiz',
      subscribe: 'Obuna bo\'lish',
      colInfo: 'Ma\'lumot',
      colNav: 'Navigatsiya',
      colSocial: 'Ijtimoiy tarmoqlar',
      infoReturn: 'Kafolat',
      infoSupport: 'Yordam',
      infoLegal: 'Huquqiy',
      navAbout: 'Biz haqimizda',
      navServices: 'Xizmatlar',
      navFaq: 'FAQ',
      navContact: 'Aloqa',
      copyrights: '© 2026 ExpoContact. Barcha huquqlar himoyalangan.',
      legalTerms: 'Foydalanish shartlari',
      legalPrivacy: 'Maxfiylik siyosati',
    },
  };
  const c = copy[locale] || copy.en;

  // ── Marquee items ──────────────────────────────────────────────────────────
  const marqueeItems = [
    'UzAutoShow', 'AgriExpo CA', 'TechExpo', 'WorldFood Uz',
    'OGU Expo', 'Tashkent Build', 'BeautyExpo', 'Pharma CA',
  ];

  return (
    <>
      {/* Fonts: Fraunces (serif) for editorial display, Inter already loaded by layout */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&display=swap"
      />

      <div
        className="min-h-screen bg-[#F4F1EA] text-[#1B1B1B] selection:bg-[#1B1B1B] selection:text-[#F4F1EA] antialiased"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Local utility classes via inline style tag */}
        <style jsx global>{`
          .font-serif-display { font-family: 'Fraunces', 'Times New Roman', serif; font-feature-settings: 'ss01'; letter-spacing: -0.02em; }
          .nm-link { position: relative; }
          .nm-link::after {
            content: '';
            position: absolute;
            left: 0; right: 0;
            bottom: -3px;
            height: 1px;
            background: currentColor;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
          }
          .nm-link:hover::after { transform: scaleX(1); transform-origin: left; }
          .editorial-hr { background: linear-gradient(90deg, transparent, #B8B1A0 50%, transparent); height: 1px; }
        `}</style>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  NAV                                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <NavBar copy={c} locale={locale} />

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  HERO                                                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative pt-28 sm:pt-32 pb-24 px-6 sm:px-10 max-w-[1400px] mx-auto"
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Top headline */}
            <div className="col-span-12 lg:col-span-8 relative z-10">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-[11px] tracking-[0.25em] uppercase text-[#6B6A65] mb-6 font-medium"
              >
                EST. 2004 — Tashkent · Central Asia
              </motion.p>

              <h1 className="font-serif-display text-[12vw] sm:text-[8.5vw] lg:text-[6.2vw] leading-[0.95] font-light text-[#1B1B1B]">
                <span className="block">
                  <SplitHeadline text={c.heroH1Top} delay={0.3} />
                </span>
                <span className="block italic font-normal text-[#1B1B1B]/95">
                  <SplitHeadline text={c.heroH1Bot} delay={0.6} />
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8, ease: EASE }}
                className="mt-10 max-w-md text-sm leading-relaxed text-[#6B6A65] font-light"
              >
                {c.heroFound}
              </motion.p>
            </div>

            {/* Top-right floating image */}
            <motion.div
              style={{ y: heroImgY }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: EASE }}
              className="col-span-12 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:-mt-4 text-[#1B1B1B]"
            >
              <ImageBlock
                tone="charcoal"
                ratio="aspect-[3/4]"
                motif="stand"
                label="Featured Project"
                caption="Silk Road Motors — UzAutoShow 2023"
                className="w-full lg:max-w-[320px] lg:ml-auto"
              />
            </motion.div>

            {/* Bottom-left small image + center quote */}
            <motion.div
              style={{ y: heroSmallY }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1, ease: EASE }}
              className="col-span-6 lg:col-span-3 mt-16"
            >
              <ImageBlock
                tone="warm"
                ratio="aspect-[5/4]"
                motif="arch"
                label="In Studio"
                className="w-full"
              />
            </motion.div>

            <div className="col-span-12 lg:col-span-5 lg:col-start-5 mt-16 lg:mt-32 flex items-center">
              <Reveal delay={0.2}>
                <p className="font-serif-display text-2xl sm:text-[28px] leading-snug italic font-light text-[#1B1B1B]/90 max-w-xl">
                  &ldquo;{c.heroQuote}&rdquo;
                </p>
              </Reveal>
            </div>
          </div>

          {/* scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute right-6 sm:right-10 bottom-10 flex flex-col items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#6B6A65]"
          >
            <span>Scroll</span>
            <motion.span
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-10 bg-gradient-to-b from-[#6B6A65] to-transparent"
            />
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  STATS                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-b border-[#D8D3C8]">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D8D3C8]">
            {statsItems.slice(0, 3).map((s, i) => (
              <Reveal
                key={i}
                delay={i * 0.15}
                className="px-8 sm:px-12 py-12 sm:py-16 flex flex-col gap-3"
              >
                <div className="font-serif-display text-5xl sm:text-6xl font-light text-[#1B1B1B]">
                  <CountUp to={s.value} suffix={s.suffix || ''} duration={2 + i * 0.3} />
                </div>
                <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6A65] font-medium">
                  {s.label}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  ABOUT                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="flex justify-between items-baseline mb-16 text-[11px] tracking-[0.25em] uppercase text-[#6B6A65]">
            <span>{c.aboutLabel}</span>
            <span>{c.awardsLabel}</span>
          </div>

          <Reveal>
            <h2 className="font-serif-display text-3xl sm:text-[40px] lg:text-[52px] leading-[1.15] font-light max-w-4xl mx-auto text-center text-[#1B1B1B]">
              {c.aboutH}
            </h2>
          </Reveal>

          <div className="grid grid-cols-12 gap-6 mt-20">
            <Reveal className="col-span-12 lg:col-span-5 lg:col-start-8 order-1 lg:order-2" delay={0.1}>
              <div className="bg-[#EFEAE0] p-8 sm:p-10 rounded-sm">
                <p className="text-[14px] leading-relaxed text-[#1B1B1B]/85 font-light mb-6">
                  {c.aboutPara}
                </p>
                <button className="inline-flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-[#1B1B1B] nm-link font-medium">
                  {c.showMore}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </Reveal>

            <Reveal className="col-span-6 lg:col-span-3 lg:col-start-1 order-2 lg:order-1 mt-10 lg:mt-16" delay={0.2}>
              <ImageBlock tone="bronze" ratio="aspect-[3/4]" motif="grid" />
            </Reveal>

            <Reveal className="col-span-6 lg:col-span-4 order-3 mt-10 lg:mt-32" delay={0.3}>
              <ImageBlock tone="stone" ratio="aspect-[5/4]" motif="stand" />
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  MARQUEE                                                          */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <Marquee items={marqueeItems} />

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  STORY                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-8 items-start">
            <Reveal className="col-span-12 lg:col-span-7">
              <h2 className="font-serif-display text-3xl sm:text-[42px] lg:text-[48px] leading-[1.15] font-light text-[#1B1B1B] max-w-3xl">
                {c.storyTitle}
              </h2>
              <p className="mt-10 max-w-xl text-[15px] leading-relaxed text-[#6B6A65] font-light">
                {c.storyBody}
              </p>

              {/* Projects list with arrow */}
              <div className="mt-16">
                <div className="text-[11px] tracking-[0.25em] uppercase text-[#6B6A65] mb-6 font-medium">
                  {c.projectsTitle}
                </div>
                <div className="border-t border-[#D8D3C8]">
                  {projects.slice(0, 4).map((p, i) => (
                    <ProjectRow key={p.id} project={p} delay={i * 0.1} />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-32" delay={0.3}>
              <ImageBlock tone="charcoal" ratio="aspect-[3/4]" motif="arch" label="Heritage" />
              <p className="mt-6 text-xs text-[#6B6A65] font-light leading-relaxed max-w-xs">
                {locale === 'ru'
                  ? 'Мы формируем каждую идею с намерением — от первого эскиза до финального исполнения. Каждый объект обрабатывается с заботой и точностью.'
                  : locale === 'uz'
                  ? 'Birinchi eskizdan oxirgi bajarilishigacha har bir g\'oyani niyat bilan shakllantiramiz. Har bir obyekt g\'amxo\'rlik va aniqlik bilan ishlanadi.'
                  : 'We shape every idea with intent — from the first sketch to the final execution. Each object is handled with care and precision.'}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  APPROACH                                                         */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="bg-[#EFEAE0] py-24 sm:py-32">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-12 gap-8">
            <Reveal className="col-span-12 lg:col-span-7">
              <h2 className="font-serif-display text-2xl sm:text-[34px] lg:text-[40px] leading-[1.2] font-light max-w-2xl text-[#1B1B1B]">
                {c.approachTitle}
              </h2>
              <p className="mt-10 max-w-md text-[14px] leading-relaxed text-[#6B6A65] font-light">
                {c.approachIntro}
              </p>

              <div className="mt-16 border-t border-[#D8D3C8]">
                {approachItems.map((item, i) => (
                  <div key={i} className="border-b border-[#D8D3C8]">
                    <button
                      onClick={() => setOpenApproach(openApproach === i ? -1 : i)}
                      className="w-full py-5 flex items-center justify-between gap-6 text-left group"
                    >
                      <span className="flex items-center gap-6">
                        <span className="text-[11px] tracking-[0.2em] text-[#6B6A65] font-medium">
                          0{i + 1}
                        </span>
                        <span className="text-[15px] font-medium text-[#1B1B1B]">
                          {item.title}
                        </span>
                      </span>
                      <motion.span
                        animate={{ rotate: openApproach === i ? 45 : 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="text-[#1B1B1B] group-hover:text-[#B8882E] transition-colors"
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {openApproach === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 pl-14 pr-12 text-[14px] leading-relaxed text-[#6B6A65] font-light">
                            {item.body}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.2}>
              <ImageBlock tone="sand" ratio="aspect-[4/5]" motif="stand" label="Process" />
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SUSTAINABILITY                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <Reveal>
            <h2 className="font-serif-display text-2xl sm:text-[34px] lg:text-[40px] leading-[1.2] font-light max-w-3xl text-[#1B1B1B]">
              {c.sustainTitle}
            </h2>
          </Reveal>

          <div className="grid grid-cols-12 gap-6 mt-20">
            <Reveal className="col-span-6 lg:col-span-4" delay={0.1}>
              <ImageBlock tone="beige" ratio="aspect-[4/5]" motif="grid" label="Materials" />
            </Reveal>
            <Reveal className="col-span-6 lg:col-span-5" delay={0.25}>
              <ImageBlock tone="stone" ratio="aspect-[5/4]" motif="stand" label="Production" />
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-3 lg:flex lg:items-end" delay={0.4}>
              <p className="text-[13px] leading-relaxed text-[#6B6A65] font-light">
                {c.sustainAside}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FAQ                                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="bg-[#EFEAE0] py-24 sm:py-32">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-12 gap-8">
            <Reveal className="col-span-12 lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
              <div className="text-[11px] tracking-[0.25em] uppercase text-[#6B6A65] mb-6 font-medium">
                / {tFAQ('title')}
              </div>
              <h2 className="font-serif-display text-2xl sm:text-[32px] lg:text-[38px] leading-[1.2] font-light text-[#1B1B1B]">
                {locale === 'ru'
                  ? 'Мы верим в прозрачность, точность и простоту — не только в дизайне, но и в коммуникации.'
                  : locale === 'uz'
                  ? 'Biz shaffoflik, aniqlik va soddalikka ishonamiz — nafaqat dizaynda, balki muloqotda ham.'
                  : 'We believe in transparency, precision and simplicity — not only in our designs but in how we communicate.'}
              </h2>
              <div className="mt-10 hidden lg:block">
                <ImageBlock tone="beige" ratio="aspect-[4/3]" motif="arch" />
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6" delay={0.1}>
              <div className="border-t border-[#D8D3C8]">
                {faqItems.map((it, i) => (
                  <AccordionItem
                    key={i}
                    q={it.q}
                    a={it.a}
                    open={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  CTA                                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32 grid grid-cols-12 gap-8 items-center relative">
            <Reveal className="col-span-12 lg:col-span-6">
              <h2 className="font-serif-display text-5xl sm:text-6xl lg:text-[88px] leading-[1.02] font-light text-[#1B1B1B]">
                <span className="block"><SplitHeadline text={c.ctaH} delay={0.1} /></span>
                <span className="block italic"><SplitHeadline text={c.ctaH2} delay={0.4} /></span>
              </h2>
              <p className="mt-8 text-[14px] text-[#6B6A65] max-w-md font-light leading-relaxed">
                {c.ctaSub}
              </p>
              <Reveal delay={0.7} className="mt-10">
                <MagneticButton href={`/${locale}#contacts`}>
                  {c.ctaBtn}
                  <span aria-hidden>→</span>
                </MagneticButton>
              </Reveal>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-5 lg:col-start-8" delay={0.2}>
              <ImageBlock tone="charcoal" ratio="aspect-[4/3]" motif="stand" label="Reserved Stand" />
            </Reveal>

            {/* decorative orb */}
            <motion.div
              aria-hidden
              className="absolute -right-32 -top-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#D6CDB8] to-transparent opacity-40 blur-3xl"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FOOTER                                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <footer className="bg-[#0F0E0C] text-[#F4F1EA] pt-20 pb-0 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
            {/* Top row: newsletter + columns */}
            <div className="grid grid-cols-12 gap-8 pb-20">
              <Reveal className="col-span-12 lg:col-span-5">
                <h3 className="font-serif-display text-3xl sm:text-4xl font-light leading-tight">
                  {c.stayInformed}<br />
                  <span className="italic">{c.stayInspired}</span>
                </h3>
                <form
                  className="mt-8 flex items-center border-b border-[#F4F1EA]/30 pb-3 max-w-md"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder={c.email}
                    className="bg-transparent flex-1 text-sm text-[#F4F1EA] placeholder:text-[#F4F1EA]/50 focus:outline-none font-light"
                  />
                  <button
                    type="submit"
                    className="text-[11px] tracking-[0.25em] uppercase text-[#F4F1EA]/70 hover:text-[#B8882E] transition-colors font-medium"
                  >
                    {c.subscribe} →
                  </button>
                </form>
              </Reveal>

              <Reveal className="col-span-6 lg:col-span-2 lg:col-start-7" delay={0.1}>
                <FooterColumn title={c.colInfo} items={[c.infoReturn, c.infoSupport, c.infoLegal]} />
              </Reveal>
              <Reveal className="col-span-6 lg:col-span-2" delay={0.15}>
                <FooterColumn
                  title={c.colNav}
                  items={[c.navAbout, c.navServices, c.navFaq, c.navContact]}
                />
              </Reveal>
              <Reveal className="col-span-12 lg:col-span-2" delay={0.2}>
                <FooterColumn title={c.colSocial} items={['Instagram', 'Telegram', 'LinkedIn']} />
              </Reveal>
            </div>

            {/* Wordmark — animated scroll reveal */}
            <div ref={wordmarkRef} className="relative">
              <WordmarkReveal text="expocontact" progress={wmProg} />
            </div>

            {/* bottom row */}
            <div className="border-t border-[#F4F1EA]/20 mt-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] tracking-[0.15em] uppercase text-[#F4F1EA]/50">
              <span>{c.copyrights}</span>
              <div className="flex items-center gap-6">
                <Link href={`/${locale}`} className="hover:text-[#B8882E] transition-colors">
                  {c.legalTerms}
                </Link>
                <Link href={`/${locale}`} className="hover:text-[#B8882E] transition-colors">
                  {c.legalPrivacy}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//   SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function NavBar({ copy: c, locale }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#F4F1EA]/85 backdrop-blur-md border-b border-[#D8D3C8]/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href={`/${locale}/new`} className="flex items-center gap-2">
          <span className="font-serif-display text-xl font-medium tracking-tight text-[#1B1B1B]">
            expo<span className="italic font-light">contact</span>
          </span>
        </Link>

        {/* Center nav (split into two groups like Tonelli) */}
        <div className="hidden lg:flex items-center gap-10 text-[12px] text-[#1B1B1B]/85 font-medium">
          <div className="flex flex-col items-end">
            <a href="#about" className="nm-link">{c.navAbout}</a>
            <a href="#services" className="nm-link text-[#1B1B1B]/60 text-[11px]">{c.navServices}</a>
          </div>
          <div className="flex flex-col items-end">
            <a href="#projects" className="nm-link">Projects</a>
            <a href="#approach" className="nm-link text-[#1B1B1B]/60 text-[11px]">Approach</a>
          </div>
          <div className="flex flex-col items-end">
            <a href="#faq" className="nm-link">FAQ</a>
            <a href="#story" className="nm-link text-[#1B1B1B]/60 text-[11px]">Story</a>
          </div>
        </div>

        {/* Right: locale + contact */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1B1B1B]/70">
            {['ru', 'en', 'uz'].map((l, i) => (
              <span key={l} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#1B1B1B]/30">·</span>}
                <Link
                  href={`/${l}/new`}
                  className={l === locale ? 'text-[#1B1B1B] font-semibold' : 'hover:text-[#1B1B1B]'}
                >
                  {l.toUpperCase()}
                </Link>
              </span>
            ))}
          </div>
          <a
            href="#contact"
            className="text-[12px] font-medium text-[#1B1B1B] nm-link"
          >
            {c.navContact}
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

function ProjectRow({ project, delay }) {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className="flex items-center justify-between py-5 border-b border-[#D8D3C8] group"
    >
      <div className="flex items-baseline gap-6 min-w-0">
        <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6A65] font-medium tabular-nums">
          {project.year}
        </span>
        <span className="text-[14px] sm:text-[15px] font-medium text-[#1B1B1B] truncate group-hover:text-[#B8882E] transition-colors">
          {project.title}
        </span>
      </div>
      <motion.span
        className="shrink-0 text-[#1B1B1B] group-hover:text-[#B8882E]"
        initial={{ x: 0 }}
        whileHover={{ x: 6 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 12L12 2M12 2H4M12 2V10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </motion.span>
    </motion.a>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="text-[11px] tracking-[0.25em] uppercase text-[#F4F1EA]/50 mb-5 font-medium">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i}>
            <a href="#" className="text-[13px] text-[#F4F1EA]/85 hover:text-[#B8882E] transition-colors font-light">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WordmarkReveal({ text, progress }) {
  const letters = text.split('');
  return (
    <div className="relative w-full flex items-end justify-center select-none">
      <h2
        className="font-serif-display font-light text-[#F4F1EA] leading-[0.85] text-center"
        style={{ fontSize: 'clamp(64px, 16vw, 240px)', letterSpacing: '-0.04em' }}
      >
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, ease: EASE, delay: i * 0.04 }}
          >
            {ch}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}
