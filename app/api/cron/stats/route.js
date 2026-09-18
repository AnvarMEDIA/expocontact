/**
 * GET /api/cron/stats — yesterday's visitor numbers, to the same Telegram chat
 * the leads go to.
 *
 * Declared in vercel.json at 19:05 UTC, which is 00:05 in Tashkent: the day
 * has just ended, so «вчера» is the whole day and nothing is still being
 * counted into it. The admin panel calls it with ?force=1.
 *
 * Authorisation matches /api/cron/digest: CRON_SECRET for the scheduler,
 * ADMIN_PASSWORD for the button. Without CRON_SECRET the scheduled call has no
 * credentials and is refused — an open endpoint would let anyone spam the chat.
 *
 * Unlike the digest this always sends. A digest that reports "нечего делать"
 * teaches everyone to ignore it; a daily report is read for the numbers, and
 * a day with no visits at all is itself the alarm.
 */
import { NextResponse } from 'next/server';
import { readStats, today } from '@/lib/analytics/store';
import { buildStatsReport } from '@/lib/analytics/report';
import { mergeDays } from '@/lib/analytics/model';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';
import { kvGet, kvSet } from '@/lib/kv';

const STATE_KEY = 'stats:report:state';
const WEEK = 7;

function authorise(request) {
  const header = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (header && cronSecret && header === cronSecret) return 'cron';
  if (header && header === adminPassword) return 'manual';
  return null;
}

export async function GET(request) {
  const who = authorise(request);
  if (!who) {
    return NextResponse.json({
      error: process.env.CRON_SECRET
        ? 'Unauthorized'
        : 'Не задан CRON_SECRET — расписание не сможет вызвать эту рассылку.',
    }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get('force') === '1';
  const now = new Date();
  const date = today(new Date(now.getTime() - 86400000));

  const state = (await kvGet(STATE_KEY)) || {};
  const finish = async (result) => {
    await kvSet(STATE_KEY, { ...state, ...result, ranAt: Date.now(), ranBy: who });
    return NextResponse.json(result);
  };

  if (!telegramConfigured()) {
    return finish({ sent: false, reason: 'telegram-not-configured', date });
  }

  // The scheduler can retry a run; one report per day is enough.
  if (!force && state.sentDate === date) {
    return finish({ sent: false, reason: 'already-sent', date });
  }

  let report;
  try {
    // Two extra days: one for the "ко вчера" comparison, the rest so the
    // seven-day line ends on the reported day and not on today.
    const stats = await readStats(WEEK + 2, now);
    const index = stats.days.findIndex(d => d.date === date);
    if (index < 0) throw new Error(`день ${date} не попал в выборку`);

    report = buildStatsReport({
      date,
      day: stats.days[index],
      previous: stats.days[index - 1] || null,
      week: mergeDays(stats.days.slice(Math.max(0, index - (WEEK - 1)), index + 1)),
    });
  } catch (err) {
    console.error('[stats-report] could not read the statistics:', err);
    return finish({ sent: false, reason: 'stats-unavailable', error: err.message, date });
  }

  const res = await sendTelegram(report.text);
  if (!res.ok) {
    console.error('[stats-report] Telegram refused:', res.status, res.description);
    return finish({
      sent: false, reason: 'telegram-failed',
      error: res.hint || res.description, date, counts: report.counts,
    });
  }

  return finish({ sent: true, reason: 'ok', date, sentDate: date, counts: report.counts });
}
