/**
 * The rules of an exhibition-stand project.
 *
 * Pure functions and constants — no React, no Node APIs, no I/O — so the API
 * route, the admin UI and tests all share one definition of what a project is
 * and when it is in trouble.
 *
 * What makes this domain different from a generic sales CRM: the build-up date
 * does not move. A hall opens when the organiser says it opens, so every plan
 * is counted backwards from the day the crew drives in, not forwards from the
 * day the client said yes. That is why scheduleFromSetup() below is the centre
 * of the model and why projectHealth() measures everything against setup.
 *
 * Dates are calendar strings, 'YYYY-MM-DD', never timestamps: build-up on the
 * 5th of October is the 5th of October in Tashkent no matter which timezone
 * the person looking at the screen is in.
 */

/* ── Stages ──────────────────────────────────────────────────────────────── */

/**
 * The company's own process, as described on the site, plus the two terminal
 * states a project can end in. `days` is the working window the site promises
 * for that step and is what the backward plan is built from.
 */
export const STAGES = [
  { key: 'brief',      label: 'Бриф',           short: 'Бриф',      group: 'sales',  days: 2,  color: '#8A8A92' },
  { key: 'concept',    label: '3D-концепция',   short: '3D',        group: 'sales',  days: 5,  color: '#2A6BC4' },
  { key: 'approval',   label: 'Согласование',   short: 'Смета',     group: 'sales',  days: 4,  color: '#6C5CE7' },
  { key: 'production', label: 'Производство',   short: 'Цех',       group: 'build',  days: 14, color: '#E8651C' },
  { key: 'delivery',   label: 'Доставка',       short: 'Логистика', group: 'build',  days: 3,  color: '#D4A843' },
  { key: 'setup',      label: 'Монтаж',         short: 'Монтаж',    group: 'onsite', days: 3,  color: '#00B894' },
  { key: 'live',       label: 'Выставка идёт',  short: 'Выставка',  group: 'onsite', days: 0,  color: '#3FCB5A' },
  { key: 'teardown',   label: 'Демонтаж',       short: 'Демонтаж',  group: 'onsite', days: 1,  color: '#636E72' },
  { key: 'done',       label: 'Завершён',       short: 'Завершён',  group: 'closed', days: 0,  color: '#2D3436' },
  { key: 'lost',       label: 'Отказ',          short: 'Отказ',     group: 'closed', days: 0,  color: '#B2323C' },
];

export const STAGE_KEYS = STAGES.map(s => s.key);

/** Stages shown as columns on the board; the two closed ones live in the archive. */
export const BOARD_STAGES = STAGES.filter(s => s.group !== 'closed');

export const stageOf = (key) => STAGES.find(s => s.key === key) || STAGES[0];
export const stageLabel = (key) => stageOf(key).label;
export const isClosed = (key) => stageOf(key).group === 'closed';

/** Stages that still need work before the crew drives in, in order. */
export const PRE_SETUP_STAGES = ['brief', 'concept', 'approval', 'production', 'delivery'];

/**
 * The shortest realistic run from starting the brief to build-up day: the sum
 * of the stages that have to happen first. Anything shorter is a rush job and
 * the board says so.
 */
export const MIN_LEAD_DAYS = PRE_SETUP_STAGES.reduce((n, k) => n + stageOf(k).days, 0);

/* ── Money ───────────────────────────────────────────────────────────────── */

export const CURRENCIES = {
  UZS: { code: 'UZS', label: 'сум', symbol: 'сум', decimals: 0 },
  USD: { code: 'USD', label: 'доллар', symbol: '$', decimals: 2 },
};

export const DEFAULT_CURRENCY = 'UZS';

/**
 * How the client settles. Stored as a stable key; the label is what a manager
 * reads. «Перечисление с НДС» is its own option on purpose — in Uzbekistan it
 * changes the invoiced amount, so it is not a footnote in the brief.
 */
export const PAYMENT_METHODS = [
  { key: 'transfer',     label: 'Перечисление' },
  { key: 'transfer_vat', label: 'Перечисление с НДС' },
  { key: 'cash',         label: 'Наличные' },
  { key: 'card',         label: 'Карта / Payme / Click' },
  { key: 'mixed',        label: 'Смешанная' },
];

export const PAYMENT_KEYS = PAYMENT_METHODS.map(m => m.key);
export const paymentLabel = (key) =>
  PAYMENT_METHODS.find(m => m.key === key)?.label || '';

