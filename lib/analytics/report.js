/**
 * The daily statistics message for Telegram.
 *
 * Pure: it takes the numbers and returns text, so the wording is tested
 * without sending anything (lib/crm/digest.js works the same way).
 *
 * It is written for a phone screen read once in the morning: the three
 * numbers that matter first, then where the people came from, then the week
 * for context. Everything else the owner can open in /admin → Статистика.
 */
import { CHANNEL_LABELS, topList, conversion } from './model.js';

const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

const DEVICE_LABELS = { mobile: 'телефон', desktop: 'компьютер', tablet: 'планшет' };

/** 2026-09-17 → «17.09, четверг». Parsed as UTC so the label cannot drift. */
export function formatDay(iso = '') {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${iso.slice(8)}.${iso.slice(5, 7)}, ${WEEKDAYS[d.getUTCDay()]}`;
}

/**
 * «42 (+7 ко вчера)» — the comparison is the whole point of a daily message:
 * a number on its own says nothing about whether the day was good.
 */
function withDelta(value, previous) {
  if (previous === null || previous === undefined) return String(value);
  const diff = value - previous;
  if (!diff) return `${value} (столько же)`;
  return `${value} (${diff > 0 ? '+' : '−'}${Math.abs(diff)} ко вчера)`;
}

const line = (rows, label = (k) => k) =>
  rows.map(r => `${label(r.key)} ${r.count}`).join(' · ');

/**
 * @param date     the day being reported, YYYY-MM-DD
 * @param day      that day's row from readStats()
 * @param previous the row before it, for the comparison (may be null)
 * @param week     merged totals of the seven days ending on `date`
 */
export function buildStatsReport({ date, day, previous = null, week = null } = {}) {
  const d = day || { visitors: 0, views: 0, leads: 0 };
  const visitors = d.visitors || 0;
  const views = d.views || 0;
  const leads = d.leads || 0;

  const head = `📊 ExpoContact — статистика за ${formatDay(date)}`;

  // A day with nothing on it is worth saying out loud. Zero visitors usually
  // means the site or the counter stopped, not that nobody came.
  if (!views) {
    return {
      text: `${head}\n\nЗа сутки не было ни одного визита.\nЕсли это не выходной простой — стоит проверить, открывается ли сайт.`,
      counts: { visitors: 0, views: 0, leads: 0 },
      empty: true,
    };
  }

  const parts = [head, ''];

  parts.push(`👥 Посетители: ${withDelta(visitors, previous ? previous.visitors || 0 : null)}`);
  parts.push(`👁 Просмотры: ${views}${visitors ? ` · ${(views / visitors).toFixed(1)} на человека` : ''}`);
  parts.push(`📩 Заявки: ${leads}${visitors ? ` · конверсия ${conversion(leads, visitors)}%` : ''}`);

  const channels = topList(d.channels, 4);
  if (channels.length) {
    parts.push('', `🚪 Каналы: ${line(channels, k => CHANNEL_LABELS[k] || k)}`);
  }

  const sources = topList(d.sources, 3);
  if (sources.length) parts.push(`🔗 Источники: ${line(sources)}`);

  const campaigns = topList(d.campaigns, 3);
  if (campaigns.length) parts.push(`📣 Кампании: ${line(campaigns)}`);

  const pages = topList(d.pages, 3);
  if (pages.length) parts.push(`📄 Страницы: ${line(pages)}`);

  const devices = topList(d.devices, 3);
  if (devices.length) parts.push(`📱 Устройства: ${line(devices, k => DEVICE_LABELS[k] || k)}`);

  const hours = d.hours || [];
  const peak = hours.reduce((best, v, h) => (v > hours[best] ? h : best), 0);
  if (hours[peak] > 0) {
    parts.push(`🕒 Пик: ${String(peak).padStart(2, '0')}:00 — ${hours[peak]} просмотров`);
  }

  if (week) {
    parts.push('', `За 7 дней: ${week.visitors} посетителей, ${week.leads} заявок, конверсия ${conversion(week.leads, week.visitors)}%`);
  }

  return {
    text: parts.join('\n'),
    counts: { visitors, views, leads },
    empty: false,
  };
}
