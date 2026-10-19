/**
 * ExpoContact's two directions — one company, one site, two audiences:
 *
 *   exhibitor  — a company taking part in a show: stands designed, built,
 *                installed and serviced (the main site, /[locale]).
 *   organiser  — a company bringing a whole trade show to Uzbekistan:
 *                ExpoContact as the local organising partner (/offer/[lang]).
 *
 * This module is the model both halves share. The home page shows both
 * directions and a summary of the organiser proposition; /offer is the full
 * proposition (and the page organiser ads point at). Every lead records which
 * direction it came for, whichever form it came through.
 *
 * The organiser proposition itself — services, formats, plan, visitor steps —
 * is never copied here: it lives in the /offer dictionaries
 * (offer/i18n/*.ts) and reaches the home page through offer/lib/teaser.ts, so
 * the two pages cannot drift apart. This file holds only what the main site
 * adds around it: navigation, the fork between directions, form wording.
 *
 * The copy is code, not CMS content, on purpose: content.ru is already stored
 * in Blob, and a key added to content/ru.json would never reach the live
 * Russian page (the same reason AdLanding keeps its defaults in code).
 *
 * No React, no Node APIs: imported by the API route, the admin panel, the
 * layouts and the home page alike.
 */

export const AUDIENCES = ['exhibitor', 'organiser'];
export const DEFAULT_AUDIENCE = 'exhibitor';

/** Anything the browser posted → a known audience; unknown means exhibitor. */
export function sanitizeAudience(value) {
  return AUDIENCES.includes(value) ? value : DEFAULT_AUDIENCE;
}

/**
 * The direction a lead came for. Leads saved before the field existed are
 * derived: the /offer form only ever took organisers, every other form took
 * exhibitors.
 */
export function leadAudience(lead) {
  if (AUDIENCES.includes(lead?.audience)) return lead.audience;
  return lead?.source === 'offer' ? 'organiser' : DEFAULT_AUDIENCE;
}

/** How the team reads it: Telegram, the admin panel, CSV. */
export const AUDIENCE_LABELS = {
  exhibitor: 'экспонент — стенд',
  organiser: 'организатор выставки',
};

/** Main-site locale → its /offer page. ru, en and uz exist on both sides. */
export function organiserPageHref(locale) {
  return `/offer/${['ru', 'en', 'uz'].includes(locale) ? locale : 'en'}`;
}

/** /offer language → the main site. Turkish and Chinese visitors get English. */
export function mainSiteHref(offerLang) {
  return `/${['ru', 'uz'].includes(offerLang) ? offerLang : 'en'}`;
}

const COPY = {
  ru: {
    nav: 'Организаторам',
    fork: {
      label: 'Два направления ExpoContact',
      exhibitor: {
        kicker: 'Экспонентам',
        title: 'Стенд под ключ',
        text: 'Проект, производство, монтаж и сервис — на выставках в Узбекистане и за рубежом.',
        more: 'Услуги и работы',
      },
      organiser: {
        kicker: 'Организаторам',
        title: 'Выставка под ключ в Узбекистане',
        more: 'Что мы берём на себя',
      },
    },
    section: {
      index: 'Organisers',
      eyebrow: 'Организаторам выставок',
      formats: 'Три формата работы',
      rows: '{n} из {total} пунктов',
      cta: 'Обсудить выставку',
      more: 'Подробно: план, форматы, отчёт',
    },
    form: {
      label: 'Вам нужно',
      exhibitor: 'Стенд на выставке',
      organiser: 'Провести выставку',
      expoLabel: 'Тема и даты выставки',
      expoPlaceholder: 'Например: стройиндустрия, май 2027',
    },
    modal: {
      eyebrow: 'Заявка организатора',
      heading: 'Обсудим вашу выставку',
      sub: 'Пришлите тему и даты — подготовим концепцию и план запуска.',
    },
    footer: 'Организаторам выставок',
    serviceName: 'Организация выставок в Узбекистане под ключ',
  },
  en: {
    nav: 'Organisers',
    fork: {
      label: 'Two ways ExpoContact works',
      exhibitor: {
        kicker: 'For exhibitors',
        title: 'Turnkey exhibition stands',
        text: 'Design, production, installation and on-site service — at shows in Uzbekistan and abroad.',
        more: 'Services and work',
      },
      organiser: {
        kicker: 'For organisers',
        title: 'Your trade show in Uzbekistan, turnkey',
        more: 'What we take on',
      },
    },
    section: {
      index: 'Organisers',
      eyebrow: 'For trade show organisers',
      formats: 'Three ways to work with us',
      rows: '{n} of {total} items',
      cta: 'Discuss your show',
      more: 'In full: plan, formats, report',
    },
    form: {
      label: 'You need',
      exhibitor: 'A stand at a show',
      organiser: 'To run a show',
      expoLabel: 'Show theme and dates',
      expoPlaceholder: 'E.g. construction, May 2027',
    },
    modal: {
      eyebrow: 'Organiser enquiry',
      heading: 'Let’s discuss your show',
      sub: 'Send the theme and dates — we’ll prepare a concept and a launch plan.',
    },
    footer: 'For trade show organisers',
    serviceName: 'Turnkey trade show organisation in Uzbekistan',
  },
  uz: {
    nav: 'Tashkilotchilarga',
    fork: {
      label: 'ExpoContactning ikki yoʻnalishi',
      exhibitor: {
        kicker: 'Ishtirokchilarga',
        title: 'Stendni toʻliq tayyorlaymiz',
        text: 'Loyiha, ishlab chiqarish, montaj va servis — Oʻzbekistondagi va xorijdagi koʻrgazmalarda.',
        more: 'Xizmatlar va ishlar',
      },
      organiser: {
        kicker: 'Tashkilotchilarga',
        title: 'Oʻzbekistonda koʻrgazmani toʻliq tashkil etamiz',
        more: 'Nimalarni oʻz zimmamizga olamiz',
      },
    },
    section: {
      index: 'Organisers',
      eyebrow: 'Koʻrgazma tashkilotchilariga',
      formats: 'Ishlashning uch formati',
      rows: '{total} banddan {n} tasi',
      cta: 'Koʻrgazmani muhokama qilish',
      more: 'Batafsil: reja, formatlar, hisobot',
    },
    form: {
      label: 'Sizga kerak',
      exhibitor: 'Koʻrgazmada stend',
      organiser: 'Koʻrgazma oʻtkazish',
      expoLabel: 'Koʻrgazma mavzusi va sanalari',
      expoPlaceholder: 'Masalan: qurilish, 2027-yil may',
    },
    modal: {
      eyebrow: 'Tashkilotchi arizasi',
      heading: 'Koʻrgazmangizni muhokama qilaylik',
      sub: 'Mavzu va sanalarni yuboring — konsepsiya va ishga tushirish rejasini tayyorlaymiz.',
    },
    footer: 'Koʻrgazma tashkilotchilariga',
    serviceName: 'Oʻzbekistonda koʻrgazmalarni toʻliq tashkil etish',
  },
};

/** The main site's own wording around the two directions, for one locale. */
export function directionCopy(locale) {
  return COPY[locale] || COPY.ru;
}
