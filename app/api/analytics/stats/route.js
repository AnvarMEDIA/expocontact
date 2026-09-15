/**
 * GET /api/analytics/stats?days=30 — the numbers behind the Статистика screen.
 * Protected by ADMIN_PASSWORD, like every other admin endpoint.
 */
import { NextResponse } from 'next/server';
import { readStats } from '@/lib/analytics/store';

function checkAuth(request) {
  const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
  return token === (process.env.ADMIN_PASSWORD || 'admin123');
}

export async function GET(request) {
  if (!checkAuth(request))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const days = Number(new URL(request.url).searchParams.get('days')) || 30;

  try {
    return NextResponse.json(await readStats(days));
  } catch (err) {
    console.error('[analytics] stats failed:', err);
    return NextResponse.json({ error: err.message || 'Не удалось прочитать статистику' }, { status: 500 });
  }
}