/** Round the way the currency is actually written, to keep sums from drifting. */
export function roundMoney(amount, currency = DEFAULT_CURRENCY) {
  const d = CURRENCIES[currency]?.decimals ?? 2;
  const f = 10 ** d;
  return Math.round((Number(amount) || 0) * f) / f;
}

export function formatMoney(amount, currency = DEFAULT_CURRENCY) {
  const cur = CURRENCIES[currency] || CURRENCIES.UZS;
  const n = roundMoney(amount, currency);
  // Whole amounts read better without ",00"; anything with a fraction shows
  // the full precision the currency uses.
  const fraction = Number.isInteger(n) ? 0 : cur.decimals;
  const text = n.toLocaleString('ru-RU', {
    minimumFractionDigits: fraction, maximumFractionDigits: cur.decimals,
  });
  return cur.code === 'USD' ? `$${text}` : `${text} ${cur.symbol}`;
}

export const paidTotal = (payments = [], currency = DEFAULT_CURRENCY) =>
  roundMoney(payments.reduce((n, p) => n + (Number(p.amount) || 0), 0), currency);

/** What the client still owes. Never negative — an overpayment reads as zero due. */
export function balanceOf(project) {
  const cur = project?.money?.currency || DEFAULT_CURRENCY;
  const total = Number(project?.money?.total) || 0;
  const paid = paidTotal(project?.payments, cur);
  return roundMoney(Math.max(0, total - paid), cur);
}

export function paidShare(project) {
  const total = Number(project?.money?.total) || 0;
  if (total <= 0) return 0;
  const paid = paidTotal(project?.payments, project?.money?.currency);
  return Math.min(1, paid / total);
}

/* ── Calendar dates ──────────────────────────────────────────────────────── */

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A real calendar date, not merely something shaped like one. The shape check
 * alone let '2026-13-99' through, and every day count against it came back
 * NaN — so the round trip through Date is the check that matters.
 */
