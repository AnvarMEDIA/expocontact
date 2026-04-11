/**
 * GET /api/analytics/stats  — protected (ADMIN_PASSWORD)
 * Returns aggregated analytics: online now, totals, countries, devices, OS, browsers, pages.
 */
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'content', 'data', 'analytics.json');

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

const COUNTRY_NAMES = {
  UZ:'Узбекистан', RU:'Россия', KZ:'Казахстан', KG:'Кыргызстан',
  TJ:'Таджикистан', TM:'Туркменистан', AZ:'Азербайджан', GE:'Грузия',
  DE:'Германия', US:'США', GB:'Великобритания', AE:'ОАЭ', TR:'Турция',
  CN:'Китай', IN:'Индия', FR:'Франция', IT:'Италия', PL:'Польша',
  UA:'Украина', BY:'Беларусь', MD:'Молдова', AM:'Армения',
  XX:'Неизвестно',
};

function countBy(arr, key) {
  const map = {};
  for (const item of arr) {
    const val = item[key] || 'Other';
    map[val] = (map[val] || 0) + 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ key: k, count: v }));
}

function startOf(ms, unit) {
  const d = new Date(ms);
  if (unit === 'day')  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (unit === 'week') {
    const day = d.getDay() || 7;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1).getTime();
  }
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
  return 0;
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let data = [];
  try {
    data = JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch { /* no file yet */ }

  const now      = Date.now();
  const online   = data.filter(e => now - e.ts < 3 * 60 * 1000);   // last 3 min
  const today    = data.filter(e => e.ts >= startOf(now, 'day'));
  const week     = data.filter(e => e.ts >= startOf(now, 'week'));
  const month    = data.filter(e => e.ts >= startOf(now, 'month'));

  // Build 7-day chart data
  const chart = Array.from({ length: 7 }, (_, i) => {
    const d    = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const from = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const to   = from + 86400000;
    return {
      label: d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'numeric' }),
      count: data.filter(e => e.ts >= from && e.ts < to).length,
    };
  });

  const countries = countBy(data, 'country').slice(0, 15).map(({ key, count }) => ({
    code: key,
    name: COUNTRY_NAMES[key] || key,
    count,
  }));

  return NextResponse.json({
    onlineNow:  online.length,
    today:      today.length,
    week:       week.length,
    month:      month.length,
    total:      data.length,
    chart,
    countries,
    devices:    countBy(data, 'device'),
    os:         countBy(data, 'os'),
    browsers:   countBy(data, 'browser'),
    pages:      countBy(data, 'page').slice(0, 10),
  });
}
