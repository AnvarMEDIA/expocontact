/**
 * GET /api/analytics/metrika  — protected (ADMIN_PASSWORD)
 *
 * Pulls stats from Yandex.Metrika API (counter 108497871) and returns
 * data in the same shape as /api/analytics/stats so the frontend works
 * with either source. Falls back to local analytics.json if
 * YANDEX_METRIKA_TOKEN env var is not set.
 *
 * Env vars required:
 *   YANDEX_METRIKA_TOKEN  — OAuth token from https://oauth.yandex.ru/
 *   ADMIN_PASSWORD        — same password as the rest of the admin API
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const COUNTER_ID  = '108497871';
const METRIKA_URL = 'https://api-metrika.yandex.net/stat/v1/data';
const LOCAL_FILE  = path.join(process.cwd(), 'content', 'data', 'analytics.json');

// ── Auth ──────────────────────────────────────────────────────────────────────
function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

// ── Local helpers (for "online now" + fallback) ───────────────────────────────
function startOf(ms, unit) {
  const d = new Date(ms);
  if (unit === 'day')   return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (unit === 'week')  { const day = d.getDay() || 7; return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1).getTime(); }
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  return 0;
}

function countBy(arr, key) {
  const map = {};
  for (const item of arr) { const v = item[key] || 'Other'; map[v] = (map[v] || 0) + 1; }
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, count: v }));
}

async function readLocal() {
  try { return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8')); } catch { return []; }
}

const COUNTRY_NAMES_LOCAL = {
  UZ:'Узбекистан', RU:'Россия', KZ:'Казахстан', KG:'Кыргызстан',
  TJ:'Таджикистан', TM:'Туркменистан', AZ:'Азербайджан', GE:'Грузия',
  DE:'Германия', US:'США', GB:'Великобритания', AE:'ОАЭ', TR:'Турция',
  CN:'Китай', IN:'Индия', FR:'Франция', IT:'Италия', PL:'Польша',
  UA:'Украина', BY:'Беларусь', MD:'Молдова', AM:'Армения', XX:'Неизвестно',
};

// ── Metrika API helper ────────────────────────────────────────────────────────
async function metrika(oauthToken, params) {
  const url = new URL(METRIKA_URL);
  url.searchParams.set('ids', COUNTER_ID);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `OAuth ${oauthToken}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Metrika ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// Single total metric for a period
async function metrikaTotal(oauthToken, date1, date2) {
  const r = await metrika(oauthToken, { metrics: 'ym:s:visits', date1, date2 });
  return Math.round(r?.totals?.[0] ?? r?.data?.[0]?.metrics?.[0] ?? 0);
}

// Dimension breakdown → [{key, count}]
function extractRows(resp) {
  return (resp?.data || [])
    .map(row => ({
      key:   row.dimensions?.[0]?.name || row.dimensions?.[0]?.id || 'Other',
      count: Math.round(row.metrics?.[0] ?? 0),
    }))
    .filter(r => r.count > 0);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ── Country / device name maps ────────────────────────────────────────────────
const COUNTRY_RU = {
  'Россия': 'Россия', 'Russia': 'Россия',
  'Uzbekistan': 'Узбекистан', 'Узбекистан': 'Узбекистан',
  'Kazakhstan': 'Казахстан', 'Казахстан': 'Казахстан',
  'Kyrgyzstan': 'Кыргызстан', 'Кыргызстан': 'Кыргызстан',
  'Tajikistan': 'Таджикистан', 'Таджикистан': 'Таджикистан',
  'Turkmenistan': 'Туркменистан', 'Туркменистан': 'Туркменистан',
  'Azerbaijan': 'Азербайджан', 'Азербайджан': 'Азербайджан',
  'Georgia': 'Грузия', 'Грузия': 'Грузия',
  'Germany': 'Германия', 'Германия': 'Германия',
  'United States': 'США', 'США': 'США',
  'United Kingdom': 'Великобритания', 'Великобритания': 'Великобритания',
  'Turkey': 'Турция', 'Турция': 'Турция',
  'China': 'Китай', 'Китай': 'Китай',
  'Ukraine': 'Украина', 'Украина': 'Украина',
  'Belarus': 'Беларусь', 'Беларусь': 'Беларусь',
  'United Arab Emirates': 'ОАЭ', 'ОАЭ': 'ОАЭ',
  'France': 'Франция', 'Польша': 'Польша',
  'India': 'Индия', 'South Korea': 'Южная Корея',
};

// Metrika returns Russian device names when account language = RU
const DEVICE_KEY_MAP = {
  'desktop': 'desktop', 'компьютеры': 'desktop',
  'mobile':  'mobile',  'мобильные телефоны': 'mobile',
  'tablet':  'tablet',  'планшеты': 'tablet',
  'tv':      'tv',      'тв': 'tv',
};

// Age labels
const AGE_LABELS = {
  'younger_18': 'до 18', '18_24': '18–24', '25_34': '25–34',
  '35_44': '35–44', '45_54': '45–54', 'older_55': '55+', 'unknown': 'Неизвестно',
};

const GENDER_LABELS = { 'male': 'Мужчины', 'female': 'Женщины', 'unknown': 'Неизвестно' };

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // "Online now" always comes from local heartbeat
  const localData = await readLocal();
  const now       = Date.now();
  const onlineNow = localData.filter(e => now - e.ts < 3 * 60 * 1000).length;

  const oauthToken = process.env.YANDEX_METRIKA_TOKEN;

  // ── No token → local analytics fallback ──────────────────────────────────
  if (!oauthToken) {
    const today  = localData.filter(e => e.ts >= startOf(now, 'day'));
    const week   = localData.filter(e => e.ts >= startOf(now, 'week'));
    const month  = localData.filter(e => e.ts >= startOf(now, 'month'));

    const chart = Array.from({ length: 7 }, (_, i) => {
      const d    = new Date(now); d.setDate(d.getDate() - (6 - i));
      const from = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const to   = from + 86400000;
      return {
        label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        count: localData.filter(e => e.ts >= from && e.ts < to).length,
      };
    });

    return NextResponse.json({
      source:    'local',
      onlineNow,
      today:     today.length,
      week:      week.length,
      month:     month.length,
      total:     localData.length,
      chart,
      countries: countBy(localData, 'country').slice(0, 15).map(({ key, count }) => ({
        code: key, name: COUNTRY_NAMES_LOCAL[key] || key, count,
      })),
      devices:   countBy(localData, 'device'),
      os:        countBy(localData, 'os'),
      browsers:  countBy(localData, 'browser'),
      pages:     countBy(localData, 'page').slice(0, 10),
      age:       [],
      gender:    [],
    });
  }

  // ── Yandex.Metrika path ───────────────────────────────────────────────────
  try {
    const ALL = { metrics: 'ym:s:visits', date1: '2000-01-01', date2: 'today' };

    const [
      todayVal, weekVal, monthVal, totalVal,
      chartResp, countriesResp, devicesResp, osResp, browsersResp, pagesResp,
      ageResp, genderResp,
    ] = await Promise.all([
      metrikaTotal(oauthToken, 'today',        'today'),
      metrikaTotal(oauthToken, daysAgo(6),     'today'),
      metrikaTotal(oauthToken, daysAgo(29),    'today'),
      metrikaTotal(oauthToken, '2000-01-01',   'today'),
      metrika(oauthToken, { metrics: 'ym:s:visits', date1: daysAgo(6), date2: 'today', group: 'day' }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:regionCountry',   limit: 15, sort: '-ym:s:visits' }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:deviceCategory',  limit: 10 }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:operatingSystem', limit: 10, sort: '-ym:s:visits' }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:browser',         limit: 10, sort: '-ym:s:visits' }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:startURL',        limit: 10, sort: '-ym:s:visits' }),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:ageInterval',     limit: 10 }).catch(() => ({ data: [] })),
      metrika(oauthToken, { ...ALL, dimensions: 'ym:s:gender',          limit: 5  }).catch(() => ({ data: [] })),
    ]);

    // 7-day chart from time-series response
    const intervals = chartResp.time_intervals || [];
    const values    = chartResp.data?.[0]?.metrics?.[0] || [];
    const chart = intervals.map((interval, i) => {
      const d = new Date(interval[0]);
      return {
        label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        count: Math.round(values[i] ?? 0),
      };
    });
    // Pad to 7 days if API returned fewer
    while (chart.length < 7) {
      const d = new Date(now); d.setDate(d.getDate() - (6 - chart.length));
      chart.unshift({ label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' }), count: 0 });
    }

    const countries = extractRows(countriesResp).map(({ key, count }) => ({
      code:  key.slice(0, 2).toUpperCase(),
      name:  COUNTRY_RU[key] || key,
      count,
    }));

    const devices = extractRows(devicesResp).map(({ key, count }) => ({
      key:   DEVICE_KEY_MAP[key.toLowerCase()] || key.toLowerCase(),
      count,
    }));

    const pages = extractRows(pagesResp).map(({ key, count }) => {
      try { return { key: new URL(key).pathname || '/', count }; }
      catch { return { key, count }; }
    });

    const age = extractRows(ageResp)
      .filter(r => r.key !== 'unknown')
      .map(({ key, count }) => ({ key: AGE_LABELS[key] || key, count }));

    const gender = extractRows(genderResp)
      .filter(r => r.key !== 'unknown')
      .map(({ key, count }) => ({ key: GENDER_LABELS[key.toLowerCase()] || key, count }));

    return NextResponse.json({
      source: 'yandex_metrika',
      onlineNow,
      today:     todayVal,
      week:      weekVal,
      month:     monthVal,
      total:     totalVal,
      chart,
      countries,
      devices,
      os:        extractRows(osResp),
      browsers:  extractRows(browsersResp),
      pages,
      age,
      gender,
    });
  } catch (e) {
    return NextResponse.json({ error: e.message, source: 'error' }, { status: 500 });
  }
}
