/**
 * POST /api/admin/telegram — Telegram self-test for the admin dashboard.
 *
 * Checks the bot token, the chat id and then sends a real test message, and
 * reports each step with the reason it failed. Nothing else on the site tells
 * an editor why leads are not arriving: the contact form only logs to the
 * Vercel function logs.
 *
 * Protected by ADMIN_PASSWORD.
 */
import { NextResponse } from 'next/server';
import { telegramDiagnose } from '@/lib/telegram';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function POST(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await telegramDiagnose());
}
