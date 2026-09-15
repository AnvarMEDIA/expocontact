/**
 * How a visit is classified, and how a day's counters are named.
 *
 * Pure functions — no I/O — so the classification can be tested directly.
 *
 * Privacy stance: this file never produces anything that identifies a person.
 * There is no IP address and no raw user agent in what gets stored; the only
 * per-visitor value is a hash that changes every day (see store.js), which is
 * enough to count "how many people" and useless for following anyone.
 */

/* ── Visit classification ────────────────────────────────────────────────── */

export function parseDevice(ua = '') {
  const u = String(ua).toLowerCase();
  const device = /ipad|tablet|(android(?!.*mobile))/.test(u) ? 'tablet'
    : /mobile|android|iphone|ipod|blackberry|windows phone/.test(u) ? 'mobile'
    : 'desktop';
  const os = /windows nt/.test(u) ? 'Windows'
    : /android/.test(u)          ? 'Android'
    : /iphone|ipad|ipod/.test(u) ? 'iOS'
    : /mac os x/.test(u)         ? 'macOS'
    : /linux/.test(u)            ? 'Linux'
    : 'Другая';
  const browser = /edg\//.test(u)     ? 'Edge'
    : /yabrowser/.test(u)             ? 'Яндекс'
    : /opr\/|opera/.test(u)           ? 'Opera'
    : /chrome|crios/.test(u)          ? 'Chrome'
    : /firefox|fxios/.test(u)         ? 'Firefox'
    : /safari/.test(u)                ? 'Safari'
    : 'Другой';
  return { device, os, browser };
}

/**
 * Crawlers, uptime checks and preview fetchers. Counting them would inflate
 * every number on the dashboard and make the conversion rate meaningless.
 */
const BOT_RE = /bot|crawler|spider|crawl|slurp|curl|wget|python|java|go-http|headless|lighthouse|pingdom|monitor|preview|facebookexternalhit|whatsapp|telegrambot|vercel|gptbot|claudebot|perplexity|yandex(?!browser)|googlebot|bingbot|ahrefs|semrush|mj12|dotbot/i;

export const isBot = (ua = '') => !ua || BOT_RE.test(ua);

/** Search engines, so a referrer from them reads as "поиск", not as a site. */
const SEARCH = [
  [/google\./i, 'Google'], [/yandex\./i, 'Яндекс'], [/bing\./i, 'Bing'],
  [/duckduckgo/i, 'DuckDuckGo'], [/yahoo\./i, 'Yahoo'], [/mail\.ru/i, 'Mail.ru'],
];
const SOCIAL = [
  [/instagram/i, 'Instagram'], [/facebook|fb\.com|fb\.me/i, 'Facebook'],
  [/t\.me|telegram/i, 'Telegram'], [/youtube|youtu\.be/i, 'YouTube'],
  [/tiktok/i, 'TikTok'], [/linkedin/i, 'LinkedIn'], [/twitter|x\.com/i, 'X'],
  [/vk\.com/i, 'VK'], [/wa\.me|whatsapp/i, 'WhatsApp'],
];

/**
 * Where a visit came from, as one short label.
 *
 * A campaign wins over the referrer: if the visitor arrived by an ad link, the
 * ad is the answer to "what brought them", whatever the browser reported.
 * Returns { source, channel } where channel is the bucket the dashboard groups
 * by: 'ads' | 'search' | 'social' | 'referral' | 'direct'.
 */
export function classifySource({ referrer = '', marketing = null, host = '' } = {}) {
  const utm = marketing || {};
  if (utm.source) {
    const medium = String(utm.medium || '').toLowerCase();
    const paid = /cpc|ppc|paid|ads|cpm|banner/.test(medium) || !!utm.clickId;
    return {
      source: String(utm.source).slice(0, 60),
      channel: paid ? 'ads' : 'campaign',
      campaign: [utm.source, utm.medium, utm.campaign].filter(Boolean).join(' / ').slice(0, 120),
    };
  }

  const ref = String(referrer || '').trim();
  if (!ref) return { source: 'Прямые заходы', channel: 'direct' };

  let hostname;
  try { hostname = new URL(ref).hostname.replace(/^www\./, ''); }
  catch { return { source: 'Прямые заходы', channel: 'direct' }; }

  // Our own pages linking to each other are not a traffic source.
  if (host && hostname === String(host).replace(/^www\./, '')) {
    return { source: 'Прямые заходы', channel: 'direct' };
  }

  for (const [re, name] of SEARCH) if (re.test(hostname)) return { source: name, channel: 'search' };
  for (const [re, name] of SOCIAL) if (re.test(hostname)) return { source: name, channel: 'social' };
  return { source: hostname.slice(0, 60), channel: 'referral' };
}

