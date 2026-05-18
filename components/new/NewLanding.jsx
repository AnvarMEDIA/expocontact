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
 *  ExpoContact /new — modern editorial redesign
 *  Pure white background · brand navy + gold accents · Inter throughout
 *  Tightly-clamped typography for 1K → 2K screens · heavy motion
 * ────────────────────────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1];
const LOGO_W = 'https://static.tildacdn.one/tild3233-3438-4034-a138-316162306464/ExpoContact_-_Logo_W.png';

const COLORS = {
  bg:       '#FFFFFF',
  text:     '#0A0F1E',
  muted:    '#5F6679',
  divider:  '#E5E7EB',
  soft:     '#F8F9FB',
  accent:   '#D4A843',
  accentDk: '#B8882E',
  dark:     '#0A0F1E',
};

// ── Word-by-word reveal ──────────────────────────────────────────────────────
function SplitHeadline({ text, className = '', delay = 0, stagger = 0.05 }) {
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

// ── Scroll-reveal wrapper ────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 32, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Number counter ───────────────────────────────────────────────────────────
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

// ── Image placeholder — clean light gradients with subtle motifs ─────────────
function ImageBlock({
  tone = 'cream',
  ratio = 'aspect-[4/5]',
  className = '',
  label,
  caption,
  motif,
  hover = true,
}) {
  const tones = {
    cream:    'from-[#F5F2EC] via-[#E8E2D2] to-[#C9BFA3]',
    sand:     'from-[#EFE6D0] via-[#D9C89D] to-[#A88D5C]',
    dark:     'from-[#1A2238] via-[#0F1729] to-[#050811]',
    stone:    'from-[#EDEEF1] via-[#C9CCD3] to-[#8E919A]',
    gold:     'from-[#E8C06E] via-[#D4A843] to-[#9C7A24]',
    paper:    'from-[#FAFAF7] via-[#EFECDF] to-[#D9D3BE]',
  };
  return (
    <motion.div
      whileHover={hover ? { scale: 1.015 } : undefined}
      transition={{ duration: 0.5, ease: EASE }}
      className={`relative overflow-hidden bg-gradient-to-br ${tones[tone]} ${ratio} ${className} rounded-[2px] shadow-[0_1px_2px_rgba(10,15,30,0.04)]`}
    >
      {/* fine grain */}
      <div
        className="absolute inset-0 mix-blend-soft-light opacity-50 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
      {motif && (
        <svg
          viewBox="0 0 200 250"
          preserveAspectRatio="xMidYMid meet"
          className={`absolute inset-0 w-full h-full opacity-30 mix-blend-overlay ${
            tone === 'dark' ? 'text-white' : 'text-[#0A0F1E]'
          }`}
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
        <div
          className={`absolute top-5 left-5 text-[10px] tracking-[0.22em] uppercase font-medium ${
            tone === 'dark' ? 'text-white/70' : 'text-[#0A0F1E]/60'
          }`}
        >
          {label}
        </div>
      )}
      {caption && (
        <div
          className={`absolute bottom-5 left-5 right-5 text-sm font-light leading-snug ${
            tone === 'dark' ? 'text-white/90' : 'text-[#0A0F1E]/80'
          }`}
        >
          {caption}
        </div>
      )}
    </motion.div>
  );
}

// ── Marquee ──────────────────────────────────────────────────────────────────
function Marquee({ items }) {
  return (
    <div className="overflow-hidden border-y border-[#E5E7EB] bg-[#F8F9FB]">
      <motion.div
        className="flex gap-16 whitespace-nowrap py-7"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
      >
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 text-[#0A0F1E]/65 tracking-[0.28em] uppercase font-medium"
            style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}
          >
            {t}
            <span className="text-[#D4A843]">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ q, a, open, onClick }) {
  return (
    <div className="border-b border-[#E5E7EB]">
      <button
        onClick={onClick}
        className="w-full py-7 flex items-center justify-between gap-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-4 focus-visible:ring-offset-white rounded-sm"
      >
        <span
          className="font-medium text-[#0A0F1E] tracking-tight pr-6"
          style={{ fontSize: 'clamp(15px, 1.15vw, 18px)' }}
        >
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="shrink-0 w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#0A0F1E] group-hover:border-[#D4A843] group-hover:text-[#D4A843] transition-colors"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.4" />
            <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.4" />
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
            <p
              className="pb-7 pr-14 leading-relaxed text-[#5F6679] font-light"
              style={{ fontSize: 'clamp(14px, 1vw, 16px)' }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Magnetic CTA ─────────────────────────────────────────────────────────────
function MagneticButton({ children, href, onClick, variant = 'dark', className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setPos({ x: x * 0.22, y: y * 0.22 });
  };
  const reset = () => setPos({ x: 0, y: 0 });

  const styles = {
    dark:  'bg-[#0A0F1E] text-white hover:bg-[#D4A843]',
    gold:  'bg-[#D4A843] text-[#0A0F1E] hover:bg-[#E8C06E]',
    ghost: 'bg-transparent text-[#0A0F1E] border border-[#0A0F1E] hover:bg-[#0A0F1E] hover:text-white',
  };

  const cls = `inline-flex items-center gap-3 px-9 py-4 tracking-[0.15em] uppercase font-semibold transition-colors duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-2 focus-visible:ring-offset-white ${styles[variant]} ${className}`;
  const sizeStyle = { fontSize: 'clamp(12px, 0.85vw, 14px)' };

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
        style={sizeStyle}
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
      style={sizeStyle}
    >
      {Inner}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//   MAIN LANDING
// ════════════════════════════════════════════════════════════════════════════
export default function NewLanding({ locale, projects, clients }) {
  const tStats = useTranslations('stats');
  const tFAQ = useTranslations('faq');

  // ── Body theme override ────────────────────────────────────────────────────
  useEffect(() => {
    const body = document.body;
    const prev = {
      bg: body.style.backgroundColor,
      color: body.style.color,
    };
    body.style.backgroundColor = COLORS.bg;
    body.style.color = COLORS.text;
    return () => {
      body.style.backgroundColor = prev.bg;
      body.style.color = prev.color;
    };
  }, []);

  const statsItems = tStats.raw('items');
  const faqItems = tFAQ.raw('items');
  const [openFaq, setOpenFaq] = useState(0);
  const [openApproach, setOpenApproach] = useState(0);

  // ── Scroll progress bar ────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll();
  const progressX = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // ── Active section detection ───────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('hero');
  useEffect(() => {
    const sections = ['hero', 'about', 'story', 'approach', 'sustain', 'faq', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // ── Hero parallax ──────────────────────────────────────────────────────────
  const heroRef = useRef(null);
  const { scrollYProgress: heroProg } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImgY = useTransform(heroProg, [0, 1], ['0%', '38%']);
  const heroSmallY = useTransform(heroProg, [0, 1], ['0%', '-22%']);

  // ── Wordmark scroll ref ────────────────────────────────────────────────────
  const wordmarkRef = useRef(null);

  // ── Approach items ─────────────────────────────────────────────────────────
  const approachItems = [
    {
      title:
        locale === 'ru' ? 'Глубокое исследование'
        : locale === 'uz' ? 'Chuqur tadqiqot'
        : 'Deep research',
      body:
        locale === 'ru'
          ? 'Каждый проект начинается с погружения в бренд клиента, изучения аудитории и анализа конкурентного поля выставки.'
          : locale === 'uz'
          ? 'Har bir loyiha mijoz brendiga chuqurlashishdan, auditoriyani o\'rganishdan va raqobat maydonini tahlil qilishdan boshlanadi.'
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
          ? 'Geometriya, fasad ritmi va hududiy proporsiyalarni sinchkovlik bilan ishlab chiqamiz.'
          : 'We calibrate geometry, façade rhythm and zoning so the stand reads from a distance and works close-up.',
    },
    {
      title:
        locale === 'ru' ? 'Свет и материал как архитектура'
        : locale === 'uz' ? 'Yorug\'lik va material — me\'morchilik kabi'
        : 'Light & material as architecture',
      body:
        locale === 'ru'
          ? 'Освещение проектируется как самостоятельный слой архитектуры. Материалы подбираются по тактильному ощущению.'
          : locale === 'uz'
          ? 'Yoritish me\'morchilikning mustaqil qatlami sifatida loyihalanadi. Materiallar his-tuyg\'ular bo\'yicha tanlanadi.'
          : 'Lighting is engineered as a layer of architecture. Materials are chosen by touch, not by catalogue.',
    },
  ];

  // ── Editorial copy ─────────────────────────────────────────────────────────
  const copy = {
    ru: {
      heroEst: 'Основано в 2004 — Ташкент · Центральная Азия',
      heroH1Top: 'Видение в форме',
      heroH1Bot: 'и функции стенда',
      heroFound: 'ExpoContact вырос из увлечения архитектурой ясности к ведущему голосу в строительстве выставочных стендов Центральной Азии.',
      heroQuote: 'То, что начиналось как одна выставка в Ташкенте, превратилось в студию, где форма, свет и функция взаимодействуют ежедневно.',
      aboutLabel: 'О нас',
      awardsLabel: 'Награды и пресса',
      aboutH: 'Мы видим выставочный стенд как нечто большее, чем конструкцию. Это способ перевести стратегию в восприятие и построить осмысленный контакт.',
      aboutPara: 'Мы верим в очистку дизайна до самого существенного — ясность, баланс, истина — так, чтобы остающееся было безошибочно мощным. Наш процесс начинается с понимания: вашего пространства, вашего намерения.',
      showMore: 'Подробнее',
      storyTitle: 'ExpoContact — творческая студия, построенная на убеждении, что выставочный стенд это не декорация, это повествование.',
      storyBody: 'Мы помогаем брендам, основателям и маркетинговым командам воплощать видения через продуманные дизайн-системы, выраженный визуальный язык и целеустремлённую эстетику.',
      projectsTitle: 'Избранные проекты',
      approachTitle: 'Наш подход сочетает выверенные европейские техники с современными производственными инновациями, создавая объекты, которые ощущаются лёгкими, но укоренёнными в точности.',
      approachIntro: 'Наше наследие построено на эволюции. За два десятилетия мы переопределили, чем может быть выставочный стенд.',
      sustainTitle: 'Мы остаёмся приверженными ответственно сертифицированным материалам, этичной поставке и точному производству, которое делает работу долговечной во времени и значении.',
      sustainAside: 'Мы формируем каждую идею с намерением — от первого эскиза до финального исполнения.',
      ctaH: 'Готовы поднять',
      ctaH2: 'вашу выставку?',
      ctaSub: 'Поделитесь брифом — мы вернёмся с концепцией в течение 24 часов.',
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
      navProjects: 'Проекты',
      navApproach: 'Подход',
      navFaq: 'FAQ',
      navContact: 'Контакты',
      copyrights: '© 2026 ExpoContact. Все права защищены.',
      legalTerms: 'Условия использования',
      legalPrivacy: 'Конфиденциальность',
      skipToContent: 'Перейти к содержанию',
    },
    en: {
      heroEst: 'EST. 2004 — Tashkent · Central Asia',
      heroH1Top: 'Vision in form',
      heroH1Bot: 'and function',
      heroFound: 'ExpoContact grew from a fascination with architectural clarity into a leading voice in exhibition stand construction across Central Asia.',
      heroQuote: 'What began as a single show in Tashkent has grown into a studio where form, light and function interact daily.',
      aboutLabel: 'About',
      awardsLabel: 'Awards & Press',
      aboutH: 'At ExpoContact, we see an exhibition stand as more than structure. It is a way to translate strategy into perception and build meaningful contact.',
      aboutPara: 'We believe in stripping design down to its most essential elements — clarity, balance, truth — so that what remains is unmistakably powerful. Our process starts with understanding: your space, your intent.',
      showMore: 'Show More',
      storyTitle: 'ExpoContact is a creative studio built on the belief that an exhibition stand is not decoration — it is storytelling.',
      storyBody: 'We help brands, founders and marketing teams bring their visions to life through sophisticated design systems, distinctive visual identities and purposeful aesthetics.',
      projectsTitle: 'Selected Projects',
      approachTitle: 'Our approach fuses time-honoured European techniques with modern manufacturing innovation, creating objects that feel weightless, yet grounded in precision.',
      approachIntro: 'Our legacy is built on evolution. Over two decades we have redefined what an exhibition stand can be.',
      sustainTitle: 'We remain committed to responsibly sourced materials, ethical supply and refined production processes that ensure our work endures.',
      sustainAside: 'We shape every idea with intent — from the first sketch to the final pixel.',
      ctaH: 'Ready to elevate',
      ctaH2: 'your exhibition?',
      ctaSub: 'Share a brief — we will respond with a concept within 24 hours.',
      ctaBtn: 'Contact Us',
      stayInformed: 'Stay informed.',
      stayInspired: 'Stay inspired.',
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
      navProjects: 'Projects',
      navApproach: 'Approach',
      navFaq: 'FAQ',
      navContact: 'Contact',
      copyrights: '© 2026 ExpoContact. All rights reserved.',
      legalTerms: 'Terms of Use',
      legalPrivacy: 'Privacy Policy',
      skipToContent: 'Skip to content',
    },
    uz: {
      heroEst: '2004 yildan — Toshkent · Markaziy Osiyo',
      heroH1Top: 'Shakl va funksiyada',
      heroH1Bot: 'stend ko\'rinishi',
      heroFound: 'ExpoContact me\'moriy aniqlikka qiziqishdan Markaziy Osiyodagi ko\'rgazma stendlari yetakchi ovoziga aylangan.',
      heroQuote: 'Toshkentdagi bitta ko\'rgazma sifatida boshlangan narsa shakl, yorug\'lik va funksiya kunlik o\'zaro ta\'sirlashadigan studiyaga aylandi.',
      aboutLabel: 'Biz haqimizda',
      awardsLabel: 'Mukofotlar',
      aboutH: 'ExpoContactda biz ko\'rgazma stendini konstruksiyadan ko\'ra ko\'proq narsa deb bilamiz. Bu strategiyani idrokga aylantirish va mazmunli aloqa qurish usulidir.',
      aboutPara: 'Biz dizaynni eng muhim elementlarga — aniqlik, muvozanat, haqiqat — qisqartirishga ishonamiz. Jarayonimiz tushunishdan boshlanadi: maydoningiz, niyatingiz.',
      showMore: 'Batafsil',
      storyTitle: 'ExpoContact — ko\'rgazma stendi bezak emas, balki hikoya degan ishonchga asoslangan ijodiy studio.',
      storyBody: 'Brendlar, ta\'sischilar va marketing jamoalariga murakkab dizayn tizimlari va maqsadli estetika orqali tasavvurlarni hayotga olib chiqishga yordam beramiz.',
      projectsTitle: 'Tanlangan loyihalar',
      approachTitle: 'Bizning yondashuvimiz an\'anaviy Yevropa texnikalarini zamonaviy ishlab chiqarish innovatsiyasi bilan birlashtiradi.',
      approachIntro: 'Bizning merosimiz evolyutsiyaga asoslangan. Yigirma yil ichida biz ko\'rgazma stendi nima bo\'lishi mumkinligini qayta belgilab oldik.',
      sustainTitle: 'Biz mas\'uliyatli olingan materiallarga, axloqiy yetkazib berishga va nozik ishlab chiqarish jarayonlariga sodiq qolamiz.',
      sustainAside: 'Birinchi eskizdan oxirgi piksellargacha har bir g\'oyani niyat bilan shakllantiramiz.',
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
      navProjects: 'Loyihalar',
      navApproach: 'Yondashuv',
      navFaq: 'FAQ',
      navContact: 'Aloqa',
      copyrights: '© 2026 ExpoContact. Barcha huquqlar himoyalangan.',
      legalTerms: 'Foydalanish shartlari',
      legalPrivacy: 'Maxfiylik siyosati',
      skipToContent: 'Asosiy mazmunga o\'tish',
    },
  };
  const c = copy[locale] || copy.en;

  const marqueeItems = [
    'UzAutoShow', 'AgriExpo CA', 'TechExpo', 'WorldFood Uz',
    'OGU Expo', 'Tashkent Build', 'BeautyExpo', 'Pharma CA',
  ];

  return (
    <>
      {/* Modern sans-serif: Inter Display weights 200–900 (additive to layout load) */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700;800;900&display=swap"
      />

      <div
        className="min-h-screen bg-white text-[#0A0F1E] selection:bg-[#0A0F1E] selection:text-white antialiased"
        style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      >
        {/* ── Global utility classes ──────────────────────────────────────── */}
        <style jsx global>{`
          .display-1 {
            font-size: clamp(44px, 7.2vw, 156px);
            line-height: 0.94;
            letter-spacing: -0.045em;
            font-weight: 300;
          }
          .display-2 {
            font-size: clamp(32px, 4.4vw, 88px);
            line-height: 1.06;
            letter-spacing: -0.035em;
            font-weight: 300;
          }
          .display-3 {
            font-size: clamp(26px, 3vw, 56px);
            line-height: 1.12;
            letter-spacing: -0.025em;
            font-weight: 400;
          }
          .display-num {
            font-size: clamp(48px, 5.6vw, 112px);
            line-height: 0.94;
            letter-spacing: -0.035em;
            font-weight: 300;
            font-variant-numeric: tabular-nums;
          }
          .body-lg {
            font-size: clamp(15px, 1.05vw, 18px);
            line-height: 1.65;
          }
          .body-md {
            font-size: clamp(14px, 0.95vw, 16px);
            line-height: 1.65;
          }
          .body-sm {
            font-size: clamp(13px, 0.85vw, 15px);
            line-height: 1.6;
          }
          .label-xs {
            font-size: clamp(10.5px, 0.78vw, 12px);
            letter-spacing: 0.25em;
            text-transform: uppercase;
            font-weight: 500;
          }
          .nav-link {
            font-size: clamp(13px, 0.95vw, 16px);
            font-weight: 500;
            position: relative;
            transition: color 0.3s ease;
          }
          .nav-link::after {
            content: '';
            position: absolute;
            left: 0; right: 0;
            bottom: -6px;
            height: 1.5px;
            background: #D4A843;
            transform: scaleX(0);
            transform-origin: right;
            transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
          }
          .nav-link:hover::after,
          .nav-link[data-active='true']::after { transform: scaleX(1); transform-origin: left; }
          .nav-link[data-active='true'] { color: #D4A843; }

          .logo-invert {
            /* logo is white-on-transparent; invert to dark for white bg */
            filter: brightness(0) saturate(100%);
          }
          .logo-as-is { filter: none; }

          .container-pad {
            padding-left: clamp(20px, 4vw, 64px);
            padding-right: clamp(20px, 4vw, 64px);
          }

          .container-x {
            max-width: 1680px;
            margin-left: auto;
            margin-right: auto;
          }

          /* skip link */
          .skip-link {
            position: absolute;
            top: -100px;
            left: 16px;
            z-index: 100;
            background: #0A0F1E;
            color: #fff;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            transition: top 0.25s ease;
          }
          .skip-link:focus { top: 16px; }

          /* Custom scrollbar */
          ::-webkit-scrollbar       { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #F8F9FB; }
          ::-webkit-scrollbar-thumb { background: #D4A843; border-radius: 3px; }
        `}</style>

        {/* skip-to-content */}
        <a href="#hero" className="skip-link">{c.skipToContent}</a>

        {/* scroll progress bar */}
        <motion.div
          aria-hidden
          className="fixed top-0 left-0 h-[2px] bg-[#D4A843] z-[60] origin-left"
          style={{ scaleX: scrollYProgress, width: '100%' }}
        />

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  NAV                                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <NavBar copy={c} locale={locale} activeSection={activeSection} />

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  HERO                                                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section
          id="hero"
          ref={heroRef}
          className="container-x container-pad relative pt-36 sm:pt-40 lg:pt-44 pb-24"
        >
          <div className="grid grid-cols-12 gap-x-6 gap-y-12">
            {/* Top headline */}
            <div className="col-span-12 lg:col-span-8 relative z-10">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="label-xs text-[#5F6679] mb-8"
              >
                {c.heroEst}
              </motion.p>

              <h1 className="display-1 text-[#0A0F1E]">
                <span className="block">
                  <SplitHeadline text={c.heroH1Top} delay={0.3} />
                </span>
                <span className="block">
                  <SplitHeadline text={c.heroH1Bot} delay={0.5} />
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3, duration: 0.7, ease: EASE }}
                    className="inline-block align-baseline ml-3 text-[#D4A843]"
                    aria-hidden
                  >
                    .
                  </motion.span>
                </span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.8, ease: EASE }}
                className="mt-12 max-w-lg body-md text-[#5F6679] font-light"
              >
                {c.heroFound}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8, ease: EASE }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <MagneticButton href={`/${locale}#contacts`} variant="dark">
                  {c.ctaBtn}
                  <span aria-hidden>→</span>
                </MagneticButton>
                <a
                  href="#story"
                  className="inline-flex items-center gap-2 text-[#0A0F1E] body-sm font-medium nav-link"
                  style={{ paddingBottom: 4 }}
                >
                  {c.projectsTitle}
                  <span aria-hidden>↓</span>
                </a>
              </motion.div>
            </div>

            {/* Top-right floating image */}
            <motion.div
              style={{ y: heroImgY }}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1.2, ease: EASE }}
              className="col-span-12 lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:-mt-4"
            >
              <ImageBlock
                tone="dark"
                ratio="aspect-[3/4]"
                motif="stand"
                label="Featured"
                caption="Silk Road Motors — UzAutoShow 2023"
                className="w-full lg:max-w-[360px] lg:ml-auto"
              />
            </motion.div>

            {/* Bottom-left small image */}
            <motion.div
              style={{ y: heroSmallY }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 1, ease: EASE }}
              className="col-span-6 lg:col-span-3 mt-8"
            >
              <ImageBlock
                tone="gold"
                ratio="aspect-[5/4]"
                motif="arch"
                label="In Studio"
                className="w-full"
              />
            </motion.div>

            <div className="col-span-12 lg:col-span-5 lg:col-start-5 mt-4 lg:mt-20 flex items-center">
              <Reveal delay={0.2}>
                <p
                  className="text-[#0A0F1E]/85 font-light leading-snug max-w-xl"
                  style={{ fontSize: 'clamp(18px, 1.6vw, 28px)', letterSpacing: '-0.015em' }}
                >
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
            className="absolute right-6 sm:right-10 bottom-10 flex flex-col items-center gap-3 label-xs text-[#5F6679]"
          >
            <span>Scroll</span>
            <motion.span
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-10 bg-gradient-to-b from-[#5F6679] to-transparent"
            />
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  STATS                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section className="border-t border-b border-[#E5E7EB]">
          <div className="container-x grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
            {statsItems.slice(0, 3).map((s, i) => (
              <Reveal
                key={i}
                delay={i * 0.12}
                className="container-pad py-14 sm:py-20 flex flex-col gap-4"
              >
                <div className="display-num text-[#0A0F1E]">
                  <CountUp to={s.value} suffix={s.suffix || ''} duration={2 + i * 0.3} />
                </div>
                <p className="label-xs text-[#5F6679]">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  ABOUT                                                            */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="about" className="container-x container-pad py-28 sm:py-36">
          <div className="flex justify-between items-baseline mb-16 label-xs text-[#5F6679]">
            <span>/ {c.aboutLabel}</span>
            <span>{c.awardsLabel} →</span>
          </div>

          <Reveal>
            <h2 className="display-2 max-w-5xl mx-auto text-center text-[#0A0F1E]">
              {c.aboutH}
            </h2>
          </Reveal>

          <div className="grid grid-cols-12 gap-6 mt-24">
            <Reveal className="col-span-12 lg:col-span-5 lg:col-start-8 order-1 lg:order-2" delay={0.1}>
              <div className="bg-[#F8F9FB] p-10 sm:p-12 rounded-sm">
                <p className="body-md text-[#0A0F1E]/85 font-light mb-8">
                  {c.aboutPara}
                </p>
                <button className="inline-flex items-center gap-3 label-xs text-[#0A0F1E] nav-link" style={{ paddingBottom: 6 }}>
                  {c.showMore}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </Reveal>

            <Reveal className="col-span-6 lg:col-span-3 lg:col-start-1 order-2 lg:order-1 mt-10 lg:mt-16" delay={0.2}>
              <ImageBlock tone="gold" ratio="aspect-[3/4]" motif="grid" />
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
        <section id="story" className="container-x container-pad py-28 sm:py-36">
          <div className="grid grid-cols-12 gap-8 items-start">
            <Reveal className="col-span-12 lg:col-span-7">
              <h2 className="display-3 text-[#0A0F1E] max-w-3xl">
                {c.storyTitle}
              </h2>
              <p className="mt-10 max-w-xl body-md text-[#5F6679] font-light">
                {c.storyBody}
              </p>

              <div className="mt-16" id="projects">
                <div className="label-xs text-[#5F6679] mb-6">
                  {c.projectsTitle}
                </div>
                <div className="border-t border-[#E5E7EB]">
                  {projects.slice(0, 4).map((p, i) => (
                    <ProjectRow key={p.id} project={p} delay={i * 0.1} />
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-32" delay={0.3}>
              <ImageBlock tone="dark" ratio="aspect-[3/4]" motif="arch" label="Heritage" />
              <p className="mt-6 body-sm text-[#5F6679] font-light max-w-xs">
                {locale === 'ru'
                  ? 'Мы формируем каждую идею с намерением — от первого эскиза до финального исполнения.'
                  : locale === 'uz'
                  ? 'Birinchi eskizdan oxirgi bajarilishigacha har bir g\'oyani niyat bilan shakllantiramiz.'
                  : 'We shape every idea with intent — from the first sketch to the final execution.'}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  APPROACH                                                         */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="approach" className="bg-[#F8F9FB] py-28 sm:py-36">
          <div className="container-x container-pad grid grid-cols-12 gap-8">
            <Reveal className="col-span-12 lg:col-span-7">
              <h2 className="display-3 text-[#0A0F1E] max-w-2xl">
                {c.approachTitle}
              </h2>
              <p className="mt-10 max-w-lg body-md text-[#5F6679] font-light">
                {c.approachIntro}
              </p>

              <div className="mt-16 border-t border-[#E5E7EB]">
                {approachItems.map((item, i) => (
                  <div key={i} className="border-b border-[#E5E7EB]">
                    <button
                      onClick={() => setOpenApproach(openApproach === i ? -1 : i)}
                      className="w-full py-6 flex items-center justify-between gap-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F8F9FB] rounded-sm"
                    >
                      <span className="flex items-center gap-8">
                        <span className="label-xs text-[#5F6679] tabular-nums">
                          0{i + 1}
                        </span>
                        <span
                          className="font-medium text-[#0A0F1E]"
                          style={{ fontSize: 'clamp(15px, 1.15vw, 18px)' }}
                        >
                          {item.title}
                        </span>
                      </span>
                      <motion.span
                        animate={{ rotate: openApproach === i ? 45 : 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="shrink-0 w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#0A0F1E] group-hover:border-[#D4A843] group-hover:text-[#D4A843] transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.4" />
                          <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
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
                          <p className="pb-6 pl-[clamp(64px,8vw,96px)] pr-12 body-sm text-[#5F6679] font-light">
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
              <ImageBlock tone="cream" ratio="aspect-[4/5]" motif="stand" label="Process" />
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SUSTAINABILITY                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="sustain" className="container-x container-pad py-28 sm:py-36">
          <Reveal>
            <h2 className="display-3 text-[#0A0F1E] max-w-3xl">
              {c.sustainTitle}
            </h2>
          </Reveal>

          <div className="grid grid-cols-12 gap-6 mt-20">
            <Reveal className="col-span-6 lg:col-span-4" delay={0.1}>
              <ImageBlock tone="paper" ratio="aspect-[4/5]" motif="grid" label="Materials" />
            </Reveal>
            <Reveal className="col-span-6 lg:col-span-5" delay={0.25}>
              <ImageBlock tone="stone" ratio="aspect-[5/4]" motif="stand" label="Production" />
            </Reveal>
            <Reveal className="col-span-12 lg:col-span-3 lg:flex lg:items-end" delay={0.4}>
              <p className="body-sm text-[#5F6679] font-light">
                {c.sustainAside}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FAQ                                                              */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <section id="faq" className="bg-[#F8F9FB] py-28 sm:py-36">
          <div className="container-x container-pad grid grid-cols-12 gap-8">
            <Reveal className="col-span-12 lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
              <div className="label-xs text-[#5F6679] mb-6">
                / {tFAQ('title')}
              </div>
              <h2 className="display-3 text-[#0A0F1E]">
                {locale === 'ru'
                  ? 'Прозрачность, точность и простота — не только в дизайне, но и в коммуникации.'
                  : locale === 'uz'
                  ? 'Shaffoflik, aniqlik va soddalik — nafaqat dizaynda, balki muloqotda ham.'
                  : 'Transparency, precision and simplicity — not only in design, but in how we communicate.'}
              </h2>
              <div className="mt-12 hidden lg:block">
                <ImageBlock tone="cream" ratio="aspect-[4/3]" motif="arch" />
              </div>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-7 lg:col-start-6" delay={0.1}>
              <div className="border-t border-[#E5E7EB]">
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
        <section id="contact" className="relative overflow-hidden bg-white">
          <div className="container-x container-pad py-28 sm:py-36 grid grid-cols-12 gap-8 items-center relative">
            <Reveal className="col-span-12 lg:col-span-7">
              <h2 className="display-1 text-[#0A0F1E]" style={{ fontSize: 'clamp(40px, 6vw, 128px)' }}>
                <span className="block"><SplitHeadline text={c.ctaH} delay={0.1} /></span>
                <span className="block">
                  <SplitHeadline text={c.ctaH2} delay={0.4} />
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="text-[#D4A843]"
                    aria-hidden
                  >.</motion.span>
                </span>
              </h2>
              <p className="mt-8 body-md text-[#5F6679] max-w-md font-light">
                {c.ctaSub}
              </p>
              <Reveal delay={0.6} className="mt-10 flex flex-wrap gap-4">
                <MagneticButton href={`/${locale}#contacts`} variant="dark">
                  {c.ctaBtn}
                  <span aria-hidden>→</span>
                </MagneticButton>
                <MagneticButton href={`/${locale}`} variant="ghost">
                  {c.projectsTitle}
                </MagneticButton>
              </Reveal>
            </Reveal>

            <Reveal className="col-span-12 lg:col-span-5 lg:col-start-8" delay={0.2}>
              <ImageBlock tone="dark" ratio="aspect-[4/3]" motif="stand" label="Reserved Stand" />
            </Reveal>

            {/* decorative orb */}
            <motion.div
              aria-hidden
              className="absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#D4A843]/30 to-transparent blur-3xl"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  FOOTER                                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <footer className="bg-[#0A0F1E] text-white pt-24 pb-0 overflow-hidden">
          <div className="container-x container-pad">
            <div className="grid grid-cols-12 gap-8 pb-20">
              <Reveal className="col-span-12 lg:col-span-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_W}
                  alt="ExpoContact"
                  className="h-10 w-auto mb-8 logo-as-is"
                />
                <h3 className="text-3xl sm:text-4xl font-light leading-tight tracking-tight" style={{ fontSize: 'clamp(24px, 2.4vw, 40px)' }}>
                  {c.stayInformed}<br />
                  <span className="text-[#D4A843]">{c.stayInspired}</span>
                </h3>
                <form
                  className="mt-10 flex items-center border-b border-white/25 pb-3 max-w-md focus-within:border-[#D4A843] transition-colors"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    placeholder={c.email}
                    className="bg-transparent flex-1 text-sm text-white placeholder:text-white/40 focus:outline-none font-light"
                  />
                  <button
                    type="submit"
                    className="label-xs text-white/70 hover:text-[#D4A843] transition-colors"
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

            {/* Wordmark */}
            <div ref={wordmarkRef} className="relative">
              <WordmarkReveal text="expocontact" />
            </div>

            <div className="border-t border-white/15 mt-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 label-xs text-white/40">
              <span>{c.copyrights}</span>
              <div className="flex items-center gap-8">
                <Link href={`/${locale}`} className="hover:text-[#D4A843] transition-colors">
                  {c.legalTerms}
                </Link>
                <Link href={`/${locale}`} className="hover:text-[#D4A843] transition-colors">
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

function NavBar({ copy: c, locale, activeSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const links = [
    { href: '#about',    label: c.navAbout,    id: 'about' },
    { href: '#story',    label: c.navProjects, id: 'story' },
    { href: '#approach', label: c.navApproach, id: 'approach' },
    { href: '#faq',      label: c.navFaq,      id: 'faq' },
    { href: '#contact',  label: c.navContact,  id: 'contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-md border-b border-[#E5E7EB]/80'
            : 'bg-white/0 border-b border-transparent'
        }`}
      >
        <div
          className="container-x container-pad flex items-center justify-between"
          style={{ height: 'clamp(72px, 6vw, 96px)' }}
        >
          {/* Brand logo (white→black filter for white bg) */}
          <Link
            href={`/${locale}/new`}
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843] rounded"
            aria-label="ExpoContact"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_W}
              alt="ExpoContact"
              className="logo-invert"
              style={{ height: 'clamp(26px, 2.2vw, 36px)', width: 'auto' }}
            />
          </Link>

          {/* Center nav — single row */}
          <div className="hidden lg:flex items-center gap-[clamp(20px,2.4vw,40px)] text-[#0A0F1E]">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.href}
                className="nav-link"
                data-active={activeSection === l.id}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-[clamp(12px,1.6vw,24px)]">
            <div className="hidden sm:flex items-center gap-2 text-[#0A0F1E]/55">
              {['ru', 'en', 'uz'].map((l, i) => (
                <span key={l} className="flex items-center gap-2" style={{ fontSize: 'clamp(11px, 0.8vw, 13px)' }}>
                  {i > 0 && <span className="text-[#0A0F1E]/25">·</span>}
                  <Link
                    href={`/${l}/new`}
                    className={`tracking-[0.2em] uppercase font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A843] rounded px-0.5 ${
                      l === locale ? 'text-[#D4A843]' : 'hover:text-[#0A0F1E]'
                    }`}
                  >
                    {l.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>
            <a
              href="#contact"
              className="hidden md:inline-flex items-center gap-2 bg-[#0A0F1E] text-white hover:bg-[#D4A843] transition-colors px-6 py-3 rounded-full font-semibold tracking-[0.12em] uppercase"
              style={{ fontSize: 'clamp(11px, 0.8vw, 13px)' }}
            >
              {c.ctaBtn || c.navContact}
              <span aria-hidden>→</span>
            </a>
            {/* mobile burger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-10 h-10 flex flex-col gap-1.5 items-center justify-center text-[#0A0F1E]"
              aria-label="Open menu"
            >
              <span className="block w-5 h-px bg-current" />
              <span className="block w-5 h-px bg-current" />
              <span className="block w-3 h-px bg-[#D4A843] self-start" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mob-bd"
              className="fixed inset-0 z-[55] bg-[#0A0F1E]/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="mob-panel"
              className="fixed top-0 right-0 bottom-0 z-[60] w-[88vw] max-w-sm bg-white border-l border-[#E5E7EB] flex flex-col shadow-2xl lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LOGO_W} alt="ExpoContact" className="h-7 w-auto logo-invert" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F8F9FB] text-[#0A0F1E]"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" />
                    <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 px-6">
                {links.map((l, i) => (
                  <motion.a
                    key={l.id}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06 }}
                    className="block py-5 border-b border-[#E5E7EB] text-2xl font-light text-[#0A0F1E] tracking-tight"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>
              <div className="px-6 pb-8 space-y-4">
                <div className="flex gap-2">
                  {['ru', 'en', 'uz'].map((l) => (
                    <Link
                      key={l}
                      href={`/${l}/new`}
                      onClick={() => setMobileOpen(false)}
                      className={`flex-1 py-2 rounded-full text-center text-xs font-bold tracking-[0.2em] uppercase ${
                        l === locale ? 'bg-[#0A0F1E] text-white' : 'bg-[#F8F9FB] text-[#0A0F1E]/60'
                      }`}
                    >
                      {l.toUpperCase()}
                    </Link>
                  ))}
                </div>
                <a
                  href="#contact"
                  onClick={() => setMobileOpen(false)}
                  className="block bg-[#0A0F1E] text-white text-center py-4 rounded-full font-semibold tracking-[0.15em] uppercase text-sm"
                >
                  {c.ctaBtn}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
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
      className="flex items-center justify-between py-6 border-b border-[#E5E7EB] group"
    >
      <div className="flex items-baseline gap-8 min-w-0">
        <span className="label-xs text-[#5F6679] tabular-nums">
          {project.year}
        </span>
        <span
          className="font-medium text-[#0A0F1E] truncate group-hover:text-[#D4A843] transition-colors"
          style={{ fontSize: 'clamp(15px, 1.15vw, 19px)' }}
        >
          {project.title}
        </span>
      </div>
      <motion.span
        className="shrink-0 text-[#0A0F1E] group-hover:text-[#D4A843]"
        initial={{ x: 0 }}
        whileHover={{ x: 6 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M2 12L12 2M12 2H4M12 2V10" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </motion.span>
    </motion.a>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h4 className="label-xs text-white/50 mb-6">{title}</h4>
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i}>
            <a href="#" className="text-white/85 hover:text-[#D4A843] transition-colors font-light" style={{ fontSize: 'clamp(13px, 0.95vw, 15px)' }}>
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WordmarkReveal({ text }) {
  const letters = text.split('');
  return (
    <div className="relative w-full flex items-end justify-center select-none">
      <h2
        className="font-light text-white leading-[0.85] text-center"
        style={{
          fontSize: 'clamp(56px, 17vw, 280px)',
          letterSpacing: '-0.055em',
        }}
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