export function isDate(s) {
  if (typeof s !== 'string') return false;
  const m = DATE_RE.exec(s);
  if (!m) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Today as a calendar string in Tashkent, where the crews and the halls are. */
export function todayISO(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

/** Whole days from a to b; negative when b is in the past. */
export function daysBetween(a, b) {
  if (!isDate(a) || !isDate(b)) return null;
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86400000);
}

export function addDays(date, days) {
  if (!isDate(date)) return null;
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(date) {
  if (!isDate(date)) return '';
  const [y, m, d] = date.split('-');
  return `${d}.${m}.${y}`;
}

/** "5 дней", "1 день", "21 день" — Russian needs the count to agree. */
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

export const daysWord = (n) => plural(n, 'день', 'дня', 'дней');

/* ── The backward plan ───────────────────────────────────────────────────── */

/**
 * Deadlines for every pre-setup stage, counted back from build-up day.
 *
 * Returns { stageKey: 'YYYY-MM-DD' } — the date that stage must be FINISHED by.
 * Production ending three days before build-up is not a nicety: the stand has
 * to be packed and driven to the hall before the crew can put it up.
 */
export function scheduleFromSetup(setupDate) {
  if (!isDate(setupDate)) return {};
  const plan = {};
  let cursor = setupDate;
  for (const key of [...PRE_SETUP_STAGES].reverse()) {
    cursor = addDays(cursor, -stageOf(key).days);
    plan[key] = cursor;
  }
  return plan;
}

/** The day work must start for the whole chain to fit before build-up. */
export const latestStartFor = (setupDate) =>
  isDate(setupDate) ? addDays(setupDate, -MIN_LEAD_DAYS) : null;

/* ── Task templates ──────────────────────────────────────────────────────── */

/**
 * The checklist a stand project always needs, with each item pinned to the
 * stage it belongs to. Created with the project so nobody has to remember the
 * sequence; every item can be edited, completed or deleted afterwards.
 */
export const TASK_TEMPLATE = [
  { stage: 'brief',      title: 'Снять бриф: цели, площадь, бюджет' },
  { stage: 'brief',      title: 'Запросить у организатора план стенда и техусловия' },
  { stage: 'concept',    title: 'Подготовить 2–3 концепции с 3D' },
  { stage: 'concept',    title: 'Согласовать концепцию с клиентом' },
  { stage: 'approval',   title: 'Составить смету' },
  { stage: 'approval',   title: 'Подписать договор' },
  { stage: 'approval',   title: 'Получить предоплату' },
  { stage: 'approval',   title: 'Согласовать проект с организатором выставки' },
  { stage: 'production', title: 'Рабочие чертежи в цех' },
  { stage: 'production', title: 'Закупка материалов' },
  { stage: 'production', title: 'Печать графики' },
  { stage: 'production', title: 'Контрольная сборка в цеху' },
  { stage: 'delivery',   title: 'Упаковка и погрузка' },
  { stage: 'delivery',   title: 'Пропуска на площадку для бригады и транспорта' },
  { stage: 'setup',      title: 'Монтаж стенда' },
  { stage: 'setup',      title: 'Проверка электрики и техники' },
  { stage: 'setup',      title: 'Сдача стенда клиенту' },
  { stage: 'live',       title: 'Дежурный техник на площадке' },
  { stage: 'teardown',   title: 'Демонтаж и вывоз' },
  { stage: 'teardown',   title: 'Закрывающие документы и акт' },
];

/** Template turned into real tasks with deadlines for a given build-up date. */
export function planTasks(setupDate, { teardownDate } = {}) {
  const plan = scheduleFromSetup(setupDate);
  return TASK_TEMPLATE.map((t, i) => ({
    id: `t${i + 1}`,
    title: t.title,
    stage: t.stage,
    due: plan[t.stage]
      || (t.stage === 'setup' ? setupDate : null)
      || (t.stage === 'teardown' ? teardownDate : null)
      || null,
    done: false,
    doneAt: null,
    assignee: '',
  }));
}

/* ── Health ──────────────────────────────────────────────────────────────── */

const LEVEL_RANK = { ok: 0, warn: 1, risk: 2 };

/**
 * Why a project needs attention today, in plain sentences a manager can act
 * on. This is the whole point of the board: on a normal CRM a deal that slips
 * a week is annoying, here it means a client stands in an empty hall.
 */
export function projectHealth(project, today = todayISO()) {
  const reasons = [];
  const add = (level, text) => reasons.push({ level, text });

  const stage = project?.stage || 'brief';
  const setup = project?.dates?.setup;

  if (isClosed(stage)) {
    return { level: 'ok', reasons: [], daysToSetup: null };
  }

  const daysToSetup = isDate(setup) ? daysBetween(today, setup) : null;

  if (!isDate(setup)) {
    add('warn', 'Не задана дата монтажа — план и сроки не считаются');
  } else if (daysToSetup < 0 && !['live', 'teardown'].includes(stage)) {
    add('risk', `Монтаж был ${formatDate(setup)}, а этап всё ещё «${stageLabel(stage)}»`);
  } else if (daysToSetup >= 0 && PRE_SETUP_STAGES.includes(stage)) {
    // Does the remaining chain still fit before build-up?
    const from = PRE_SETUP_STAGES.indexOf(stage);
    const needed = PRE_SETUP_STAGES.slice(from).reduce((n, k) => n + stageOf(k).days, 0);
    if (needed > daysToSetup) {
      add('risk', `До монтажа ${daysToSetup} ${daysWord(daysToSetup)}, а на оставшиеся этапы нужно ${needed}`);
    } else if (needed + 3 > daysToSetup) {
      add('warn', `Запас до монтажа ${daysToSetup - needed} ${daysWord(daysToSetup - needed)} — идём впритык`);
    }
  }

  // Money: producing a stand without a prepayment is the expensive mistake.
  const total = Number(project?.money?.total) || 0;
  const paid = paidTotal(project?.payments, project?.money?.currency);
  if (total > 0 && paid === 0 && ['production', 'delivery', 'setup', 'live'].includes(stage)) {
    add('risk', 'Производство идёт без предоплаты');
  } else if (total > 0 && paid < total && ['teardown'].includes(stage)) {
    add('warn', `Остаток не оплачен: ${formatMoney(total - paid, project?.money?.currency)}`);
  } else if (total <= 0 && ['approval', 'production'].includes(stage)) {
    add('warn', 'Не заполнена сумма договора');
  }

  // Overdue tasks.
  const open = (project?.tasks || []).filter(t => !t.done && isDate(t.due));
  const overdue = open.filter(t => daysBetween(today, t.due) < 0);
  const dueSoon = open.filter(t => {
    const d = daysBetween(today, t.due);
    return d >= 0 && d <= 2;
  });
  if (overdue.length) {
    add('risk', `Просрочено задач: ${overdue.length}`);
  } else if (dueSoon.length) {
    add('warn', `Задач с дедлайном в ближайшие 2 дня: ${dueSoon.length}`);
  }

  const level = reasons.reduce((worst, r) =>
    LEVEL_RANK[r.level] > LEVEL_RANK[worst] ? r.level : worst, 'ok');

  return { level, reasons, daysToSetup };
}

/* ── Project shape ───────────────────────────────────────────────────────── */

const clamp = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const date = (v) => (isDate(v) ? v : null);

/**
 * A two-letter country code, or ''. An empty string clears the field on
 * purpose; anything unrecognised keeps whatever was stored, so a malformed
 * payload cannot silently wipe a real value.
 */
function countryCode(v, previous = '') {
  if (typeof v !== 'string') return previous;
  const t = v.trim().toUpperCase();
  if (!t) return '';
  return /^[A-Z]{2}$/.test(t) ? t : previous;
}

/**
 * Keep only links that are safe to render as an href in the admin panel:
 * absolute http(s), or a path on this site such as the /uploads/... a local
 * upload returns when Blob is not configured. Everything else — javascript:,
 * data:, and protocol-relative //evil.com which would leave the site — is
 * dropped.
 */
export function url(v) {
  const s = typeof v === 'string' ? v.trim().slice(0, 500) : '';
  if (!s) return '';
  if (s.startsWith('//')) return '';
  if (s.startsWith('/')) return s;
  try {
    const parsed = new URL(s);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? s : '';
  } catch {
    return '';
  }
}

/**
 * Normalise whatever the admin posted into the stored shape.
 *
 * Everything here arrives from a browser, so nothing is trusted: strings are
 * bounded, numbers coerced, dates checked against the calendar format and the
 * stage checked against the known list.
 */
export function sanitizeProject(input = {}, base = {}) {
  const money = { ...(base.money || {}), ...(input.money || {}) };
  const currency = CURRENCIES[money.currency] ? money.currency : (base.money?.currency || DEFAULT_CURRENCY);

  return {
    ...base,
    title:   clamp(input.title ?? base.title, 160),
    stage:   STAGE_KEYS.includes(input.stage) ? input.stage : (base.stage || 'brief'),
    manager: clamp(input.manager ?? base.manager, 80),
    client: {
      company: clamp(input.client?.company ?? base.client?.company, 160),
      contact: clamp(input.client?.contact ?? base.client?.contact, 120),
      phone:   clamp(input.client?.phone   ?? base.client?.phone, 40),
      email:   clamp(input.client?.email   ?? base.client?.email, 120),
      country: countryCode(input.client?.country ?? base.client?.country, base.client?.country || ''),
    },
    expo: {
      name:  clamp(input.expo?.name  ?? base.expo?.name, 160),
      city:  clamp(input.expo?.city  ?? base.expo?.city, 80),
      venue: clamp(input.expo?.venue ?? base.expo?.venue, 120),
    },
    stand: {
      area:   num(input.stand?.area ?? base.stand?.area),
      type:   clamp(input.stand?.type   ?? base.stand?.type, 40),
      number: clamp(input.stand?.number ?? base.stand?.number, 40),
      hall:   clamp(input.stand?.hall   ?? base.stand?.hall, 40),
      floors: num(input.stand?.floors ?? base.stand?.floors) || 1,
    },
    dates: {
      setup:    date(input.dates?.setup    ?? base.dates?.setup),
      openFrom: date(input.dates?.openFrom ?? base.dates?.openFrom),
      openTo:   date(input.dates?.openTo   ?? base.dates?.openTo),
      teardown: date(input.dates?.teardown ?? base.dates?.teardown),
    },
    money: {
      currency,
      total: roundMoney(money.total, currency),
      // '' clears the field; an unknown value keeps what was stored.
      method: money.method === '' ? ''
        : PAYMENT_KEYS.includes(money.method) ? money.method
        : (base.money?.method || ''),
    },
    // Where the client's own material lives — logos, brandbook, photos. A link
    // rather than an upload: it is usually already in their Drive, and copying
    // it here would only make a second version to keep in sync.
    links: {
      client: url(input.links?.client ?? base.links?.client),
    },
    brief: clamp(input.brief ?? base.brief, 4000),
  };
}

/** The compact record the board and the lists are built from. */
export function projectSummary(p) {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    stage: p.stage,
    manager: p.manager || '',
    client: { company: p.client?.company || '', contact: p.client?.contact || '' },
    expo: { name: p.expo?.name || '', city: p.expo?.city || '' },
    stand: { area: p.stand?.area || 0, type: p.stand?.type || '' },
    dates: { ...p.dates },
    money: { currency: p.money?.currency || DEFAULT_CURRENCY, total: p.money?.total || 0, paid: paidTotal(p.payments, p.money?.currency) },
    openTasks: (p.tasks || []).filter(t => !t.done).length,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
