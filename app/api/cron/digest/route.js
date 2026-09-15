/**
 * GET /api/cron/digest — the daily "what is burning" message to Telegram.
 *
 * Called by the Vercel cron declared in vercel.json, and by the «Отправить
 * сейчас» button in the admin panel with ?force=1.
 *
 * Authorisation, in order:
 *   - Vercel adds `Authorization: Bearer $CRON_SECRET` to scheduled calls when
 *     CRON_SECRET is set. That is the only way an unattended call gets in.
 *   - ADMIN_PASSWORD works too, for the manual button.
 *
 * With CRON_SECRET unset the scheduled call carries no header and is refused:
 * an open endpoint would let anyone on the internet spam the company chat. The
 * admin dashboard shows a red row until the variable exists.
 */
import { NextResponse } from 'next/server';
import { crmDashboard } from '@/lib/crm/store';
import { buildDigest } from '@/lib/crm/digest';
import { sendTelegram, telegramConfigured } from '@/lib/telegram';
import { kvGet, kvSet } from '@/lib/kv';
import { todayISO } from '@/lib/crm/model';

const STATE_KEY = 'crm:digest:state';

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
  const today = todayISO();
  const state = (await kvGet(STATE_KEY)) || {};

  const finish = async (result) => {
    await kvSet(STATE_KEY, { ...state, ...result, ranAt: Date.now(), ranBy: who });
    return NextResponse.json(result);
  };

  if (!telegramConfigured()) {
    return finish({ sent: false, reason: 'telegram-not-configured', today });
  }

  let digest;
  try {
    digest = buildDigest(await crmDashboard(today));
  } catch (err) {
    console.error('[digest] could not read projects:', err);
    return finish({ sent: false, reason: 'crm-unavailable', error: err.message, today });
  }

  // Nothing burning: stay quiet on the schedule, but answer the manual button
  // so pressing it always proves the delivery works.
  if (!digest) {
    if (!force) return finish({ sent: false, reason: 'quiet', today });
    const res = await sendTelegram(`✅ ExpoContact — на ${today} ничего не горит.\nПросроченных задач и проектов под риском нет.`);
    return finish({ sent: res.ok, reason: 'quiet-manual', error: res.ok ? null : (res.hint || res.description), today });
  }

  // The scheduler can retry a run; one digest a day is enough.
  if (!force && state.sentDate === today) {
    return finish({ sent: false, reason: 'already-sent-today', today });
  }

  const res = await sendTelegram(digest.text);
  if (!res.ok) {
    console.error('[digest] Telegram refused:', res.status, res.description);
    return finish({ sent: false, reason: 'telegram-failed', error: res.hint || res.description, today, counts: digest.counts });
  }

  return finish({ sent: true, reason: 'ok', today, sentDate: today, counts: digest.counts });
}