export const CHANNEL_LABELS = {
  ads: 'Реклама',
  campaign: 'Кампании',
  search: 'Поиск',
  social: 'Соцсети',
  referral: 'Ссылки с сайтов',
  direct: 'Прямые заходы',
};

/** Normalise a path so one page is one row: no query, no trailing slash, bounded. */
export function normalisePath(raw = '/') {
  let p = String(raw).split('?')[0].split('#')[0].trim() || '/';
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, '') || '/';
  return p.slice(0, 120);
}

/* ── Counter field names ─────────────────────────────────────────────────── */

/**
 * One Redis hash holds a whole day, with prefixed fields, so reading a day is
 * a single round trip instead of one per breakdown.
 */
export const F = {
  views: 'views',
  leads: 'leads',
  page:    (v) => `p:${v}`,
  source:  (v) => `s:${v}`,
  channel: (v) => `ch:${v}`,
  device:  (v) => `dev:${v}`,
  os:      (v) => `os:${v}`,
  browser: (v) => `br:${v}`,
  country: (v) => `c:${v}`,
  locale:  (v) => `l:${v}`,
  hour:    (v) => `h:${v}`,
  campaign:(v) => `cmp:${v}`,
};

/** Split a stored day hash back into named breakdowns. */
export function explodeDay(hash = {}) {
  const out = {
    views: 0, leads: 0,
    pages: {}, sources: {}, channels: {}, devices: {},
    os: {}, browsers: {}, countries: {}, locales: {}, campaigns: {},
    hours: Array(24).fill(0),
  };
  const buckets = {
    'p:': 'pages', 's:': 'sources', 'ch:': 'channels', 'dev:': 'devices',
    'os:': 'os', 'br:': 'browsers', 'c:': 'countries', 'l:': 'locales',
    'cmp:': 'campaigns',
  };

  for (const [field, raw] of Object.entries(hash)) {
    const n = Number(raw) || 0;
    if (field === 'views') { out.views = n; continue; }
    if (field === 'leads') { out.leads = n; continue; }
    if (field.startsWith('h:')) {
      const h = Number(field.slice(2));
      if (h >= 0 && h < 24) out.hours[h] = n;
      continue;
    }
    // Longest prefix first, so 'ch:' is not read as 'c:'.
    const prefix = Object.keys(buckets)
      .filter(p => field.startsWith(p))
      .sort((a, b) => b.length - a.length)[0];
    if (prefix) out[buckets[prefix]][field.slice(prefix.length)] = n;
  }
  return out;
}

/** Merge several days into one set of totals. */
export function mergeDays(days = []) {
  const total = {
    views: 0, leads: 0, visitors: 0,
    pages: {}, sources: {}, channels: {}, devices: {},
    os: {}, browsers: {}, countries: {}, locales: {}, campaigns: {},
    hours: Array(24).fill(0),
  };
  const maps = ['pages', 'sources', 'channels', 'devices', 'os', 'browsers', 'countries', 'locales', 'campaigns'];

  for (const d of days) {
    total.views += d.views || 0;
    total.leads += d.leads || 0;
    total.visitors += d.visitors || 0;
    for (const key of maps) {
      for (const [k, v] of Object.entries(d[key] || {})) {
        total[key][k] = (total[key][k] || 0) + v;
      }
    }
    (d.hours || []).forEach((v, i) => { total.hours[i] += v; });
  }
  return total;
}

/** A map of counts as a sorted list, biggest first. */
export function topList(map = {}, limit = 10) {
  return Object.entries(map)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

/** Leads per hundred visitors, one decimal. Visitors, not views: one person
 *  reading five pages is still one chance to leave a request. */
export function conversion(leads, visitors) {
  if (!visitors) return 0;
  return Math.round((leads / visitors) * 1000) / 10;
}
