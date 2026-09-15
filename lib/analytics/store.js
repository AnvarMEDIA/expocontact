/**
 * Visitor statistics, stored in the same Redis as leads and projects.
 *
 * Why this exists at all: the old analytics wrote a JSON file with `fs`, which
 * on Vercel is read-only, so the write failed silently and production
 * collected nothing. Counters here are Redis hash increments — atomic, so two
 * visits in the same second both count.
 *
 * PRIVACY. No IP address and no user agent is ever stored. A visitor is
 * counted through a hash of (ip + user agent + a salt that changes every day),
 * kept only in a per-day set. Because the salt rotates at midnight the same
 * person gets a different hash tomorrow, so the data cannot be used to follow
 * anyone across days — it only answers "how many people today".
 *
 * Keys, all with a TTL so nothing accumulates forever:
 *   stats:d:<YYYY-MM-DD>       hash — the whole day, prefixed fields (model.js)
 *   stats:u:<YYYY-MM-DD>       set  — visitor hashes, for the unique count
 *   stats:on:<minute>          set  — who was here in that minute (5-minute TTL)
 */
import { createHash } from 'crypto';
import { kvHIncr, kvHGetAll, kvSAdd, kvSCard, kvSMembers, kvExpire } from '@/lib/kv';
import {
  F, explodeDay, mergeDays, parseDevice, classifySource, normalisePath, isBot,
} from './model.js';

const DAY_TTL = 400 * 24 * 3600;   // a bit over a year of history
const ONLINE_TTL = 6 * 60;         // online = seen in the last five minutes
const ONLINE_WINDOW = 5;

const dayKey    = (date) => `stats:d:${date}`;
const uniqKey   = (date) => `stats:u:${date}`;
const onlineKey = (minute) => `stats:on:${minute}`;

/** Calendar day in Tashkent — the same rule the CRM uses for its dates. */
export function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tashkent', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
}

function hourInTashkent(now = new Date()) {
  return Number(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent', hour: '2-digit', hour12: false,
  }).format(now));
}

const minuteStamp = (ms = Date.now()) => Math.floor(ms / 60000);

/**
 * The per-day salt. Derived, not stored: two requests arriving at once would
 * otherwise race to create it and split one visitor into two.
 */
function saltFor(date) {
  const secret = process.env.ANALYTICS_SALT || process.env.ADMIN_PASSWORD || 'expocontact';
  return createHash('sha256').update(`${date}|${secret}`).digest('hex');
}

/** Sixteen characters is plenty to tell visitors apart within one day. */
function visitorHash({ ip, ua, date }) {
  return createHash('sha256')
    .update(`${ip || ''}|${ua || ''}|${saltFor(date)}`)
    .digest('base64url')
    .slice(0, 16);
}

/**
 * Record one page view. Never throws: statistics must not be able to break a
 * page. Returns what was counted, which the tests read.
 */
export async function recordVisit({
  page, locale, referrer, marketing, ua, ip, country, host, beat = false, now = new Date(),
} = {}) {
  if (isBot(ua)) return { counted: false, reason: 'bot' };

  const date = today(now);
  const hash = visitorHash({ ip, ua, date });

  // A heartbeat only says "still here". Counting it as a page view would turn
  // one person reading for ten minutes into ten views.
  if (beat) {
    try {
      await kvSAdd(onlineKey(minuteStamp(now.getTime())), hash);
      await kvExpire(onlineKey(minuteStamp(now.getTime())), ONLINE_TTL);
      return { counted: false, reason: 'heartbeat' };
    } catch (err) {
      console.error('[analytics] heartbeat failed:', err.message);
      return { counted: false, reason: 'error' };
    }
  }
  const { device, os, browser } = parseDevice(ua);
  const { source, channel, campaign } = classifySource({ referrer, marketing, host });

  const key = dayKey(date);
  const fields = [
    [F.views, 1],
    [F.page(normalisePath(page)), 1],
    [F.source(source), 1],
    [F.channel(channel), 1],
    [F.device(device), 1],
    [F.os(os), 1],
    [F.browser(browser), 1],
    [F.country(String(country || 'XX').toUpperCase().slice(0, 2)), 1],
    [F.locale(String(locale || 'ru').slice(0, 5)), 1],
    [F.hour(hourInTashkent(now)), 1],
  ];
  if (campaign) fields.push([F.campaign(campaign), 1]);

  try {
    await Promise.all([
      ...fields.map(([field, by]) => kvHIncr(key, field, by)),
      kvSAdd(uniqKey(date), hash),
      kvSAdd(onlineKey(minuteStamp(now.getTime())), hash),
    ]);
    await Promise.all([
      kvExpire(key, DAY_TTL),
      kvExpire(uniqKey(date), DAY_TTL),
      kvExpire(onlineKey(minuteStamp(now.getTime())), ONLINE_TTL),
    ]);
    return { counted: true, date, source, channel, device };
  } catch (err) {
    console.error('[analytics] could not record a visit:', err.message);
    return { counted: false, reason: 'error', error: err.message };
  }
}

/** A submitted lead, counted on the day it arrived, for the conversion rate. */
export async function recordLead(now = new Date()) {
  try {
    const date = today(now);
    await kvHIncr(dayKey(date), F.leads, 1);
    await kvExpire(dayKey(date), DAY_TTL);
    return true;
  } catch (err) {
    console.error('[analytics] could not count a lead:', err.message);
    return false;
  }
}

/** How many distinct people are on the site right now. */
export async function onlineNow(now = new Date()) {
  const current = minuteStamp(now.getTime());
  const keys = Array.from({ length: ONLINE_WINDOW }, (_, i) => onlineKey(current - i));
  const lists = await Promise.all(keys.map(k => kvSMembers(k).catch(() => [])));
  return new Set(lists.flat()).size;
}

function dateRange(days, now = new Date()) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push(today(new Date(now.getTime() - i * 86400000)));
  }
  return out;
}

/**
 * The dashboard payload: one entry per day plus merged totals.
 * Reading N days costs N hash reads and N set counts, issued in parallel.
 */
export async function readStats(days = 30, now = new Date()) {
  const dates = dateRange(Math.min(Math.max(days, 1), 180), now);

  const rows = await Promise.all(dates.map(async (date) => {
    const [hash, visitors] = await Promise.all([
      kvHGetAll(dayKey(date)).catch(() => ({})),
      kvSCard(uniqKey(date)).catch(() => 0),
    ]);
    return { date, visitors, ...explodeDay(hash) };
  }));

  return {
    days: rows,
    totals: mergeDays(rows),
    online: await onlineNow(now),
    from: dates[0],
    to: dates[dates.length - 1],
  };
}
